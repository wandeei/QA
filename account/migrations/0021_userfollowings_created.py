# -*- coding: utf-8 -*-
# Generated by Django 1.10.5 on 2017-02-22 11:19
from __future__ import unicode_literals

import datetime
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('account', '0020_auto_20170220_1427'),
    ]

    operations = [
        migrations.AddField(
            model_name='userfollowings',
            name='created',
            field=models.DateTimeField(default=datetime.datetime(2017, 2, 22, 11, 19, 42, 326544)),
        ),
    ]