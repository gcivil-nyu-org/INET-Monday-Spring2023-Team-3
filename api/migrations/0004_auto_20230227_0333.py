# Generated by Django 2.2 on 2023-02-27 03:33

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("api", "0003_auto_20230227_0331"),
    ]

    operations = [
        migrations.AlterField(
            model_name="user",
            name="id",
            field=models.AutoField(primary_key=True, serialize=False),
        ),
    ]
