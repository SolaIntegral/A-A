import React, { useState, useEffect, useRef } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert
} from '@mui/material';
import {
  PlayArrow,
  Pause,
  Stop,
  Timer
} from '@mui/icons-material';
import { updateDoc, doc, getDoc } from 'firebase/firestore';
import { useAuth } from '../Auth/AuthProvider';
import { initFirebase } from '../../firebase';

export default function PomodoroTimer({ task, onClose, onTaskComplete }) {
  const { user } = useAuth();
  const [timeLeft, setTimeLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);
  const [learning, setLearning] = useState('');
  const [error, setError] = useState('');
  const intervalRef = useRef(null);

  useEffect(() => {
    if (task?.estimatedTime) {
      setTimeLeft(task.estimatedTime * 60); // 分を秒に変換
    }
  }, [task]);

  useEffect(() => {
    if (isRunning && !isPaused && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setIsRunning(false);
            setShowCompleteDialog(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }

    return () => clearInterval(intervalRef.current);
  }, [isRunning, isPaused, timeLeft]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStart = () => {
    setIsRunning(true);
    setIsPaused(false);
  };

  const handlePause = () => {
    setIsPaused(true);
  };

  const handleResume = () => {
    setIsPaused(false);
  };

  const handleStop = () => {
    setIsRunning(false);
    setIsPaused(false);
    if (task?.estimatedTime) {
      setTimeLeft(task.estimatedTime * 60);
    }
  };

  const handleComplete = async () => {
    if (!learning.trim()) {
      setError('学んだことを記録してください');
      return;
    }

    try {
      const { db } = await initFirebase();
      
      // タスクを完了状態に更新
      await updateDoc(doc(db, 'tasks', task.id), {
        completed: true,
        completedAt: new Date(),
        learning: learning.trim(),
        updatedAt: new Date()
      });

      // 経験値を加算
      await addExperience(task.skillCategory);

      onTaskComplete();
      onClose();
    } catch (error) {
      setError('タスク完了の処理に失敗しました');
      console.error('タスク完了エラー:', error);
    }
  };

  const addExperience = async (skillCategory) => {
    if (!skillCategory) return;

    try {
      const { db } = await initFirebase();
      const userRef = doc(db, 'users', user.uid);
      
      // 現在のスキルデータを取得
      const userDoc = await getDoc(userRef);
      const currentSkills = userDoc.data().skills;
      
      // 経験値を加算（タスク完了で10ポイント）
      const expGain = 10;
      const currentSkill = currentSkills[skillCategory];
      let newExp = currentSkill.exp + expGain;
      let newLevel = currentSkill.level;

      // レベルアップチェック（100経験値でレベルアップ）
      if (newExp >= 100) {
        newLevel += Math.floor(newExp / 100);
        newExp = newExp % 100;
      }

      // スキルを更新
      await updateDoc(userRef, {
        [`skills.${skillCategory}.exp`]: newExp,
        [`skills.${skillCategory}.level`]: newLevel
      });

    } catch (error) {
      console.error('経験値加算エラー:', error);
    }
  };

  const progress = task?.estimatedTime ? 
    ((task.estimatedTime * 60 - timeLeft) / (task.estimatedTime * 60)) * 100 : 0;

  return (
    <>
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Timer sx={{ mr: 1 }} />
            <Typography variant="h6">
              {task?.title || 'タイマー'}
            </Typography>
          </Box>

          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Typography variant="h2" component="div" sx={{ fontFamily: 'monospace' }}>
              {formatTime(timeLeft)}
            </Typography>
            <LinearProgress 
              variant="determinate" 
              value={progress} 
              sx={{ height: 8, borderRadius: 4, mt: 2 }}
            />
          </Box>

          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
            {!isRunning ? (
              <Button
                variant="contained"
                startIcon={<PlayArrow />}
                onClick={handleStart}
                disabled={timeLeft === 0}
              >
                開始
              </Button>
            ) : isPaused ? (
              <Button
                variant="contained"
                startIcon={<PlayArrow />}
                onClick={handleResume}
              >
                再開
              </Button>
            ) : (
              <Button
                variant="outlined"
                startIcon={<Pause />}
                onClick={handlePause}
              >
                一時停止
              </Button>
            )}
            
            <Button
              variant="outlined"
              startIcon={<Stop />}
              onClick={handleStop}
              disabled={!isRunning && timeLeft === (task?.estimatedTime * 60)}
            >
              リセット
            </Button>
          </Box>

          {task?.estimatedTime && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>
              予定時間: {task.estimatedTime}分
            </Typography>
          )}
        </CardContent>
      </Card>

      {/* 完了ダイアログ */}
      <Dialog open={showCompleteDialog} onClose={() => setShowCompleteDialog(false)}>
        <DialogTitle>タスク完了</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            お疲れさまでした！このタスクで学んだことを教えてください。
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="学んだこと"
            value={learning}
            onChange={(e) => setLearning(e.target.value)}
            margin="normal"
            placeholder="このタスクを通じて学んだことや気づいたことを記録してください..."
          />
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowCompleteDialog(false)}>
            キャンセル
          </Button>
          <Button 
            onClick={handleComplete} 
            variant="contained"
            disabled={!learning.trim()}
          >
            完了
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
} 