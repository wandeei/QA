# -*- coding: utf-8 -*-
# Generated by Django 1.10.5 on 2017-03-11 21:42
from __future__ import unicode_literals

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('answers', '0015_auto_20170213_2212'),
        ('comments', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='comment',
            name='parent_answer',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='comment_ans', to='answers.Answer'),
        ),
    ]
