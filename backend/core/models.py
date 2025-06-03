from django.db import models
from django.conf import settings

class Task(models.Model):
    STATUS_CHOICES = [
        ('pending', '未着手'),
        ('in_progress', '進行中'),
        ('completed', '完了'),
        ('snoozed', '延期'),
    ]
    
    STATUS_TYPE_CHOICES = [
        ('learning', '学習力'),
        ('creativity', '創造力'),
        ('execution', '実行力'),
        ('communication', 'コミュニケーション力'),
    ]
    
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    title = models.CharField(max_length=200)
    description = models.TextField(null=True, blank=True)
    due_date = models.DateTimeField(null=True, blank=True)
    estimated_time = models.IntegerField(help_text="予定作業時間 (分)", null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    is_daily_top = models.BooleanField(default=False, help_text="今日の表示タスク3つに含まれるか")
    order_in_daily = models.IntegerField(null=True, blank=True, help_text="今日の表示タスク内の順序")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    snooze_reason = models.TextField(null=True, blank=True)
    snooze_count = models.IntegerField(default=0)
    learned_at_completion = models.TextField(null=True, blank=True, help_text="完了時に学んだこと")
    category = models.CharField(max_length=50, null=True, blank=True, help_text="仕事, 学習, プライベートなど")
    related_status_type = models.CharField(max_length=20, choices=STATUS_TYPE_CHOICES, null=True, blank=True, help_text="上昇するステータス")
    
    def __str__(self):
        return self.title

class UserProfile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    level = models.IntegerField(default=1)
    experience = models.IntegerField(default=0)
    
    def __str__(self):
        return f"{self.user.username}'s Profile"

class UserStatus(models.Model):
    STATUS_TYPE_CHOICES = [
        ('learning', '学習力'),
        ('creativity', '創造力'),
        ('execution', '実行力'),
        ('communication', 'コミュニケーション力'),
    ]
    
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    status_type = models.CharField(max_length=20, choices=STATUS_TYPE_CHOICES)
    level = models.IntegerField(default=1)
    experience = models.IntegerField(default=0)
    
    class Meta:
        unique_together = ['user', 'status_type']
    
    def __str__(self):
        return f"{self.user.username}'s {self.status_type}"

class Achievement(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    description = models.TextField()
    achieved_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.user.username}'s {self.name}"
