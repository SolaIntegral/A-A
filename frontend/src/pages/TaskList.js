import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Button, Collapse, IconButton } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import TaskCard from '../components/TaskCard';
import SnoozeDialog from '../components/SnoozeDialog';
import { getTasks, completeTask, snoozeTask, deleteTask } from '../api/tasks';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

const TaskList = () => {
  const [tasks, setTasks] = useState([]);
  const [snoozeDialogOpen, setSnoozeDialogOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [showCompleted, setShowCompleted] = useState(false);
  const navigate = useNavigate();

  const fetchTasks = async () => {
    try {
      const data = await getTasks();
      setTasks(data);
    } catch (error) {
      console.error('タスクの取得に失敗しました:', error);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleComplete = async (taskId) => {
    try {
      await completeTask(taskId);
      fetchTasks();
    } catch (error) {
      console.error('タスクの完了に失敗しました:', error);
    }
  };

  const handleSnooze = async (taskId) => {
    setSelectedTaskId(taskId);
    setSnoozeDialogOpen(true);
  };

  const handleSnoozeSubmit = async (reason) => {
    try {
      await snoozeTask(selectedTaskId, reason);
      fetchTasks();
    } catch (error) {
      console.error('タスクの延期に失敗しました:', error);
    }
  };

  const handleDelete = async (taskId) => {
    if (window.confirm('このタスクを削除してもよろしいですか？')) {
      try {
        await deleteTask(taskId);
        fetchTasks();
      } catch (error) {
        console.error('タスクの削除に失敗しました:', error);
      }
    }
  };

  const handleEdit = (taskId) => {
    navigate(`/tasks/edit/${taskId}`);
  };

  const incompleteTasks = tasks.filter(task => task.status !== 'completed');
  const completedTasks = tasks.filter(task => task.status === 'completed');

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" component="h1">
          タスク一覧
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate('/tasks/add')}
        >
          新規タスク作成
        </Button>
      </Box>

      {tasks.length === 0 ? (
        <Typography variant="body1" color="text.secondary" align="center">
          タスクがありません。新しいタスクを作成しましょう！
        </Typography>
      ) : (
        <>
          <Typography variant="h5" gutterBottom>
            未完了タスク
          </Typography>
          {incompleteTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onComplete={handleComplete}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
          {completedTasks.length > 0 && (
            <Box sx={{ mt: 4 }}>
              <Box 
                display="flex" 
                alignItems="center" 
                onClick={() => setShowCompleted(!showCompleted)}
                sx={{ cursor: 'pointer' }}
              >
                <Typography variant="h5">
                  完了済みタスク ({completedTasks.length})
                </Typography>
                <IconButton size="small">
                  {showCompleted ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
              </Box>
              <Collapse in={showCompleted}>
                {completedTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onComplete={handleComplete}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </Collapse>
            </Box>
          )}
        </>
      )}

      <SnoozeDialog
        open={snoozeDialogOpen}
        onClose={() => setSnoozeDialogOpen(false)}
        onSnooze={handleSnoozeSubmit}
      />
    </Container>
  );
};

export default TaskList; 