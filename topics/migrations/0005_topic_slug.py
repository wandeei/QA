# -*- coding: utf-8 -*-
# Generated by Django 1.10.5 on 2017-02-09 14:55
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('topics', '0004_auto_20170127_0506'),
    ]

    operations = [
        migrations.AddField(
            model_name='topic',
            name='slug',
            field=models.SlugField(max_length=100, null=True, unique=True),
        ),
    ]
