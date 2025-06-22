import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Button,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from '@mui/material';
import { PlayArrow, Pause, Stop, Snooze } from '@mui/icons-material';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useAuth } from '../components/Auth/AuthProvider';
import { initFirebase } from '../firebase';

export default function TaskTimerPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [task, setTask] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [openSnoozeDialog, setOpenSnoozeDialog] = useState(false);
  const [snoozeReason, setSnoozeReason] = useState('');

  useEffect(() => {
    loadTask();
  }, [id]);

  useEffect(() => {
    let interval = null;
    
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prevTime => {
          if (prevTime <= 1) {
            setIsRunning(false);
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, timeLeft]);

  const loadTask = async () => {
    try {
      const { db } = await initFirebase();
      const taskDoc = await getDoc(doc(db, 'tasks', id));
      
      if (taskDoc.exists()) {
        const taskData = taskDoc.data();
        setTask({ id: taskDoc.id, ...taskData });
        setTimeLeft((taskData.estimatedTime || 25) * 60); // デフォルト25分
      }
    } catch (error) {
      console.error('タスク読み込みエラー:', error);
    }
  };

  const handleStart = () => {
    setIsRunning(true);
    setIsPaused(false);
  };

  const handlePause = () => {
    setIsRunning(false);
    setIsPaused(true);
  };

  const handleReset = () => {
    setIsRunning(false);
    setIsPaused(false);
    setTimeLeft((task?.estimatedTime || 25) * 60);
  };

  const handleSnooze = async () => {
    if (!snoozeReason.trim()) return;
    
    try {
      const { db } = await initFirebase();
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      await updateDoc(doc(db, 'tasks', id), {
        scheduledDate: tomorrow.toISOString().split('T')[0],
        snoozeReason: snoozeReason,
        snoozedAt: new Date()
      });
      
      setOpenSnoozeDialog(false);
      setSnoozeReason('');
      navigate('/tasks');
    } catch (error) {
      console.error('タスク延期エラー:', error);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgress = () => {
    const totalTime = (task?.estimatedTime || 25) * 60;
    return ((totalTime - timeLeft) / totalTime) * 100;
  };

  if (!task) {
    return (
      <Container maxWidth="sm">
        <Box sx={{ mt: 6, textAlign: 'center' }}>
          <Typography>タスクを読み込み中...</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 6 }}>
        <Typography variant="h5" component="h1" align="center" gutterBottom>
          タスクタイマー
        </Typography>

        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" align="center" gutterBottom>
            {task.title}
          </Typography>
          <Typography variant="body2" align="center" color="text.secondary">
            予定作業時間: {task.estimatedTime || 25}分
          </Typography>
        </Box>

        <Box sx={{ mb: 3 }}>
          <LinearProgress
            variant="determinate"
            value={getProgress()}
            sx={{
              height: 10,
              borderRadius: 5,
              mb: 2
            }}
          />
          
          <Typography variant="h4" align="center" gutterBottom>
            {formatTime(timeLeft)}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 3 }}>
          {!isRunning ? (
            <Button
              variant="contained"
              size="large"
              startIcon={<PlayArrow />}
              onClick={handleStart}
              disabled={timeLeft === 0}
            >
              スタート
            </Button>
          ) : (
            <Button
              variant="contained"
              size="large"
              startIcon={<Pause />}
              onClick={handlePause}
            >
              一時停止
            </Button>
          )}
          
          <Button
            variant="outlined"
            size="large"
            startIcon={<Stop />}
            onClick={handleReset}
          >
            リセット
          </Button>
          
          <Button
            variant="outlined"
            size="large"
            startIcon={<Snooze />}
            onClick={() => setOpenSnoozeDialog(true)}
          >
            スヌーズ
          </Button>
        </Box>
      </Box>

      {/* スヌーズダイアログ */}
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
    </Container>
  );
} 