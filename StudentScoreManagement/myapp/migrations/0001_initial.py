# Generated by Django 5.0.1 on 2024-02-02 17:36

import django.contrib.auth.validators
import django.db.models.deletion
import django.utils.timezone
import myapp.models
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('auth', '0012_alter_user_first_name_max_length'),
    ]

    operations = [
        migrations.CreateModel(
            name='User',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('password', models.CharField(max_length=128, verbose_name='password')),
                ('last_login', models.DateTimeField(blank=True, null=True, verbose_name='last login')),
                ('is_superuser', models.BooleanField(default=False, help_text='Designates that this user has all permissions without explicitly assigning them.', verbose_name='superuser status')),
                ('username', models.CharField(error_messages={'unique': 'A user with that username already exists.'}, help_text='Required. 150 characters or fewer. Letters, digits and @/./+/-/_ only.', max_length=150, unique=True, validators=[django.contrib.auth.validators.UnicodeUsernameValidator()], verbose_name='username')),
                ('is_staff', models.BooleanField(default=False, help_text='Designates whether the user can log into this admin site.', verbose_name='staff status')),
                ('is_active', models.BooleanField(default=True, help_text='Designates whether this user should be treated as active. Unselect this instead of deleting accounts.', verbose_name='active')),
                ('date_joined', models.DateTimeField(default=django.utils.timezone.now, verbose_name='date joined')),
                ('first_name', models.CharField(max_length=50)),
                ('last_name', models.CharField(max_length=50)),
                ('email', models.EmailField(max_length=254, unique=True)),
                ('ma_sinhvien', models.CharField(blank=True, max_length=20, null=True, unique=True)),
                ('avatar', models.ImageField(default='user/2024/02/capture.png', upload_to='user/%Y/%m')),
                ('is_giaovu', models.BooleanField(default=False)),
                ('is_giangvien', models.BooleanField(default=False)),
                ('is_sinhvien', models.BooleanField(default=False)),
                ('groups', models.ManyToManyField(blank=True, help_text='The groups this user belongs to. A user will get all permissions granted to each of their groups.', related_name='user_set', related_query_name='user', to='auth.group', verbose_name='groups')),
                ('user_permissions', models.ManyToManyField(blank=True, help_text='Specific permissions for this user.', related_name='user_set', related_query_name='user', to='auth.permission', verbose_name='user permissions')),
            ],
            options={
                'verbose_name': 'user',
                'verbose_name_plural': 'users',
                'abstract': False,
            },
            managers=[
                ('objects', myapp.models.CustomUserManager()),
            ],
        ),
        migrations.CreateModel(
            name='Lesson',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100)),
                ('description', models.TextField(null=True)),
                ('created_date', models.DateTimeField(auto_now_add=True)),
                ('updated_date', models.DateTimeField(auto_now=True)),
                ('active', models.BooleanField(default=True)),
                ('students', models.ManyToManyField(related_name='lesson_enrolled', to=settings.AUTH_USER_MODEL)),
                ('teachers', models.ManyToManyField(related_name='lesson_teach', to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='Grade',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100)),
                ('midterm_score', models.FloatField()),
                ('final_score', models.FloatField()),
                ('new_score_1', models.FloatField(blank=True, null=True)),
                ('new_score_2', models.FloatField(blank=True, null=True)),
                ('new_score_3', models.FloatField(blank=True, null=True)),
                ('new_score_4', models.FloatField(blank=True, null=True)),
                ('new_score_5', models.FloatField(blank=True, null=True)),
                ('is_locked', models.BooleanField(default=False)),
                ('students', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
                ('lessons', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='myapp.lesson')),
            ],
        ),
        migrations.CreateModel(
            name='LessonGrades',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('grades', models.ManyToManyField(to='myapp.grade')),
                ('lesson', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='myapp.lesson')),
            ],
        ),
    ]