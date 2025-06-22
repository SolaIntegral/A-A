import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ja } from 'date-fns/locale';
import { doc, getDoc, addDoc, updateDoc, collection } from 'firebase/firestore';
import { useAuth } from '../components/Auth/AuthProvider';
import { initFirebase } from '../firebase';

const SKILL_OPTIONS = [
  { value: 'learning', label: '学習力' },
  { value: 'creativity', label: '創造力' },
  { value: 'execution', label: '実行力' },
  { value: 'communication', label: 'コミュニケーション力' }
];

export default function TaskFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    title: '',
    dueDate: null,
    scheduledDate: null,
    estimatedTime: '',
    skill: ''
  });

  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    if (id) {
      loadTask();
    }
  }, [id]);

  const loadTask = async () => {
    try {
      const { db } = await initFirebase();
      const taskDoc = await getDoc(doc(db, 'tasks', id));
      
      if (taskDoc.exists()) {
        const taskData = taskDoc.data();
        setFormData({
          title: taskData.title || '',
          dueDate: taskData.dueDate ? new Date(taskData.dueDate) : null,
          scheduledDate: taskData.scheduledDate ? new Date(taskData.scheduledDate) : null,
          estimatedTime: taskData.estimatedTime || '',
          skill: taskData.skill || ''
        });
      }
    } catch (error) {
      console.error('タスク読み込みエラー:', error);
      setError('タスクの読み込みに失敗しました');
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.title.trim()) {
      errors.title = 'タスク名は必須です';
    }
    
    if (formData.estimatedTime && isNaN(formData.estimatedTime)) {
      errors.estimatedTime = '数値を入力してください';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const { db } = await initFirebase();
      
      const taskData = {
        title: formData.title.trim(),
        dueDate: formData.dueDate ? formData.dueDate.toISOString().split('T')[0] : null,
        scheduledDate: formData.scheduledDate ? formData.scheduledDate.toISOString().split('T')[0] : null,
        estimatedTime: formData.estimatedTime ? parseInt(formData.estimatedTime) : null,
        skill: formData.skill || null,
        userId: user.uid,
        completed: false,
        createdAt: new Date()
      };

      if (id) {
        // 編集
        await updateDoc(doc(db, 'tasks', id), {
          ...taskData,
          updatedAt: new Date()
        });
      } else {
        // 新規作成
        await addDoc(collection(db, 'tasks'), taskData);
      }

      navigate('/tasks');
    } catch (error) {
      console.error('タスク保存エラー:', error);
      setError('タスクの保存に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/tasks');
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ja}>
      <Container maxWidth="md">
        <Box sx={{ mt: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            {id ? 'タスクの編集' : '新規タスク作成'}
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="タスク名"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              error={!!validationErrors.title}
              helperText={validationErrors.title}
              required
              sx={{ mb: 2 }}
            />

            <DatePicker
              label="締切日"
              value={formData.dueDate}
              onChange={(newValue) => setFormData({ ...formData, dueDate: newValue })}
              renderInput={(params) => <TextField {...params} fullWidth sx={{ mb: 2 }} />}
            />

            <DatePicker
              label="実施予定日"
              value={formData.scheduledDate}
              onChange={(newValue) => setFormData({ ...formData, scheduledDate: newValue })}
              renderInput={(params) => <TextField {...params} fullWidth sx={{ mb: 2 }} />}
            />

            <TextField
              fullWidth
              label="予定作業時間（分）"
              type="number"
              value={formData.estimatedTime}
              onChange={(e) => setFormData({ ...formData, estimatedTime: e.target.value })}
              error={!!validationErrors.estimatedTime}
              helperText={validationErrors.estimatedTime}
              sx={{ mb: 2 }}
            />

            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>関連スキル</InputLabel>
              <Select
                value={formData.skill}
                onChange={(e) => setFormData({ ...formData, skill: e.target.value })}
                label="関連スキル"
              >
                <MenuItem value="">
                  <em>なし</em>
                </MenuItem>
                {SKILL_OPTIONS.map(option => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="outlined"
                onClick={handleCancel}
                disabled={loading}
              >
                キャンセル
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
              >
                {id ? '更新' : '作成'}
              </Button>
            </Box>
          </Box>
        </Box>
      </Container>
    </LocalizationProvider>
  );
} 