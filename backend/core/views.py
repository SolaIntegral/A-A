from django.shortcuts import render
from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from .models import Task, UserProfile, UserStatus, Achievement
from .serializers import TaskSerializer, UserProfileSerializer, UserStatusSerializer, AchievementSerializer
from rest_framework.exceptions import ValidationError
import datetime

# Create your views here.

class TaskViewSet(viewsets.ModelViewSet):
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Task.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        user = self.request.user
        scheduled_date = self.request.data.get('scheduled_date')
        due_date = self.request.data.get('due_date')
        if not scheduled_date and due_date:
            # 締切日までの間で1日3件まで自動割り当て
            due = datetime.datetime.fromisoformat(due_date.replace('Z', '+00:00'))
            today = timezone.now().replace(hour=0, minute=0, second=0, microsecond=0)
            for i in range((due - today).days + 1):
                candidate = today + datetime.timedelta(days=i)
                count = Task.objects.filter(user=user, scheduled_date=candidate, status__in=['pending', 'in_progress']).count()
                if count < 3:
                    scheduled_date = candidate
                    break
            else:
                scheduled_date = due  # どの日も埋まっていたら締切日に
        if scheduled_date:
            count = Task.objects.filter(user=user, scheduled_date=scheduled_date, status__in=['pending', 'in_progress']).count()
            if count >= 3:
                raise ValidationError('1日の実施予定タスクは最大3件までです。')
        serializer.save(user=user, scheduled_date=scheduled_date)
    
    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        task = self.get_object()
        task.status = 'completed'
        task.completed_at = timezone.now()
        task.save()
        # ゲーミフィケーション: 経験値・レベル加算
        user = task.user
        # UserProfile（全体レベル）
        profile, _ = UserProfile.objects.get_or_create(user=user)
        profile.experience += 10  # 例: タスク1件で10exp
        if profile.experience >= profile.level * 100:
            profile.level += 1
            profile.experience = 0
        profile.save()
        # UserStatus（関連ステータス）
        if task.related_status_type:
            status_obj, _ = UserStatus.objects.get_or_create(user=user, status_type=task.related_status_type)
            status_obj.experience += 10
            if status_obj.experience >= status_obj.level * 50:
                status_obj.level += 1
                status_obj.experience = 0
            status_obj.save()
        return Response({'status': 'task completed'})
    
    @action(detail=True, methods=['post'])
    def snooze(self, request, pk=None):
        task = self.get_object()
        # 1回だけ
        if task.snooze_count >= 1:
            raise ValidationError('スヌーズは1回だけ可能です。')
        # その日の未完了タスクが3件なら不可
        scheduled_date = task.scheduled_date
        if scheduled_date:
            count = Task.objects.filter(user=task.user, scheduled_date=scheduled_date, status__in=['pending', 'in_progress']).count()
            if count >= 3:
                raise ValidationError('その日の実施予定タスクが3件埋まっているため、先延ばしできません。')
        task.status = 'snoozed'
        task.snooze_reason = request.data.get('reason', '')
        task.snooze_count += 1
        task.save()
        return Response({'status': 'task snoozed'})

class UserProfileViewSet(viewsets.ModelViewSet):
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return UserProfile.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class UserStatusViewSet(viewsets.ModelViewSet):
    serializer_class = UserStatusSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return UserStatus.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class AchievementViewSet(viewsets.ModelViewSet):
    serializer_class = AchievementSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Achievement.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

@api_view(['GET'])
def dashboard_tasks(request):
    user = request.user
    tasks = Task.objects.filter(user=user).order_by('scheduled_date', 'due_date')[:3]
    serializer = TaskSerializer(tasks, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_profile_summary(request):
    user = request.user
    profile, _ = UserProfile.objects.get_or_create(user=user)
    statuses = UserStatus.objects.filter(user=user)
    profile_data = UserProfileSerializer(profile).data
    status_data = UserStatusSerializer(statuses, many=True).data
    return Response({
        'profile': profile_data,
        'statuses': status_data,
    })
