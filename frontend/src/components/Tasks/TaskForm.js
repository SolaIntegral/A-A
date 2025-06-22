import React, { useState } from 'react';
import {
  TextField,
  Button,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Alert
} from '@mui/material';
import { addDoc, collection, updateDoc, doc } from 'firebase/firestore';
import { useAuth } from '../Auth/AuthProvider';
import { initFirebase } from '../../firebase';

const SKILL_CATEGORIES = [
  { value: 'learning', label: '学習力' },
  { value: 'creativity', label: '創造力' },
  { value: 'execution', label: '実行力' },
  { value: 'communication', label: 'コミュニケーション力' }
];

const TASK_CATEGORIES = [
  { value: 'work', label: '仕事' },
  { value: 'study', label: '学習' },
  { value: 'personal', label: 'プライベート' },
  { value: 'other', label: 'その他' }
];

export default function TaskForm({ task = null, onClose }) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: task?.title || '',
    dueDate: task?.dueDate || '',
    scheduledDate: task?.scheduledDate || '',
    estimatedTime: task?.estimatedTime || '',
    skillCategory: task?.skillCategory || '',
    taskCategory: task?.taskCategory || '',
    memo: task?.memo || ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!formData.title.trim()) {
      setError('タスク名を入力してください');
      setLoading(false);
      return;
    }

    try {
      const { db } = await initFirebase();
      const taskData = {
        ...formData,
        userId: user.uid,
        completed: false,
        snoozeCount: 0,
        createdAt: task ? task.createdAt : new Date(),
        updatedAt: new Date()
      };

      if (task) {
        // 編集
        await updateDoc(doc(db, 'tasks', task.id), taskData);
      } else {
        // 新規作成
        await addDoc(collection(db, 'tasks'), taskData);
      }

      onClose();
    } catch (error) {
      setError('タスクの保存に失敗しました');
      console.error('タスク保存エラー:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field) => (event) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        {task ? 'タスクを編集' : '新しいタスクを作成'}
      </Typography>
      
      <TextField
        fullWidth
        label="タスク名"
        value={formData.title}
        onChange={handleChange('title')}
        margin="normal"
        required
      />

      <TextField
        fullWidth
        label="締切日"
        type="date"
        value={formData.dueDate}
        onChange={handleChange('dueDate')}
        margin="normal"
        InputLabelProps={{ shrink: true }}
      />

      <TextField
        fullWidth
        label="実施予定日"
        type="date"
        value={formData.scheduledDate}
        onChange={handleChange('scheduledDate')}
        margin="normal"
        InputLabelProps={{ shrink: true }}
      />

      <TextField
        fullWidth
        label="予定作業時間（分）"
        type="number"
        value={formData.estimatedTime}
        onChange={handleChange('estimatedTime')}
        margin="normal"
        inputProps={{ min: 1 }}
      />

      <FormControl fullWidth margin="normal">
        <InputLabel>関連スキル</InputLabel>
        <Select
          value={formData.skillCategory}
          onChange={handleChange('skillCategory')}
          label="関連スキル"
        >
          {SKILL_CATEGORIES.map(category => (
            <MenuItem key={category.value} value={category.value}>
              {category.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl fullWidth margin="normal">
        <InputLabel>カテゴリ</InputLabel>
        <Select
          value={formData.taskCategory}
          onChange={handleChange('taskCategory')}
          label="カテゴリ"
        >
          {TASK_CATEGORIES.map(category => (
            <MenuItem key={category.value} value={category.value}>
              {category.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <TextField
        fullWidth
        label="メモ"
        multiline
        rows={3}
        value={formData.memo}
        onChange={handleChange('memo')}
        margin="normal"
      />

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
        <Button
          type="submit"
          variant="contained"
          disabled={loading}
          sx={{ flex: 1 }}
        >
          {loading ? '保存中...' : (task ? '更新' : '作成')}
        </Button>
        <Button
          variant="outlined"
          onClick={onClose}
          sx={{ flex: 1 }}
        >
          キャンセル
        </Button>
      </Box>
    </Box>
  );
} 