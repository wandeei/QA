# -*- coding: utf-8 -*-
# Generated by Django 1.10.5 on 2017-02-09 14:55
from __future__ import unicode_literals

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('answers', '0009_answer_writer_string'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='answer',
            name='question_string',
        ),
        migrations.RemoveField(
            model_name='answer',
            name='writer_string',
        ),
    ]
