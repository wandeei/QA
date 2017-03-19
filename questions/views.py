from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from django.core.exceptions import ObjectDoesNotExist
from django.http import JsonResponse
from django.shortcuts import render, redirect
from django.utils import timezone
from django.utils.datetime_safe import date, time
from django.views import View
from rest_framework.generics import ListAPIView, RetrieveAPIView
from rest_framework.response import Response
from rest_framework.views import APIView
from account.models import UserOtherDetails
from answers.models import Answer, UpVotes
from answers.serializers import AnswerSerializer

from questions.models import Question, QuestionTopic, QuestionFollowing
from questions.pagination import MyTestPagination, UserQuestionPagination, ExploreQuestionPagination
from .serializers import QuestionSerializer


class QuestionListAPIView(ListAPIView):
    queryset = Question.objects.all()
    serializer_class = QuestionSerializer
    pagination_class = MyTestPagination


class QuestionDetailsAPIView(RetrieveAPIView):
    queryset = Question.objects.all()
    serializer_class = QuestionSerializer


class QuestionListView(View):
    def get(self, request):
        pass

    def post(self, request):
        pass


class QuestionDetailView(View):
    def get(self, request, slug):
        question = Question.objects.get(slug=slug)
        question.no_of_views += 1
        question.save(force_update=True)
        topics = QuestionTopic.objects.filter(question=question)
        try:
            user_has_answered_question_already = Answer.objects.filter(
                writer=UserOtherDetails.objects.get(user=request.user), question=question)
        except:
            user_has_answered_question_already = None

        context = {'question': question, 'topics': topics,
                   'user_has_answered_question_already': user_has_answered_question_already, 'explore_active': 'active'}
        return render(request, 'question/question.html', context)

    def post(self, request):
        pass


class QuestionDetailAPIView(APIView):
    def get(self, request, slug):
        question = Question.objects.get(slug=slug)
        serializer = QuestionSerializer(question)
        return Response(serializer.data)

    def post(self, request):
        pass


class RelatedQuestionsView(View):
    def get(self, request):
        pass

    def post(self, request):
        pass


class QuestionCreateView(View):
    def get(self, request):
        return render(request, 'question/create_question.html')

    def post(self, request):
        title = request.POST['title']
        details = request.POST['details']
        author = request.user
        topic = ''
        date_asked = date.today()
        time_asked = timezone.now().time().strftime('%H:%M')

        question = Question()
        question.title = title
        question.question_details = details
        question.author = author
        question.date_asked = date_asked
        question.time_asked = time_asked

        question.save()

        write_profile = UserOtherDetails.objects.get(user=author)
        write_profile.no_of_questions += 1
        write_profile.save()

        topic = QuestionTopic.objects.filter(question=question)

        return redirect('/questions/' + str(question.slug))


class QuestionAnswers(APIView):
    def get(self, request, pk):
        answers = Answer.objects.filter(question=Question.objects.get(pk=pk))
        serializer = AnswerSerializer(answers, many=True)
        return Response(serializer.data)


class QuestionEditView(View):
    def get(self, request, slug):
        question = Question.objects.get(slug=slug)
        question.question_details = question.question_details
        return render(request, 'question/edit_question.html', {'question': question})

    def post(self, request, slug):
        title = request.POST['title']
        details = request.POST['details']

        question = Question.objects.get(slug=slug)
        question.title = title
        question.question_details = details

        question.save(force_update=True)

        return redirect('/questions/' + str(question.slug))


class UserQuestions(ListAPIView):
    pagination_class = UserQuestionPagination
    serializer_class = QuestionSerializer

    def get_queryset(self, *args, **kwargs):
        user = self.kwargs['username']
        try:
            q = Question.objects.filter(author=User.objects.get(username=user))
        except Question.DoesNotExist:
            q = None
        return q


class QuestionExploreAPI(ListAPIView):
    def get_queryset(self):
        u = UserOtherDetails.objects.get(user=self.request.user)
        aq = Answer.objects.filter(writer=u).values('question')
        q = Question.objects.all().exclude(pk__in=aq)
        return q

    serializer_class = QuestionSerializer
    pagination_class = ExploreQuestionPagination


class QuestionExploreView(View):
    def get(self, request):
        return render(request, 'question/explore.html', {'questions_active': 'active', 'explore_active': 'active'})


class FollowQuestion(View):
    def get(self, request):
        try:
            q = Question.objects.get(pk=request.GET.get('question'))
            q.no_following_quest += 1
            q.save()
            user = UserOtherDetails.objects.get(user=request.user)
            qf = QuestionFollowing(user=user, question=q)
            qf.save()
            return JsonResponse(True, safe=False)
        except ObjectDoesNotExist:
            return JsonResponse(False, safe=False)


class UnFollowQuestion(View):
    def get(self, request):
        try:
            q = Question.objects.get(pk=request.GET.get('question'))
            q.no_following_quest -= 1
            q.save()
            user = UserOtherDetails.objects.get(user=request.user)
            qf = QuestionFollowing.objects.get(user=user, question=q)
            qf.delete()
            return JsonResponse(True, safe=False)
        except ObjectDoesNotExist:
            return JsonResponse(False, safe=False)


class GetQuestionFollowers(ListAPIView):
    def get_queryset(self):
        try:
            q = Question.objects.get(pk=self.request.GET.get('question'))
            qf = QuestionFollowing.objects.filter(question=q).values('user')
            u = UserOtherDetails.objects.filter(pk__in=qf)
            return u
        except Exception:
            return None

    serializer_class = QuestionSerializer


class IsFollowingQuestion(View):
    def get(self, request):
        try:
            user = UserOtherDetails.objects.get(user=request.user)
            q = Question.objects.get(pk=request.GET.get('question'))
            qf = QuestionFollowing.objects.filter(user=user, question=q).exists()
            return JsonResponse(qf, safe=False)
        except ObjectDoesNotExist:
            return JsonResponse(False, safe=False)
