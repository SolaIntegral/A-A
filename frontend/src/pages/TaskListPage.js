import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Button,
  Box,
  Collapse
} from '@mui/material';
import { Add, ExpandMore, ExpandLess } from '@mui/icons-material';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { useAuth } from '../components/Auth/AuthProvider';
import { initFirebase } from '../firebase';
import TaskCard from '../components/Tasks/TaskCard';

export default function TaskListPage() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (!user) return;

    const loadTasks = async () => {
      try {
        const { db } = await initFirebase();
        const q = query(
          collection(db, 'tasks'),
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
          const taskList = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setTasks(taskList);
        });

        return unsubscribe;
      } catch (error) {
        console.error('タスク読み込みエラー:', error);
      }
    };

    loadTasks();
  }, [user]);

  const incompleteTasks = tasks.filter(task => !task.completed);
  const completedTasks = tasks.filter(task => task.completed);

  const handleStartTimer = (task) => {
    // タイマー機能は後で実装
    console.log('タイマー開始:', task);
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            タスク一覧
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<Add />}
            onClick={() => window.location.href = '/tasks/add'}
          >
            新規作成
          </Button>
        </Box>

        {/* 未完了タスクセクション */}
        <Typography variant="h6" gutterBottom>
          未完了のタスク ({incompleteTasks.length})
        </Typography>
        
        {incompleteTasks.length === 0 ? (
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            タスクがありません。新しいタスクを作成しましょう！
          </Typography>
        ) : (
          <Box sx={{ mb: 3 }}>
            {incompleteTasks.map(task => (
              <TaskCard
                key={task.id}
                task={task}
                onStartTimer={handleStartTimer}
              />
            ))}
          </Box>
        )}

        {/* 完了済みタスクセクション */}
        {completedTasks.length > 0 && (
          <Box>
            <Button
              fullWidth
              onClick={() => setExpanded(!expanded)}
              endIcon={expanded ? <ExpandLess /> : <ExpandMore />}
              sx={{ mb: 2 }}
            >
              完了済みのタスク ({completedTasks.length})
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
      </Box>
    </Container>
  );
} 