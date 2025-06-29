import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert
} from '@mui/material';
import {
  CheckCircle,
  Snooze,
  Edit,
  Delete,
  Timer
} from '@mui/icons-material';
import { updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { initFirebase } from '../../firebase';
import TaskForm from './TaskForm';
import TimerModal from '../Timer/TimerModal';

const SKILL_LABELS = {
  learning: '学習力',
  creativity: '創造力',
  execution: '実行力',
  communication: 'コミュニケーション力'
};

const CATEGORY_LABELS = {
  work: '仕事',
  study: '学習',
  personal: 'プライベート',
  other: 'その他'
};

export default function TaskItem({ task, onUpdate, onStartTimer }) {
  const [snoozeDialogOpen, setSnoozeDialogOpen] = useState(false);
  const [snoozeReason, setSnoozeReason] = useState('');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [timerModalOpen, setTimerModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && !task.completed;

  const handleComplete = async () => {
    setLoading(true);
    try {
      const { db } = await initFirebase();
      await updateDoc(doc(db, 'tasks', task.id), {
        completed: true,
        completedAt: new Date(),
        updatedAt: new Date()
      });
      onUpdate();
    } catch (error) {
      console.error('タスク完了エラー:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSnooze = async () => {
    if (!snoozeReason.trim()) return;
    
    setLoading(true);
    try {
      const { db } = await initFirebase();
      await updateDoc(doc(db, 'tasks', task.id), {
        snoozeCount: (task.snoozeCount || 0) + 1,
        snoozeReason,
        updatedAt: new Date()
      });
      setSnoozeDialogOpen(false);
      setSnoozeReason('');
      onUpdate();
    } catch (error) {
      console.error('タスク延期エラー:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('このタスクを削除しますか？')) return;
    
    setLoading(true);
    try {
      const { db } = await initFirebase();
      await deleteDoc(doc(db, 'tasks', task.id));
      onUpdate();
    } catch (error) {
      console.error('タスク削除エラー:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartTimer = () => {
    if (task.estimatedTime) {
      setTimerModalOpen(true);
    } else {
      alert('このタスクには予定作業時間が設定されていません。タスクを編集して予定時間を設定してください。');
    }
  };

  const handleTaskComplete = () => {
    onUpdate();
  };

  return (
    <>
      <Card 
        sx={{ 
          mb: 2,
          border: isOverdue ? '2px solid #f44336' : '1px solid #e0e0e0',
          backgroundColor: task.completed ? '#f5f5f5' : 'white'
        }}
      >
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Box sx={{ flex: 1 }}>
              <Typography 
                variant="h6" 
                sx={{ 
                  textDecoration: task.completed ? 'line-through' : 'none',
                  color: task.completed ? '#666' : 'inherit'
                }}
              >
                {task.title}
              </Typography>
              
              <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {task.skillCategory && (
                  <Chip 
                    label={SKILL_LABELS[task.skillCategory]} 
                    size="small" 
                    color="primary" 
                  />
                )}
                {task.taskCategory && (
                  <Chip 
                    label={CATEGORY_LABELS[task.taskCategory]} 
                    size="small" 
                    variant="outlined" 
                  />
                )}
                {task.estimatedTime && (
                  <Chip 
                    label={`${task.estimatedTime}分`} 
                    size="small" 
                    variant="outlined" 
                  />
                )}
                {isOverdue && (
                  <Chip 
                    label="期限切れ" 
                    size="small" 
                    color="error" 
                  />
                )}
                {/* タグ表示 */}
                {Array.isArray(task.tags) && task.tags.length > 0 && task.tags.map((tag, idx) => (
                  <Chip key={idx} label={`#${tag}`} size="small" variant="outlined" color="secondary" />
                ))}
              </Box>

              {task.memo && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  {task.memo}
                </Typography>
              )}

              {task.learning && (
                <Typography variant="body2" color="success.main" sx={{ mt: 1, fontStyle: 'italic' }}>
                  💡 学んだこと: {task.learning}
                </Typography>
              )}

              <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {task.dueDate && (
                  <Typography variant="caption" color="text.secondary">
                    締切: {new Date(task.dueDate).toLocaleDateString()}
                  </Typography>
                )}
                {task.scheduledDate && (
                  <Typography variant="caption" color="text.secondary">
                    予定: {new Date(task.scheduledDate).toLocaleDateString()}
                  </Typography>
                )}
                {task.snoozeCount > 0 && (
                  <Typography variant="caption" color="warning.main">
                    延期回数: {task.snoozeCount}回
                  </Typography>
                )}
              </Box>
            </Box>

            <Box sx={{ display: 'flex', gap: 1 }}>
              {!task.completed && (
                <>
                  <IconButton 
                    onClick={handleStartTimer}
                    color="primary"
                    size="small"
                    title="タイマー開始"
                  >
                    <Timer />
                  </IconButton>
                  <IconButton 
                    onClick={() => setSnoozeDialogOpen(true)}
                    color="warning"
                    size="small"
                    title="延期"
                  >
                    <Snooze />
                  </IconButton>
                  <IconButton 
                    onClick={() => setEditDialogOpen(true)}
                    color="info"
                    size="small"
                    title="編集"
                  >
                    <Edit />
                  </IconButton>
                </>
              )}
              <IconButton 
                onClick={handleComplete}
                color="success"
                size="small"
                disabled={loading || task.completed}
                title="完了"
              >
                <CheckCircle />
              </IconButton>
              <IconButton 
                onClick={handleDelete}
                color="error"
                size="small"
                disabled={loading}
                title="削除"
              >
                <Delete />
              </IconButton>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* 延期ダイアログ */}
      <Dialog open={snoozeDialogOpen} onClose={() => setSnoozeDialogOpen(false)}>
        <DialogTitle>タスクを延期</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="延期理由"
            multiline
            rows={3}
            value={snoozeReason}
            onChange={(e) => setSnoozeReason(e.target.value)}
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSnoozeDialogOpen(false)}>キャンセル</Button>
          <Button 
            onClick={handleSnooze} 
            variant="contained"
            disabled={!snoozeReason.trim() || loading}
          >
            延期
          </Button>
        </DialogActions>
      </Dialog>

      {/* 編集ダイアログ */}
      <Dialog 
        open={editDialogOpen} 
        onClose={() => setEditDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>タスクを編集</DialogTitle>
        <DialogContent>
          <TaskForm 
            task={task} 
            onClose={() => setEditDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* タイマーモーダル */}
      <TimerModal
        open={timerModalOpen}
        onClose={() => setTimerModalOpen(false)}
        task={task}
        onTaskComplete={handleTaskComplete}
      />
    </>
  );
} 