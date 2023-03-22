# Generated by Django 4.1.6 on 2023-03-22 15:45

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("api", "0010_recoverrequest"),
    ]

    operations = [
        migrations.CreateModel(
            name="UserTest",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("username", models.TextField()),
                ("email", models.EmailField(max_length=254)),
                ("password", models.TextField()),
                ("verified", models.BooleanField(default=False)),
            ],
        ),
        migrations.AlterField(
            model_name="otp_request",
            name="id",
            field=models.BigAutoField(
                auto_created=True, primary_key=True, serialize=False, verbose_name="ID"
            ),
        ),
        migrations.AlterField(
            model_name="recoverrequest",
            name="id",
            field=models.BigAutoField(
                auto_created=True, primary_key=True, serialize=False, verbose_name="ID"
            ),
        ),
        migrations.AlterField(
            model_name="user",
            name="id",
            field=models.BigAutoField(
                auto_created=True, primary_key=True, serialize=False, verbose_name="ID"
            ),
        ),
    ]
