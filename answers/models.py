from django.contrib.auth.models import User
from django.core.exceptions import ObjectDoesNotExist
from django.db import models
from account.models import UserOtherDetails
from comments.models import Comment
from questions.models import Question
from topics.models import Topic


class Answer(models.Model):
    question = models.ForeignKey(Question, on_delete=models.CASCADE, null=True)
    writer = models.ForeignKey(UserOtherDetails, on_delete=models.SET('Anonymous'), null=True)
    date_written = models.DateField()
    time_written = models.TimeField()
    body = models.TextField()
    no_of_upvotes = models.IntegerField(null=True, default=0)
    no_of_downvotes = models.IntegerField(null=True, default=0)
    no_of_views = models.IntegerField(null=True, default=0)
    no_of_comments = models.IntegerField(null=True, default=0)
    edited = models.IntegerField(null=True, default=0)

    def __str__(self):
        return self.question.title

    def getComments(self):
        try:
            c = Comment.objects.filter(parent_answer=self)
            return c.count()
        except Exception as e:
            print(e)


class UpVotes(models.Model):
    answer = models.ForeignKey(Answer, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)


class DownVotes(models.Model):
    answer = models.ForeignKey(Answer, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)


class Bookmark(models.Model):
    answer = models.ForeignKey(Answer, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
