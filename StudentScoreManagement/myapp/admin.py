from django.contrib import admin
from django.utils.safestring import mark_safe

from . import dao
from .models import User, Lesson, Grade, LessonGrades, ForumPost, SchoolEmail


class UserAdmin(admin.ModelAdmin):
    list_display = ['first_name', 'last_name', 'is_giangvien', 'is_sinhvien']
    search_fields = ['first_name', 'last_name', "ma_sinhvien", 'is_giangvien', 'is_sinhvien']
    list_filter = ['is_giangvien', 'is_sinhvien']



    def save_model(self, request, obj, form, change):
        # Mã hóa mật khẩu trước khi lưu người dùng vào cơ sở dữ liệu
        obj.set_password(obj.password)
        super().save_model(request, obj, form, change)


class UserAdminSite(admin.AdminSite):
    site_header = "HỆ THỐNG QUẢN LÝ ĐIỂM SINH VIÊN"


admin_site = UserAdminSite("myapp")


class GradeInline(admin.TabularInline):
    model = Grade
    extra = 1


class LessonAdmin(admin.ModelAdmin):
    list_display = ['name', 'get_teachers_names']
    search_fields = ['name', 'teachers__first_name']
    inlines = [GradeInline]

    def get_teachers_names(self, obj):
        return ", ".join([teacher.first_name for teacher in obj.teachers.all()])

    get_teachers_names.short_description = 'Teachers'


class GradeAdmin(admin.ModelAdmin):
    list_display = ('students', 'lessons', 'midterm_score', 'final_score', 'is_locked')
    search_fields = ['lessons__name']
    fieldsets = (
        (None, {
            'fields': ('students', 'lessons', 'midterm_score', 'final_score', 'is_locked')
        }),
        ('Extra Scores', {
            'fields': ('new_score_1', 'new_score_2', 'new_score_3', 'new_score_4', 'new_score_5'),
            'classes': ('collapse',)  # Mặc định sẽ các trường này
        })
    )

    def save_model(self, request, obj, form, change):
        obj.new_score_1 = form.cleaned_data['new_score_1']
        obj.new_score_2 = form.cleaned_data['new_score_2']
        obj.new_score_3 = form.cleaned_data['new_score_3']
        obj.new_score_4 = form.cleaned_data['new_score_4']
        obj.new_score_5 = form.cleaned_data['new_score_5']

        obj.save()


class LessonGradesAdmin(admin.ModelAdmin):
    list_display = ['lesson_name', 'total_grades']

    def lesson_name(self, obj):
        return obj.lesson.name

    def total_grades(self, obj):
        return obj.grades.count()


class ForumPostAdmin(admin.ModelAdmin):
    list_display = ['author', 'title']


admin_site.register(SchoolEmail)
admin_site.register(User, UserAdmin)
admin_site.register(Lesson, LessonAdmin)
admin_site.register(Grade, GradeAdmin)
admin_site.register(LessonGrades, LessonGradesAdmin)
admin_site.register(ForumPost, ForumPostAdmin)