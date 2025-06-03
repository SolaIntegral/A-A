import React, { useState, useEffect } from 'react';
import { TextField, Button, Box, Alert, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import ja from 'date-fns/locale/ja';

const TaskForm = ({ initialData, onSubmit, onCancel, errorMessage }) => {
  const [formData, setFormData] = useState({
    title: '',
    due_date: null,
    scheduled_date: null,
    estimated_time: '',
    related_status_type: '',
  });
  const [errors, setErrors] = useState({});

  const STATUS_TYPE_CHOICES = [
    { value: 'learning', label: '学習力' },
    { value: 'creativity', label: '創造力' },
    { value: 'execution', label: '実行力' },
    { value: 'communication', label: 'コミュニケーション力' },
  ];

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        due_date: initialData.due_date ? new Date(initialData.due_date) : null,
        scheduled_date: initialData.scheduled_date ? new Date(initialData.scheduled_date) : null,
        estimated_time: initialData.estimated_time || '',
        related_status_type: initialData.related_status_type || '',
      });
    }
  }, [initialData]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) {
      newErrors.title = 'タスク名は必須です';
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

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      {errorMessage && (
        <Alert severity="error" sx={{ mb: 2 }}>{errorMessage}</Alert>
      )}
      <TextField
        fullWidth
        label="タスク名"
        name="title"
        value={formData.title}
        onChange={e => setFormData({ ...formData, title: e.target.value })}
        error={!!errors.title}
        helperText={errors.title}
        sx={{ mb: 3 }}
      />
      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ja}>
        <DatePicker
          label="締切日"
          value={formData.due_date}
          onChange={date => setFormData({ ...formData, due_date: date })}
          renderInput={params => <TextField {...params} fullWidth sx={{ mb: 3 }} />}
        />
        <DatePicker
          label="実施予定日"
          value={formData.scheduled_date}
          onChange={date => setFormData({ ...formData, scheduled_date: date })}
          renderInput={params => <TextField {...params} fullWidth sx={{ mb: 3 }} />}
        />
      </LocalizationProvider>
      <TextField
        fullWidth
        label="予定作業時間（分）"
        name="estimated_time"
        type="number"
        value={formData.estimated_time}
        onChange={e => setFormData({ ...formData, estimated_time: e.target.value })}
        error={!!errors.estimated_time}
        helperText={errors.estimated_time}
        sx={{ mb: 3 }}
      />
      <FormControl fullWidth sx={{ mb: 3 }}>
        <InputLabel>関連ステータス</InputLabel>
        <Select
          name="related_status_type"
          value={formData.related_status_type || ''}
          label="関連ステータス"
          onChange={e => setFormData({ ...formData, related_status_type: e.target.value })}
        >
          <MenuItem value="">選択してください</MenuItem>
          {STATUS_TYPE_CHOICES.map(opt => (
            <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
          ))}
        </Select>
      </FormControl>
      <Box display="flex" gap={2} justifyContent="flex-end">
        <Button variant="outlined" onClick={onCancel}>キャンセル</Button>
        <Button type="submit" variant="contained" color="primary">{initialData ? '更新' : '作成'}</Button>
      </Box>
    </Box>
  );
};

export default TaskForm; 