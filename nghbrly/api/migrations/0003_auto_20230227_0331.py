# Generated by Django 2.2 on 2023-02-27 03:31

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("api", "0002_auto_20230227_0326"),
    ]

    operations = [
        migrations.AlterField(
            model_name="user",
            name="id",
            field=models.AutoField(
                auto_created=True, primary_key=True, serialize=False, verbose_name="ID"
            ),
        ),
    ]