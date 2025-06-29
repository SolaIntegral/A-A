import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Button,
  Box,
  Collapse,
  Dialog,
  DialogTitle,
  DialogContent
} from '@mui/material';
import { Add, ExpandMore, ExpandLess } from '@mui/icons-material';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { useAuth } from '../components/Auth/AuthProvider';
import { initFirebase } from '../firebase';
import TaskCard from '../components/Tasks/TaskCard';
import TaskForm from '../components/Tasks/TaskForm';

export default function TaskListPage() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [expanded, setExpanded] = useState(false);
  const [openTaskForm, setOpenTaskForm] = useState(false);

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
            Task List
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<Add />}
            onClick={() => setOpenTaskForm(true)}
          >
            Add Task
          </Button>
        </Box>

        {/* Task Add Modal */}
        <Dialog open={openTaskForm} onClose={() => setOpenTaskForm(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Add New Task</DialogTitle>
          <DialogContent>
            <TaskForm onClose={() => setOpenTaskForm(false)} />
          </DialogContent>
        </Dialog>

        {/* Incomplete Tasks Section */}
        <Typography variant="h6" gutterBottom>
          Incomplete Tasks ({incompleteTasks.length})
        </Typography>
        
        {incompleteTasks.length === 0 ? (
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            No tasks. Let's add a new task!
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

        {/* Completed Tasks Section */}
        {completedTasks.length > 0 && (
          <Box>
            <Button
              fullWidth
              onClick={() => setExpanded(!expanded)}
              endIcon={expanded ? <ExpandLess /> : <ExpandMore />}
              sx={{ mb: 2 }}
            >
              Completed Tasks ({completedTasks.length})
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