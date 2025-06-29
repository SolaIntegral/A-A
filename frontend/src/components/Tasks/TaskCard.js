import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Chip,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from '@mui/material';
import { PlayArrow, Edit, Delete, CheckCircle } from '@mui/icons-material';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { initFirebase } from '../../firebase';

export default function TaskCard({ task, onStartTimer }) {
  const navigate = useNavigate();
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openSnoozeDialog, setOpenSnoozeDialog] = useState(false);
  const [snoozeReason, setSnoozeReason] = useState('');

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && !task.completed;

  const handleComplete = async () => {
    try {
      const { db } = await initFirebase();
      await updateDoc(doc(db, 'tasks', task.id), {
        completed: true,
        completedAt: new Date()
      });
    } catch (error) {
      console.error('タスク完了エラー:', error);
    }
  };

  const handleDelete = async () => {
    try {
      const { db } = await initFirebase();
      await deleteDoc(doc(db, 'tasks', task.id));
      setOpenDeleteDialog(false);
    } catch (error) {
      console.error('タスク削除エラー:', error);
    }
  };

  const handleSnooze = async () => {
    if (!snoozeReason.trim()) return;
    
    try {
      const { db } = await initFirebase();
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      await updateDoc(doc(db, 'tasks', task.id), {
        scheduledDate: tomorrow.toISOString().split('T')[0],
        snoozeReason: snoozeReason,
        snoozedAt: new Date()
      });
      
      setOpenSnoozeDialog(false);
      setSnoozeReason('');
    } catch (error) {
      console.error('タスク延期エラー:', error);
    }
  };

  const handleStartTimer = () => {
    navigate(`/tasks/timer/${task.id}`);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP');
  };

  const getSkillLabel = (skill) => {
    const skillLabels = {
      learning: '学習力',
      creativity: '創造力',
      execution: '実行力',
      communication: 'コミュニケーション力'
    };
    return skillLabels[skill] || skill;
  };

  return (
    <>
      <Card 
        sx={{ 
          mb: 2,
          border: isOverdue ? '2px solid #f44336' : '1px solid #e0e0e0',
          backgroundColor: isOverdue ? '#ffebee' : 'white'
        }}
      >
        <CardContent>
          {isOverdue && (
            <Chip 
              label="期限切れ" 
              color="error" 
              size="small" 
              sx={{ mb: 1 }}
            />
          )}
          
          <Typography variant="h6" component="h2" gutterBottom>
            {task.title}
          </Typography>
          
          <Box sx={{ mb: 1 }}>
            {task.dueDate && (
              <Typography variant="body2" color="text.secondary">
                締切: {formatDate(task.dueDate)}
              </Typography>
            )}
            {task.scheduledDate && (
              <Typography variant="body2" color="text.secondary">
                実施予定: {formatDate(task.scheduledDate)}
              </Typography>
            )}
            {task.estimatedTime && (
              <Typography variant="body2" color="text.secondary">
                予定時間: {task.estimatedTime}分
              </Typography>
            )}
            {task.skill && (
              <Typography variant="body2" color="text.secondary">
                関連スキル: {getSkillLabel(task.skill)}
              </Typography>
            )}
          </Box>
          {/* タグ表示 */}
          {Array.isArray(task.tags) && task.tags.length > 0 && (
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
              {task.tags.map((tag, idx) => (
                <Chip key={idx} label={`#${tag}`} size="small" variant="outlined" color="secondary" />
              ))}
            </Box>
          )}
        </CardContent>
        
        <CardActions>
          {!task.completed && (
            <>
              <Button
                size="small"
                startIcon={<PlayArrow />}
                onClick={handleStartTimer}
              >
                開始
              </Button>
              <Button
                size="small"
                startIcon={<Edit />}
                onClick={() => navigate(`/tasks/edit/${task.id}`)}
              >
                編集
              </Button>
              <Button
                size="small"
                startIcon={<CheckCircle />}
                onClick={handleComplete}
                color="success"
              >
                完了
              </Button>
            </>
          )}
          <Button
            size="small"
            startIcon={<Delete />}
            onClick={() => setOpenDeleteDialog(true)}
            color="error"
          >
            削除
          </Button>
        </CardActions>
      </Card>

      {/* 削除確認ダイアログ */}
      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle>タスクの削除</DialogTitle>
        <DialogContent>
          <Typography>
            「{task.title}」を削除しますか？この操作は取り消せません。
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>キャンセル</Button>
          <Button onClick={handleDelete} color="error">削除</Button>
        </DialogActions>
      </Dialog>

      {/* 延期ダイアログ */}
      <Dialog open={openSnoozeDialog} onClose={() => setOpenSnoozeDialog(false)}>
        <DialogTitle>タスクの延期</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="延期理由"
            fullWidth
            multiline
            rows={4}
            value={snoozeReason}
            onChange={(e) => setSnoozeReason(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenSnoozeDialog(false)}>キャンセル</Button>
          <Button onClick={handleSnooze} disabled={!snoozeReason.trim()}>
            延期
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
} 