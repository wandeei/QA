from django.conf.urls import url
from answers.views import AnswerAPIView, EditAnswerView, AnswersAPIView, DeleteAnswerView, \
    BookmarkAnswer, UnBookmarkAnswer, CheckUpvoted, Downvote, Upvote, CheckDownvoted, CheckBookmarked, ArchivedAnswers, \
    UserAnswerAPIView, TrendingAnswersByUpvotes, TrendingAnswersByInteractions

urlpatterns = [
    url(r'^$', AnswersAPIView.as_view()),
    url(r'^delete/', DeleteAnswerView.as_view()),
    url(r'^edit/$', EditAnswerView.as_view()),
    url(r'^archived/$', ArchivedAnswers.as_view(), name='archived'),
    url(r'^check_if_bookmarked/', CheckBookmarked.as_view()),
    url(r'^bookmark_answer/', BookmarkAnswer.as_view()),
    url(r'^un_bookmark_answer/', UnBookmarkAnswer.as_view()),
    url(r'^check_upvoted/', CheckUpvoted.as_view()),
    url(r'^check_downvoted/', CheckDownvoted.as_view()),
    url(r'^upvote/', Upvote.as_view()),
    url(r'^downvote/', Downvote.as_view()),
    url(r'^trending/by_upvotes', TrendingAnswersByUpvotes.as_view()),
    url(r'^trending/', TrendingAnswersByInteractions.as_view()),
    url(r'^(?P<pk>\d+)/$', AnswerAPIView.as_view(), name='answer'),
    url(r'^(?P<username>\w+)/', UserAnswerAPIView.as_view()),
]
