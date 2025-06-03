import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Typography, Box, Button, LinearProgress, TextField, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { getTask, updateTask, snoozeTask } from '../api/tasks';

const TaskTimerPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [totalSeconds, setTotalSeconds] = useState(0);
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [snoozeOpen, setSnoozeOpen] = useState(false);
  const [snoozeReason, setSnoozeReason] = useState('');
  const [snoozeError, setSnoozeError] = useState('');
  const timerRef = useRef(null);

  useEffect(() => {
    const fetchTask = async () => {
      const data = await getTask(id);
      setTask(data);
      const min = data.estimated_time || 25;
      setMinutes(min);
      setSeconds(0);
      setTotalSeconds(min * 60);
      setProgress(0);
    };
    fetchTask();
    return () => clearInterval(timerRef.current);
  }, [id]);

  useEffect(() => {
    if (running && totalSeconds > 0) {
      timerRef.current = setInterval(() => {
        setTotalSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setRunning(false);
            setProgress(100);
            return 0;
          }
          setProgress(100 * (1 - (prev - 1) / (minutes * 60)));
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [running, minutes]);

  useEffect(() => {
    setMinutes(Math.floor(totalSeconds / 60));
    setSeconds(totalSeconds % 60);
  }, [totalSeconds]);

  const handleStart = () => {
    setRunning(true);
  };
  const handlePause = () => {
    setRunning(false);
    clearInterval(timerRef.current);
  };
  const handleReset = () => {
    setRunning(false);
    clearInterval(timerRef.current);
    setTotalSeconds((task.estimated_time || 25) * 60);
    setProgress(0);
  };

  const handleSnooze = async () => {
    if (!snoozeReason.trim()) {
      setSnoozeError('理由を入力してください');
      return;
    }
    try {
      await snoozeTask(id, snoozeReason);
      setSnoozeOpen(false);
      navigate('/');
    } catch (e) {
      if (e.response && e.response.data && e.response.data.detail) {
        setSnoozeError(e.response.data.detail);
      } else if (e.response && e.response.data && typeof e.response.data === 'string') {
        setSnoozeError(e.response.data);
      } else {
        setSnoozeError('スヌーズに失敗しました');
      }
    }
  };

  if (!task) return null;

  return (
    <Container maxWidth="sm" sx={{ mt: 6 }}>
      <Typography variant="h5" align="center" gutterBottom>
        タスクタイマー
      </Typography>
      <Box sx={{ mb: 2 }}>
        <Typography variant="h6">{task.title}</Typography>
        <Typography color="text.secondary">予定作業時間: {task.estimated_time || 25}分</Typography>
      </Box>
      <Box sx={{ mb: 2 }}>
        <LinearProgress variant="determinate" value={progress} sx={{ height: 10, borderRadius: 5 }} />
        <Typography align="center" sx={{ mt: 2 }} variant="h4">
          {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
        </Typography>
      </Box>
      <Box display="flex" gap={2} justifyContent="center" mb={2}>
        {!running ? (
          <Button variant="contained" color="primary" onClick={handleStart}>スタート</Button>
        ) : (
          <Button variant="outlined" color="primary" onClick={handlePause}>一時停止</Button>
        )}
        <Button variant="outlined" onClick={handleReset}>リセット</Button>
        <Button variant="outlined" color="warning" onClick={() => setSnoozeOpen(true)}>
          スヌーズ
        </Button>
      </Box>
      <Dialog open={snoozeOpen} onClose={() => setSnoozeOpen(false)}>
        <DialogTitle>タスクのスヌーズ（先延ばし）</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="理由"
            fullWidth
            multiline
            rows={3}
            value={snoozeReason}
            onChange={e => setSnoozeReason(e.target.value)}
            error={!!snoozeError}
            helperText={snoozeError}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSnoozeOpen(false)}>キャンセル</Button>
          <Button onClick={handleSnooze} variant="contained" color="primary">スヌーズ</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default TaskTimerPage; 