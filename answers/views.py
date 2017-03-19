from django.contrib.auth.models import User
from django.db.models import F
from django.http import JsonResponse, HttpResponse
from django.shortcuts import render, redirect
from django.utils import timezone
from django.utils.datetime_safe import date
from django.views import View
from rest_framework.generics import ListAPIView
from rest_framework.response import Response
from rest_framework.views import APIView
from account.models import UserOtherDetails, UserFollowings, AlreadyReadAnswers
from answers.models import Answer, Bookmark, UpVotes, DownVotes
from answers.pagination import UserAnswerPagination, TrendingAnswersPagination
from answers.serializers import AnswerSerializer, BookmarkSerializer
from questions.models import Question


class AnswersAPIView(ListAPIView):
    queryset = Answer.objects.all()
    serializer_class = AnswerSerializer


class AnswerAPIView(View):
    def get(self, request, pk):
        answer = Answer.objects.get(pk=pk)
        answer.no_of_views += 1
        answer.save()
        try:
            b = Bookmark.objects.get(user=request.user, answer=answer)
            already_upvoted = UpVotes.objects.filter(user=request.user, answer=answer)
            already_downvoted = DownVotes.objects.filter(user=request.user, answer=answer)
        except:
            print('No such bookmark')
            b = None
            already_upvoted = None
            already_downvoted = None

        try:
            user1 = UserOtherDetails.objects.get(user=request.user)
            user2 = UserOtherDetails.objects.get(user=answer.writer.user)
            i = UserFollowings.objects.filter(user=user1, is_following=user2)
        except:
            i = None

        context = {'answer': answer, 'is_bookmarked': b, 'already_upvoted': already_upvoted,
                   'already_downvoted': already_downvoted, 'is_following': i, 'feeds_active': 'active'}
        return render(request, 'answers/answer.html', context)


class WriteAnswerView(View):
    def get(self, request, slug):
        page_title = 'Write Answer'
        question = Question.objects.get(slug=slug)
        return render(request, 'answers/create_answer.html', {'page_title': page_title, 'question': question})

    def post(self, request, slug):
        answer_question = Question.objects.get(slug=slug)

        body = request.POST['details']

        writer = UserOtherDetails.objects.get(user=request.user)

        date_written = date.today()
        time_written = timezone.now().time().strftime('%H:%M')
        question = answer_question

        answer = Answer()
        answer.question_string = answer_question.title
        answer.body = body
        answer.writer = writer
        answer.date_written = date_written
        answer.time_written = time_written
        answer.question = question
        answer.save()

        answer_question.no_of_answers += 1
        answer_question.save()

        writer.increase_no_of_answers()
        writer.save()

        return redirect('/questions/' + question.slug)


class EditAnswerView(View):
    def get(self, request):
        page_title = 'Edit Answer'
        answer = Answer.objects.get(pk=request.GET.get('answer'))
        return render(request, 'answers/edit_answer.html', {'page_title': page_title, 'answer': answer})

    def post(self, request):
        body = request.POST['details']
        answer = Answer.objects.get(pk=request.GET.get('answer'))
        answer.body = body
        answer.save()
        return redirect('/answers/' + str(answer.id))


class UserAnswersAPIView(APIView):
    def post(self, request, username):
        requested_user = UserOtherDetails.objects.get(user=User.objects.get(username=username))
        answers = Answer.objects.filter(writer=requested_user)
        ans_serializer = AnswerSerializer(answers, many=True)
        return Response(ans_serializer.data)


class UserAnswerAPIView(ListAPIView):
    serializer_class = AnswerSerializer
    pagination_class = UserAnswerPagination

    def get_queryset(self):
        user = UserOtherDetails.objects.get(user=User.objects.get(username=self.kwargs['username']))
        try:
            a = Answer.objects.filter(writer=user)
        except Answer.DoesNotExist:
            a = None
        return a


class DeleteAnswerView(View):
    def post(self, request):
        print(request.GET.get('answer'))
        answer_to_be_del = Answer.objects.get(pk=request.GET.get('answer'))
        answer_to_be_del.delete()

        answer_to_be_del.question.no_of_answers -= 1
        answer_to_be_del.save()

        return JsonResponse(True, safe=False)


