# Generated by Django 2.2 on 2023-03-06 07:39

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("api", "0008_auto_20230306_0653"),
    ]

    operations = [
        migrations.AddField(
            model_name="otp_request",
            name="tries",
            field=models.IntegerField(default=0),
        ),
    ]