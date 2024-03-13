from .models import User, Lesson, Grade, LessonGrades
from django.db.models import Count

def get_student_lessons_by_ma_sinhvien(ma_sinhvien):
    #nếu tồn tại sinh viên
    try:
        student = User.objects.get(ma_sinhvien=ma_sinhvien, is_sinhvien=True)
        return student
    except User.DoesNotExist:
        return None

def load_lesson(params={}):
    q = Lesson.objects.filter(active=True)

    kw = params.get('kw')
    if kw:
        q = q.filter(name__icontains=kw)

    return q


def count_lesson():
    return Lesson.objects.annotate(count=Count('lesson__id')).values("id", "name", "count").order_by('-count')