# -*- coding: utf-8 -*-
# Generated by Django 1.10.5 on 2017-02-12 23:21
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('account', '0017_auto_20170212_2055'),
    ]

    operations = [
        migrations.AlterField(
            model_name='userotherdetails',
            name='facebook_link',
            field=models.URLField(blank=True, default='NA', max_length=100),
        ),
        migrations.AlterField(
            model_name='userotherdetails',
            name='linked_in_profile',
            field=models.URLField(blank=True, default='NA', max_length=100),
        ),
        migrations.AlterField(
            model_name='userotherdetails',
            name='twitter_link',
            field=models.URLField(blank=True, default='NA', max_length=100),
        ),
    ]
