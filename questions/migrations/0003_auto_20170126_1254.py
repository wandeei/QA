# -*- coding: utf-8 -*-
# Generated by Django 1.10.5 on 2017-01-26 12:54
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('questions', '0002_auto_20170126_1249'),
    ]

    operations = [
        migrations.AlterField(
            model_name='question',
            name='title',
            field=models.CharField(max_length=150),
        ),
    ]
