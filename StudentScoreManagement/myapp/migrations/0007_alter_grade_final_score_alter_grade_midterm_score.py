# Generated by Django 5.0.1 on 2024-02-19 08:31

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('myapp', '0006_alter_user_avatar'),
    ]

    operations = [
        migrations.AlterField(
            model_name='grade',
            name='final_score',
            field=models.FloatField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='grade',
            name='midterm_score',
            field=models.FloatField(blank=True, null=True),
        ),
    ]
