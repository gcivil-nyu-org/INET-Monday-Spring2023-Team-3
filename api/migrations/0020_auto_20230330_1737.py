# Generated by Django 2.2 on 2023-03-30 17:37

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("api", "0019_auto_20230330_1731"),
    ]

    operations = [
        migrations.AlterField(
            model_name="user",
            name="followed_by",
            field=models.TextField(blank=True, default=""),
        ),
        migrations.AlterField(
            model_name="user",
            name="follows",
            field=models.TextField(blank=True, default=""),
        ),
    ]
