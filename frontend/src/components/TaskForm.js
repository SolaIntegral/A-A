import React, { useState, useEffect } from 'react';
import {
  TextField,
  Button,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import ja from 'date-fns/locale/ja';

const TaskForm = ({ initialData, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    status: 'pending',
    due_date: null,
    estimated_time: '',
    is_daily_top_task: false,
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        due_date: initialData.due_date ? new Date(initialData.due_date) : null,
      });
    }
  }, [initialData]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) {
      newErrors.title = 'タイトルは必須です';
    }
    if (formData.estimated_time && isNaN(formData.estimated_time)) {
      newErrors.estimated_time = '有効な数値を入力してください';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      <TextField
        fullWidth
        label="タイトル"
        name="title"
        value={formData.title}
        onChange={handleChange}
        error={!!errors.title}
        helperText={errors.title}
        sx={{ mb: 2 }}
      />

      <TextField
        fullWidth
        label="説明"
        name="description"
        value={formData.description}
        onChange={handleChange}
        multiline
        rows={4}
        sx={{ mb: 2 }}
      />

      <TextField
        fullWidth
        label="カテゴリー"
        name="category"
        value={formData.category}
        onChange={handleChange}
        sx={{ mb: 2 }}
      />

      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>ステータス</InputLabel>
        <Select
          name="status"
          value={formData.status}
          onChange={handleChange}
          label="ステータス"
        >
          <MenuItem value="pending">未着手</MenuItem>
          <MenuItem value="in_progress">進行中</MenuItem>
          <MenuItem value="completed">完了</MenuItem>
          <MenuItem value="snoozed">延期</MenuItem>
        </Select>
      </FormControl>

      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ja}>
        <DateTimePicker
          label="期限"
          value={formData.due_date}
          onChange={(newValue) => {
            setFormData((prev) => ({ ...prev, due_date: newValue }));
          }}
          renderInput={(params) => (
            <TextField {...params} fullWidth sx={{ mb: 2 }} />
          )}
        />
      </LocalizationProvider>

      <TextField
        fullWidth
        label="予定時間（分）"
        name="estimated_time"
        type="number"
        value={formData.estimated_time}
        onChange={handleChange}
        error={!!errors.estimated_time}
        helperText={errors.estimated_time}
        sx={{ mb: 2 }}
      />

      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>デイリートップタスク</InputLabel>
        <Select
          name="is_daily_top_task"
          value={formData.is_daily_top_task}
          onChange={handleChange}
          label="デイリートップタスク"
        >
          <MenuItem value={true}>はい</MenuItem>
          <MenuItem value={false}>いいえ</MenuItem>
        </Select>
        <FormHelperText>
          このタスクをデイリートップタスクとして設定しますか？
        </FormHelperText>
      </FormControl>

      <Box display="flex" gap={2} justifyContent="flex-end">
        <Button variant="outlined" onClick={onCancel}>
          キャンセル
        </Button>
        <Button type="submit" variant="contained" color="primary">
          {initialData ? '更新' : '作成'}
        </Button>
      </Box>
    </Box>
  );
};

export default TaskForm; 