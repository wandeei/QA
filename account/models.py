from django.contrib.auth.models import User, AbstractUser
from django.db import models
from questions.models import Question
from topics.models import Topic


def calculate_to_k(number):
    no_of_fol = 0
    try:
        if number > 1000:
            no_of_fol = str(round(number / 1000, 1)) + 'k'
        else:
            no_of_fol = number
    except Exception as e:
        pass
    return no_of_fol


class UserOtherDetails(models.Model):
    user = models.OneToOneField(User, primary_key=True, on_delete=models.CASCADE)
    profile_no_of_views = models.IntegerField(null=True, default=0)
    display_picture = models.ImageField(default='/media/dps/user.png', upload_to='dps')
    bio = models.TextField()
    college = models.CharField(max_length=50, blank=True, default='NA')
    works = models.CharField(max_length=100, blank=True, default='NA')
    lives = models.CharField(max_length=50, blank=True, default='NA')
    followers = models.IntegerField(default=0)
    following = models.IntegerField(default=0)
    most_active_topic = models.ForeignKey(Topic, models.CASCADE, blank=True, null=True)
    facebook_link = models.URLField(max_length=100, blank=True, default='NA')
    twitter_link = models.URLField(max_length=100, blank=True, default='NA')
    linked_in_profile = models.URLField(max_length=100, blank=True, default='NA')
    no_of_questions = models.IntegerField(default=0)
    no_of_answers = models.IntegerField(default=0)

    def __str__(self):
        return self.user.username

    def set_dp_image(self, url):
        new_url = str(url).split('/')
        last_string = '/media/dps/' + new_url[len(new_url) - 1]
        return last_string

    def get_no_of_followers(self):
        user = UserOtherDetails.objects.get(user=self.user)
        u = UserFollowings.objects.filter(is_following=user)
        return calculate_to_k(len(u))

    def get_no_of_following(self):
        user = UserOtherDetails.objects.get(user=self.user)
        u = UserFollowings.objects.filter(user=user)
        return calculate_to_k(len(u))

    def increase_no_of_answers(self):
        self.no_of_answers += 1

    def get_dp_url(self):
        return self.display_picture.url

    def is_following(self, user, follows):
        user1 = UserOtherDetails.objects.get(user=user)
        user2 = UserOtherDetails.objects.get(user=follows)
        user_following = UserFollowings.objects.get(user=user1, is_following=user2)
        if user_following is not None:
            return True
        else:
            return False


class UserFollowings(models.Model):
    user = models.ForeignKey(UserOtherDetails, related_name='%(app_label)s_%(class)s_related', on_delete=models.CASCADE)
    is_following = models.ForeignKey(UserOtherDetails, related_name='%(app_label)s_%(class)s', on_delete=models.CASCADE)
    created = models.DateTimeField(null=True)

    def is_following_(self, user, follows):
        return self.objects.get(user=user, is_following=follows)


class AlreadyReadAnswers(models.Model):
    user = models.ForeignKey(UserOtherDetails, related_name='%(app_label)s_%(class)s_related', on_delete=models.CASCADE)
    answer = models.ForeignKey("answers.Answer", related_name='%(app_label)s_%(class)s_related', on_delete=models.CASCADE)
    created = models.DateTimeField
