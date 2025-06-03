from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TaskViewSet, UserProfileViewSet, UserStatusViewSet, AchievementViewSet

router = DefaultRouter()
router.register(r'tasks', TaskViewSet, basename='task')
router.register(r'profiles', UserProfileViewSet, basename='profile')
router.register(r'statuses', UserStatusViewSet, basename='status')
router.register(r'achievements', AchievementViewSet, basename='achievement')

urlpatterns = [
    path('', include(router.urls)),
] 