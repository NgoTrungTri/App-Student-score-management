from django.db import models
from django.contrib.auth.models import AbstractUser, UserManager


#ghi đè lại phương thức createsuperuser để khi tạo superuser thì is_giaovu của models User = True
class CustomUserManager(UserManager):
    def create_superuser(self, username, email=None, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_giaovu', True)  # Set is_giaovu to True for superuser

        return super().create_superuser(username, email, password, **extra_fields)


class User(AbstractUser):
    first_name = models.CharField(max_length=50, null=False)
    last_name = models.CharField(max_length=50, null=False)
    email = models.EmailField(unique=True)
    ma_sinhvien = models.CharField(max_length=20, unique=True, null=True, blank=True)
    avatar = models.ImageField(upload_to='user/%Y/%m', null=False, default='user/2024/02/capture.png')
    is_giaovu = models.BooleanField(default=False)
    is_giangvien = models.BooleanField(default=False)
    is_sinhvien = models.BooleanField(default=False)
    objects = CustomUserManager()

    def is_giao_vu(self):
        return self.is_giaovu

    def is_giang_vien(self):
        return self.is_giangvien

    def is_sinh_vien(self):
        return self.is_sinhvien

    def save(self, *args, **kwargs):
        # Kiểm tra xem tài khoản có phải là sinh viên không
        if self.is_sinh_vien:
            self.ma_sinhvien = self.ma_sinhvien
        else:
            # Nếu không phải là sinh viên, trường student_id sẽ là null
            self.ma_sinhvien = None

        super().save(*args, **kwargs)

    def __str__(self):
        return f'{self.first_name} {self.last_name}'


class Lesson(models.Model):
    name = models.CharField(max_length=100, null=False)
    description = models.TextField(null=True)
    created_date = models.DateTimeField(auto_now_add=True)
    updated_date = models.DateTimeField(auto_now=True)
    active = models.BooleanField(default=True)
    teachers = models.ManyToManyField(User, related_name='lesson_teach')
    students = models.ManyToManyField(User, related_name='courses_enrolled')

    def __str__(self):
        return self.name


#Model Grade -->có nghĩa là Lớp, dùng để lưu điểm của ...
class Grade(models.Model):
    name = models.CharField(null=False, max_length=100)
    students = models.ForeignKey(User, on_delete=models.CASCADE)
    lessons = models.ForeignKey(Lesson, on_delete=models.CASCADE)
    midterm_score = models.FloatField()
    final_score = models.FloatField()
    new_score_1 = models.FloatField(blank=True, null=True)
    new_score_2 = models.FloatField(blank=True, null=True)
    new_score_3 = models.FloatField(blank=True, null=True)
    new_score_4 = models.FloatField(blank=True, null=True)
    new_score_5 = models.FloatField(blank=True, null=True)
    is_locked = models.BooleanField(default=False)

    def student_name(self):
        return f'{self.students.first_name} {self.students.last_name}'

    def __str__(self):
        return self.name


class LessonGrades(models.Model):
    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE)
    grades = models.ManyToManyField(Grade)

    def __str__(self):
        return self.lesson.name