from django.core.exceptions import ObjectDoesNotExist
from django.core.mail import send_mail
from django.db.models import Q
from django.db.models import F, Value
from django.db.models.functions import Concat
from django.http import HttpResponse
from rest_framework import viewsets, permissions, generics, parsers, status
from rest_framework.response import Response
from . import serializers
from .models import Lesson, User, Grade, LessonGrades, ForumPost, SchoolEmail
from .serializers import (LessonSerializer, GradeSerializer, LessonGradeSerializer,
                          UserSerializer, ForumPostSerializer, StudentSerializer)
from rest_framework.decorators import action

#các thư viện liên quan tới csv và pdf
import csv
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Table


class UserViewSet(viewsets.ViewSet, generics.RetrieveAPIView, generics.UpdateAPIView, generics.ListAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    parser_classes = [parsers.MultiPartParser]
    def get_permissions(self):
        if self.action.__eq__('current_user'):
            return [permissions.IsAuthenticated()]

        return [permissions.AllowAny()]

    #lấy thong tin của người dùng đang đăng nhập
    @action(methods=['get'], detail=False)
    def current_user(self, request):
        return Response(serializers.UserSerializer(request.user).data)

    def get_queryset(self):
        queries = self.queryset

        q = self.request.query_params.get("q")
        if q:
            queries = queries.filter(ma_sinhvien__icontains=q)

        return queries

    @action(detail=False, methods=['post'])
    def register(self, request):
        email = request.data.get('email', None)
        username = request.data.get('username', None)
        password = request.data.get('password', None)
        avatar = request.data.get('avatar', None)

        if email is None:
            return Response({"message": "Email không được để trống"}, status=status.HTTP_400_BAD_REQUEST)

        # Kiểm tra xem email đã được cấp bởi trường hay không
        try:
            school_email = SchoolEmail.objects.get(email=email)
        except SchoolEmail.DoesNotExist:
            return Response({"message": "Email không hợp lệ"}, status=status.HTTP_400_BAD_REQUEST)

        user, created = User.objects.get_or_create(email=email)

        if created:
            school_email = SchoolEmail.objects.get(email=email)
            # Nếu user mới được tạo, thiết lập thông tin từ SchoolEmail
            user.username = username
            user.set_password(password)
            user.first_name = school_email.first_name
            user.last_name = school_email.last_name
            user.ma_sinhvien = school_email.ma_sinhvien
            user.is_sinhvien = True
            user.avatar = avatar
            user.save()

            return Response({"message": "Đăng ký tài khoản thành công"}, status=status.HTTP_201_CREATED)
        else:
            return Response({"message": "Tài khoản đã tồn tại"}, status=status.HTTP_400_BAD_REQUEST)


class LessonViewSet(viewsets.ViewSet, generics.ListAPIView):
    queryset = Lesson.objects.filter(active=True)
    serializer_class = LessonSerializer

    #lấy danh sách môn học mà giảng viên đang đăng nhập dạy
    @action(methods=['get'], detail=True)
    def teacher_lessons(self, request, pk):
        try:
            # Tìm kiếm giảng viên trong hệ thống dựa vào pk
            teacher_lessons = Lesson.objects.filter(teachers__id=pk)
            # Serialize danh sách môn học
            serializer = self.get_serializer(teacher_lessons, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Lesson.DoesNotExist:
            return Response({"message": "Teacher not found"}, status=status.HTTP_404_NOT_FOUND)

    # lấy danh sách môn học cuar sinh vien
    @action(methods=['get'], detail=True)
    def student_lessons(self, request, pk):
        try:
            # Tìm kiếm sinh viên trong hệ thống dựa vào pk
            student_lessons = Lesson.objects.filter(students__ma_sinhvien=pk)
            # Serialize danh sách môn học
            serializer = self.get_serializer(student_lessons, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Lesson.DoesNotExist:
            return Response({"message": "not found"}, status=status.HTTP_404_NOT_FOUND)

    # #lấy danh sách sinh viên trong môn học
    # @action(detail=True, methods=['get'])
    # def list_students(self, request, pk):
    #     try:
    #         lesson = self.queryset.get(pk=pk)
    #         students = lesson.students.all()  # Lấy tất cả học sinh thuộc môn học
    #         serializer = StudentSerializer(students, many=True)  # Serialize danh sách học sinh
    #         return Response(serializer.data)
    #     except Lesson.DoesNotExist:
    #         return Response({"message": "Lesson not found"}, status=status.HTTP_404_NOT_FOUND)

    # API lấy lessongrade id của lesson
    @action(detail=True, methods=['get'])
    def get_lesson_grade_id(self, request, pk=None):
        try:
            lesson_grade = LessonGrades.objects.get(lesson_id=pk)
            lesson_grade_id = lesson_grade.id
            return Response({'lesson_grade_id': lesson_grade_id}, status=status.HTTP_200_OK)
        except LessonGrades.DoesNotExist:
            return Response({'error': 'LessonGrade not found'}, status=status.HTTP_404_NOT_FOUND)


class GradeViewSet(viewsets.ViewSet, generics.ListAPIView):
    queryset = Grade.objects.all()
    serializer_class = GradeSerializer

    def get_queryset(self):
        queries = self.queryset

        q = self.request.query_params.get("q")
        if q:
            queries = queries.filter(
                Q(name__icontains=q) |
                Q(students__first_name__icontains=q) |
                Q(students__last_name__icontains=q) |
                Q(students__ma_sinhvien__icontains=q)
            )
        return queries

    @action(detail=True, methods=['put'])
    def enter_score(self, request, pk=None):
        try:
            # Lấy dữ liệu từ request
            data = request.data

            # Lấy tất cả bảng điểm thuộc lớp có id = pk
            grades = Grade.objects.filter(lessons=pk)

            # Kiểm tra xem dữ liệu có đầy đủ không
            if 'students' not in data:
                return Response({"message": "Missing required fields"}, status=status.HTTP_400_BAD_REQUEST)

            # Lấy thông tin sinh viên từ dữ liệu
            student_data = data.get('students')

            # Tìm bảng điểm tương ứng trong các bảng điểm của grades

            # Tìm sinh viên trong bảng điểm
            grade, _ = Grade.objects.get_or_create(
                lessons_id=pk,
                students__first_name=student_data['first_name'],
                students__last_name=student_data['last_name'],
            )

            # Cập nhật điểm cho bảng điểm
            serializer = GradeSerializer(grade, data=data)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

            # Nếu không tìm thấy sinh viên trong bất kỳ bảng điểm nào
            return Response({"message": "Student not found in any grade"}, status=status.HTTP_404_NOT_FOUND)

        except Exception as e:
            return Response({"message": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(methods=['post'], detail=True)
    def lock_score(self, request, pk):
        try:
            grade = self.get_object()  # Lấy Grade từ pk
            grade.is_locked = True  # Cập nhật is_lock thành True
            grade.save()  # Lưu lại các thay đổi vào cơ sở dữ liệu
            return Response({'message': 'Cập nhật is_lock thành công'}, status=status.HTTP_200_OK)
        except Grade.DoesNotExist:
            return Response({'message': 'Grade không tồn tại'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class LessonGradeViewSet(viewsets.ViewSet, generics.ListAPIView):
    queryset = LessonGrades.objects.all()
    serializer_class = LessonGradeSerializer

    #API lấy nguyên danh sách của một lớp, gồm tên và các cột điểm
    @action(detail=True, methods=['get'])
    def my_class(self, request, pk=None):
        try:
            lesson_grade = self.get_object()  # Lấy đối tượng LessonGrade từ pk
            students = lesson_grade.grades.all()  # Lấy tất cả sinh viên trong lớp
            student_data = []  # Danh sách dữ liệu sinh viên

            for grade in lesson_grade.grades.all():
                student_info = {
                    'student_id': grade.students.id,
                    'student_first_name': {grade.students.first_name},
                    'student_last_name': {grade.students.last_name},
                    # 'student_name': f"{grade.students.first_name} {grade.students.last_name}",
                    'midterm_score': grade.midterm_score,
                    'final_score': grade.final_score,
                    'new_score_1': grade.new_score_1,
                    'new_score_2': grade.new_score_2,
                    'new_score_3': grade.new_score_3,
                    'new_score_4': grade.new_score_4,
                    'new_score_5': grade.new_score_5,
                }
                student_data.append(student_info)

            return Response(student_data)  # Trả về danh sách sinh viên
        except LessonGrades.DoesNotExist:
            return Response({'message': 'LessonGrade not found'}, status=status.HTTP_404_NOT_FOUND)

    # Tìm kiếm sinh viên để xem điểm dựa trên tên hoặc mssv
    @action(methods=['get'], detail=True)
    def search_student(self, request, pk=None):
        try:
            # Lấy đối tượng LessonGrades dựa trên pk (lessongrade_id)
            lesson_grade = LessonGrades.objects.get(pk=pk)
            lesson_id = lesson_grade.lesson.pk
            # Lấy tham số truy vấn từ request
            student_id = request.query_params.get('student_id')
            student_name = request.query_params.get('student_name')

            # Truy vấn bảng điểm dựa trên lessongrade_id và các tham số truy vấn
            if student_id:
                grades = Grade.objects.filter(lessons=lesson_id, students__ma_sinhvien=student_id)
            elif student_name:
                grades = Grade.objects.filter(lessons=lesson_id, students__first_name__icontains=student_name) | \
                         Grade.objects.filter(lessons=lesson_id, students__last_name__icontains=student_name)
            else:
                return Response({'error': 'Provide either student_id or student_name'},
                                status=status.HTTP_400_BAD_REQUEST)

            # Chuyển đổi dữ liệu thành định dạng JSON
            serializer = GradeSerializer(grades, many=True)

            # Trả về dữ liệu
            return Response(serializer.data, status=status.HTTP_200_OK)
        except LessonGrades.DoesNotExist:
            return Response({'error': f'LessonGrades with id {pk} does not exist'},
                            status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    # Xuất bảng điểm thành file csv
    @action(detail=True, methods=['get'])
    def export_csv(self, request, pk):
        try:
            lesson_grade = LessonGrades.objects.get(pk=pk)
        except LessonGrades.DoesNotExist:
            return Response({"message": "Lesson Grade not found."}, status=status.HTTP_404_NOT_FOUND)

        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = f'attachment; filename="score_{pk}.csv"'

        writer = csv.writer(response)
        writer.writerow([
            'Student First Name', 'Student Last Name', 'Midterm Score', 'Final Score',
            'New Score 1', 'New Score 2', 'New Score 3', 'New Score 4', 'New Score 5'
        ])

        for lesson_grade in LessonGrades.objects.filter(pk=pk):
            for grade in lesson_grade.grades.all():
                writer.writerow([
                    grade.students.first_name, grade.students.last_name,
                    grade.midterm_score, grade.final_score,
                    grade.new_score_1, grade.new_score_2,
                    grade.new_score_3, grade.new_score_4,
                    grade.new_score_5
                ])

        return response

    #Xuất bảng điểm thành file pdf
    @action(detail=True, methods=['get'])
    def export_pdf(self, request, pk):
        try:
            lesson_grade = LessonGrades.objects.get(pk=pk)
        except LessonGrades.DoesNotExist:
            return Response({"message": "Lesson Grade not found."}, status=status.HTTP_404_NOT_FOUND)

        response = HttpResponse(content_type='application/pdf')
        response['Content-Disposition'] = 'attachment; filename="score.pdf"'

        # Tạo một đối tượng PDF
        pdf = SimpleDocTemplate(response, pagesize=letter)
        elements = []

        # Dữ liệu cho bảng PDF
        data = []
        data.append(['Ho', 'Ten',
                     'Giua ky', 'Cuoi Ky', 'Cot diem 1', 'Cot diem 2',
                     'Cot diem 3', 'Cot diem 4', 'Cot diem 5'])

        # Lấy dữ liệu từ cơ sở dữ liệu và thêm vào danh sách dữ liệu
        lesson_grades = LessonGrades.objects.filter(pk=pk)
        for lesson_grade in lesson_grades:
            for grade in lesson_grade.grades.all():
                data.append([
                    grade.students.first_name, grade.students.last_name,
                    grade.midterm_score, grade.final_score,
                    grade.new_score_1, grade.new_score_2,
                    grade.new_score_3, grade.new_score_4,
                    grade.new_score_5
                ])
        # Tạo bảng PDF từ dữ liệu
        table = Table(data)
        # Thêm bảng vào danh sách các phần tử của PDF
        elements.append(table)
        # Xuất PDF
        pdf.build(elements)
        return response

    #Đọc điểm từ file csv
    @action(methods=['post'], detail=True)
    def input_csv(self, request, pk):
        if 'file' not in request.FILES:
            return Response({"message": "No CSV file attached"}, status=status.HTTP_400_BAD_REQUEST)

        csv_file = request.FILES['file']

        try:
            decoded_file = csv_file.read().decode('utf-8').splitlines()
            reader = csv.DictReader(decoded_file)

            for row in reader:
                first_name = row['Student First Name']
                last_name = row['Student Last Name']
                lesson_grade = LessonGrades.objects.get(pk=pk)
                lesson_name = lesson_grade.lesson.name
                try:
                    grade = Grade.objects.get(
                        students__first_name=first_name,
                        students__last_name=last_name,
                        lessons__name=lesson_name,
                    )

                    # Cập nhật thông tin điểm số
                    grade.midterm_score = row['Midterm Score']
                    grade.final_score = row['Final Score']
                    grade.new_score_1 = row['New Score 1'] or None
                    grade.new_score_2 = row['New Score 2'] or None
                    grade.new_score_3 = row['New Score 3'] or None
                    grade.new_score_4 = row['New Score 4'] or None
                    grade.new_score_5 = row['New Score 5'] or None
                    grade.save()

                except ObjectDoesNotExist:
                    # Nếu không tìm thấy, tạo một Grade mới
                    Grade.objects.create(
                        students__first_name=first_name,
                        students__last_name=last_name,
                        lessons__name=lesson_name,
                        midterm_score=row['Midterm Score'],
                        final_score=row['Final Score'],
                        new_score_1=row['New Score 1'],
                        new_score_2=row['New Score 2'],
                        new_score_3=row['New Score 3'],
                        new_score_4=row['New Score 4'],
                        new_score_5=row['New Score 5']
                    )

            return Response({"message": "Grades imported successfully"}, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({"message": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ForumPostViewSet(viewsets.ViewSet, generics.ListAPIView, generics.CreateAPIView):
    queryset = ForumPost.objects.all()
    serializer_class = ForumPostSerializer

    @action(detail=False, methods=['post'])
    def create_forum_post(self, request):
        try:
            # Lấy dữ liệu từ request để tạo bài đăng mới
            data = request.data
            # Tạo serializer với dữ liệu từ request
            serializer = ForumPostSerializer(data=data)
            if serializer.is_valid():
                # Lưu bài đăng mới vào cơ sở dữ liệu
                serializer.save()
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            # Trả về lỗi nếu dữ liệu không hợp lệ
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            # Xử lý các trường hợp ngoại lệ
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
