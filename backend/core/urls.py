from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TaskViewSet, UserProfileViewSet, UserStatusViewSet, AchievementViewSet, dashboard_tasks, user_profile_summary

router = DefaultRouter()
router.register(r'tasks', TaskViewSet, basename='task')
router.register(r'profiles', UserProfileViewSet, basename='profile')
router.register(r'statuses', UserStatusViewSet, basename='status')
router.register(r'achievements', AchievementViewSet, basename='achievement')

urlpatterns = [
    path('', include(router.urls)),
    path('dashboard-tasks/', dashboard_tasks, name='dashboard-tasks'),
    path('user-profile/', user_profile_summary, name='user-profile-summary'),
] 