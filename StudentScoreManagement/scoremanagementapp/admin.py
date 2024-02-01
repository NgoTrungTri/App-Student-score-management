from django.contrib import admin
from django.utils.safestring import mark_safe

from .models import User, Lesson, Grade, LessonGrades


class UserAdmin(admin.ModelAdmin):
    list_display = ['first_name', 'last_name', 'is_giangvien', 'is_sinhvien']
    readonly_fields = ['img']
    search_fields = ['first_name', 'last_name']
    list_filter = ['is_giangvien', 'is_sinhvien']

    def img(self, user):
        if user:
            return mark_safe(
                '<img src="/static/{url}" width="120" />'.format(url=user.avatar.name)
            )


class LessonAdmin(admin.ModelAdmin):
    list_display = ['name', 'get_teachers_names']
    search_fields = ['name', 'teachers__first_name']

    def get_teachers_names(self, obj):
        return ", ".join([teacher.first_name for teacher in obj.teachers.all()])

    get_teachers_names.short_description = 'Teachers'


class GradeAdmin(admin.ModelAdmin):
    list_display = ('name', 'students', 'lessons', 'midterm_score', 'final_score', 'is_locked')
    search_fields = ['lessons__name']
    fieldsets = (
        (None, {
            'fields': ('name', 'students', 'lessons', 'midterm_score', 'final_score', 'is_locked')
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



admin.site.register(User, UserAdmin)
admin.site.register(Lesson, LessonAdmin)
admin.site.register(Grade, GradeAdmin)
admin.site.register(LessonGrades, LessonGradesAdmin)