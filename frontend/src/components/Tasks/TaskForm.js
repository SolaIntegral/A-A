import React, { useState, useEffect } from 'react';
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
import { addDoc, collection, updateDoc, doc, getDocs } from 'firebase/firestore';
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
    memo: task?.memo || '',
    tags: task?.tags ? task.tags.join(', ') : '',
    project: task?.project || ''
  });
  const [projects, setProjects] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // プロジェクト一覧を取得
    const fetchProjects = async () => {
      const { db } = await initFirebase();
      const snap = await getDocs(collection(db, 'projects'));
      setProjects(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };
    fetchProjects();
  }, []);

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
      let tagsArray = formData.tags
        .split(/[\s,]+/)
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);
      if (formData.project) {
        if (!tagsArray.includes(formData.project)) {
          tagsArray.push(formData.project);
        }
      }
      const taskData = {
        ...formData,
        tags: tagsArray,
        project: formData.project,
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

      <TextField
        fullWidth
        label="ハッシュタグ（カンマ・スペース区切り可）"
        value={formData.tags}
        onChange={handleChange('tags')}
        margin="normal"
        placeholder="#例1, #例2"
      />

      <FormControl fullWidth margin="normal">
        <InputLabel>プロジェクト</InputLabel>
        <Select
          value={formData.project}
          onChange={handleChange('project')}
          label="プロジェクト"
        >
          <MenuItem value=""><em>未選択</em></MenuItem>
          {projects.map(project => (
            <MenuItem key={project.id} value={project.name}>{project.name}</MenuItem>
          ))}
        </Select>
      </FormControl>

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