from django.shortcuts import render
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from .models import Task, UserProfile, UserStatus, Achievement
from .serializers import TaskSerializer, UserProfileSerializer, UserStatusSerializer, AchievementSerializer

# Create your views here.

class TaskViewSet(viewsets.ModelViewSet):
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Task.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        task = self.get_object()
        task.status = 'completed'
        task.completed_at = timezone.now()
        task.save()
        return Response({'status': 'task completed'})
    
    @action(detail=True, methods=['post'])
    def snooze(self, request, pk=None):
        task = self.get_object()
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
