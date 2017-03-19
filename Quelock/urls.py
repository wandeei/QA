from django.conf.urls import url, include
from django.conf.urls.static import static
from django.contrib import admin
from Quelock import views
from Quelock import settings
from answers.views import TrendingAnswersView

urlpatterns = [
    url(r'^$', views.index, name='index_home'),
    url(r'^admin/', admin.site.urls),
    url(r'^signup/', include('registration.urls')),
    # Question API
    url(r'^questions/', include('questions.urls'), name='question'),
    url(r'^answers/', include('answers.urls')),
    url(r'^login/', include('login.urls'), name='login'),
    url(r'^logout/', include('logout.urls'), name='logout'),
    url(r'^profile/', include('account.urls')),
    url(r'^topics/', include('topics.urls')),
    url(r'^comments/', include('comments.urls'), name='comments'),
    url(r'^upload/', views.upload, name='upload'),
    url(r'^api/', include('Quelock.api.urls')),
    url(r'^follow/', views.Follow.as_view()),
    url(r'^unfollow/', views.UnFollow.as_view()),
    url(r'^is_following/', views.IsFollowing.as_view()),
    url(r'^trending/', TrendingAnswersView.as_view(), name='trending_by_interactions'),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
