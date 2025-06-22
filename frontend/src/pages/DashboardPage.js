import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Collapse,
  Card,
  CardContent,
  CardActions
} from '@mui/material';
import { ExpandMore, ExpandLess } from '@mui/icons-material';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { useAuth } from '../components/Auth/AuthProvider';
import { initFirebase } from '../firebase';
import TaskCard from '../components/Tasks/TaskCard';

export default function DashboardPage() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (!user) return;

    const loadData = async () => {
      try {
        const { db } = await initFirebase();
        
        // タスクの読み込み
        const tasksQuery = query(
          collection(db, 'tasks'),
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc')
        );

        const unsubscribeTasks = onSnapshot(tasksQuery, (snapshot) => {
          const taskList = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setTasks(taskList);
        });

        return () => {
          unsubscribeTasks();
        };
      } catch (error) {
        console.error('データ読み込みエラー:', error);
      }
    };

    loadData();
  }, [user]);

  const today = new Date().toISOString().split('T')[0];
  
  // 未完了タスク
  const incompleteTasks = tasks.filter(task => !task.completed);
  
  // 完了済みタスク
  const completedTasks = tasks.filter(task => task.completed);

  const handleStartTimer = (task) => {
    // タイマー機能は後で実装
    console.log('タイマー開始:', task);
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 6 }}>
        <Typography variant="h4" component="h1" align="center" gutterBottom>
          今日のフォーカスタスク
        </Typography>
        
        {incompleteTasks.length === 0 ? (
          <Typography color="text.secondary" align="center">
            実施予定のタスクはありません。
          </Typography>
        ) : (
          <Box>
            {incompleteTasks.map(task => (
              <TaskCard
                key={task.id}
                task={task}
                onStartTimer={handleStartTimer}
              />
            ))}
          </Box>
        )}

        {completedTasks.length > 0 && (
          <Box sx={{ mt: 4 }}>
            <Button
              fullWidth
              onClick={() => setExpanded(!expanded)}
              endIcon={expanded ? <ExpandLess /> : <ExpandMore />}
              sx={{ mb: 2 }}
            >
              完了済みタスク ({completedTasks.length})
            </Button>
            
            <Collapse in={expanded}>
              <Box>
                {completedTasks.map(task => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onStartTimer={handleStartTimer}
                  />
                ))}
              </Box>
            </Collapse>
          </Box>
        )}

        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Button
            variant="outlined"
            color="primary"
            onClick={() => window.location.href = '/tasks'}
          >
            タスク一覧ページへ
          </Button>
        </Box>
      </Box>
    </Container>
  );
} 