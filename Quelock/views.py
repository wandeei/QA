from django.contrib.auth.models import User
from django.http import HttpResponse, JsonResponse
from django.shortcuts import render
from django.views import View
from django.views.decorators.csrf import csrf_exempt
from rest_framework.generics import ListAPIView
from account.models import UserFollowings, UserOtherDetails
from questions.models import QuestionImageUpload
from topics.models import Topic
from topics.serializers import TopicSerializer


def user_profile(request, username):
    pass


def index(request):
    return render(request, 'home/index.html', {'feeds_active': 'active'})


@csrf_exempt
def upload(request):
    # folder = 'uploads'

    # uploaded_filename = request.FILES['image'].name
    uploaded_file = request.FILES['image']

    to_be_uploaded = QuestionImageUpload()
    to_be_uploaded.image = uploaded_file

    to_be_uploaded.save()
    image_url = to_be_uploaded.image.url

    return JsonResponse({'success': True, 'file': image_url})

    # try:
    #     os.mkdir(os.path.join(settings.PROJECT_DIR+'\\static\\images\\', folder))
    # except Exception as e:
    #     print(str(e))
    # full_filename = os.path.join(settings.PROJECT_DIR+'\\static\\images\\', folder, uploaded_filename)
    # fout = open(full_filename, 'wb+')
    #
    # for chunk in uploaded_file:
    #     fout.write(chunk)
    #
    # fout.close()
    # print(full_filename)
    # return JsonResponse({'success': True,
    #                      'file': settings.CURRENT_HOST + settings.UPLOADED_IMAGES_DIR + uploaded_filename})


class Follow(View):
    def post(self, request):
        user_that_clicked = request.user
        follows = request.GET.get('follows')
        user = User.objects.get(username=user_that_clicked)
        is_following = User.objects.get(pk=follows)
        user1 = UserOtherDetails.objects.get(user=user)
        user2 = UserOtherDetails.objects.get(user=is_following)
        user_following = UserFollowings(user=user1, is_following=user2)
        user_following.save()
        return JsonResponse(True, safe=False)


class UnFollow(View):
    def post(self, request):
        user_that_clicked = request.user
        follows = request.GET.get('follows')
        try:
            user1 = UserOtherDetails.objects.get(user=User.objects.get(username=user_that_clicked))
            user2 = UserOtherDetails.objects.get(user=User.objects.get(pk=follows))
            user_following = UserFollowings.objects.get(user=user1, is_following=user2)
            user_following.delete()
        except UserFollowings.DoesNotExist:
            user_following = None
        return JsonResponse(True, safe=False)


class IsFollowing(View):
    def post(self, request):
        user = request.user
        is_following = request.GET.get('is_following')
        try:
            user1 = UserOtherDetails.objects.get(user=User.objects.get(username=user))
            user2 = UserOtherDetails.objects.get(user=User.objects.get(pk=is_following))
            f = UserFollowings.objects.filter(user=user1, is_following=user2)
        except UserFollowings.DoesNotExist:
            f = None
        if f:
            return JsonResponse(True, safe=False)
        else:
            return JsonResponse(False, safe=False)