class ArchivedAnswers(View):
    def get(self, request):
        try:
            b = Bookmark.objects.filter(user=request.user)
            return render(request, 'bookmarks/bookmarks.html', {'answers': b, 'archive_active': 'active'})
        except:
            b = None
        return HttpResponse('You have to log in to access this page bruhh')


class BookmarkAnswer(View):
    def post(self, request):
        b = Bookmark()
        b.user = request.user
        b.answer = Answer.objects.get(pk=request.GET.get('answer'))
        b.save()
        return JsonResponse(True, safe=False)


class UnBookmarkAnswer(View):
    def post(self, request):
        b = Bookmark.objects.get(user=request.user, answer=Answer.objects.get(pk=request.GET.get('answer')))
        b.delete()
        return JsonResponse(True, safe=False)


class CheckUpvoted(View):
    def post(self, request):
        a = Answer.objects.get(pk=request.GET.get('answer'))
        try:
            u = UpVotes.objects.get(answer=a, user=request.user)
        except:
            u = None
        if u is not None:
            return JsonResponse(True, safe=False)
        else:
            return JsonResponse(False, safe=False)


class CheckDownvoted(View):
    def post(self, request):
        a = Answer.objects.get(pk=request.GET.get('answer'))
        try:
            d = DownVotes.objects.get(answer=a, user=request.user)
        except:
            d = None
        if d is not None:
            return JsonResponse(True, safe=False)
        else:
            return JsonResponse(False, safe=False)


class Upvote(View):
    def post(self, request):
        a = Answer.objects.get(pk=request.GET.get('answer'))
        global reply
        if str(request.GET.get('action')) == 'upvote':
            u = UpVotes(answer=a, user=request.user)
            a.no_of_upvotes += 1
            a.save()
            u.save()
            reply = True
        if str(request.GET.get('action')) == 'r_upvote':
            u = UpVotes.objects.filter(answer=a, user=request.user)
            a.no_of_upvotes -= 1
            a.save()
            for i in u:
                i.delete()
            reply = True
        return JsonResponse(reply, safe=False)


class Downvote(View):
    def post(self, request):
        a = Answer.objects.get(pk=request.GET.get('answer'))
        global reply
        if str(request.GET.get('action')) == 'downvote':
            d = DownVotes(answer=a, user=request.user)
            a.no_of_downvotes += 1
            a.save()
            d.save()
            reply = True
        if str(request.GET.get('action')) == 'r_downvote':
            d = DownVotes.objects.filter(answer=a, user=request.user)
            a.no_of_downvotes -= 1
            a.save()
            for i in d:
                i.delete()
            reply = True
        return JsonResponse(reply, safe=False)


class CheckBookmarked(View):
    def post(self, request):
        try:
            b = Bookmark.objects.get(user=request.user, answer=Answer.objects.get(pk=request.GET.get('answer')))
        except:
            b = None
        if b is not None:
            return JsonResponse(True, safe=False)
        else:
            return JsonResponse(False, safe=False)


class TrendingAnswersByUpvotes(ListAPIView):
    def get_queryset(self):
        user = UserOtherDetails.objects.get(user=self.request.user)
        viewed_answers = AlreadyReadAnswers.objects.filter(user=user).values('answer')
        a = Answer.objects.all().order_by('-no_of_upvotes').exclude(pk__in=viewed_answers)
        return a

    serializer_class = AnswerSerializer


class TrendingAnswersByInteractions(ListAPIView):
    def get_queryset(self):
        user = UserOtherDetails.objects.get(user=self.request.user)
        viewed_answers = AlreadyReadAnswers.objects.filter(user=user).values('answer')
        a = Answer.objects.all().order_by((F('no_of_views') + F('no_of_comments') + F('no_of_upvotes')).desc()).exclude(
            pk__in=viewed_answers)[:150]
        return a

    serializer_class = AnswerSerializer
    pagination_class = TrendingAnswersPagination


class TrendingAnswersView(View):
    def get(self, request):
        return render(request, 'home/trending.html', {'trending_active': 'active'})
