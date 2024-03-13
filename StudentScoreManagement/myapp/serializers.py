from rest_framework import serializers
from rest_framework.fields import SerializerMethodField
from rest_framework.serializers import ModelSerializer
from .models import User, Lesson, Grade, LessonGrades, ForumPost


class UserSerializer(ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'first_name', 'last_name', 'ma_sinhvien', 'avatar', 'email', 'username', 'password','is_giangvien', 'is_sinhvien']
        extra_kwargs = {
            'password': {
                'write_only': True
            }
        }

    def create(self, validated_data):
        data = validated_data.copy()
        user = User(**data)
        user.set_password(data['password'])
        user.save()

        return user


#Lấy thông tin sinh viên
class StudentSerializer(ModelSerializer):
    class Meta:
        model = User
        fields = ['first_name', 'last_name']



class LessonSerializer(ModelSerializer):
    teachers = UserSerializer(many=True)
    class Meta:
        model = Lesson
        fields = ['id', 'name', 'description', 'created_date', 'teachers', 'avatar', 'active']


class GradeSerializer(ModelSerializer):
    students = StudentSerializer(read_only=True)

    class Meta:
        model = Grade
        fields = ['students', 'midterm_score', 'final_score',
                  "new_score_1", "new_score_2", "new_score_3", "new_score_4", "new_score_5"]


class LessonGradeSerializer(ModelSerializer):
    lesson = LessonSerializer()
    grades = GradeSerializer(many=True)

    class Meta:
        model = LessonGrades
        fields = ['lesson', 'grades']


class ForumPostSerializer(ModelSerializer):
    author = StudentSerializer(read_only=True)
    class Meta:
        model = ForumPost
        fields = ['title', 'content', 'author', 'updated_date', 'created_date']
