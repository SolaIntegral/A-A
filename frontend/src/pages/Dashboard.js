import React, { useEffect, useState } from 'react';
import { Container, Typography, Box, Button, Collapse, IconButton } from '@mui/material';
import TaskCard from '../components/TaskCard';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

const Dashboard = () => {
  const [incompleteTasks, setIncompleteTasks] = useState([]);
  const [completedTasks, setCompletedTasks] = useState([]);
  const [showCompleted, setShowCompleted] = useState(false);
  const navigate = useNavigate();

  const fetchDashboardTasks = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:8000/api/v1/dashboard-tasks/', {
        headers: { Authorization: `JWT ${token}` },
      });
      setIncompleteTasks(res.data.incomplete || []);
      setCompletedTasks(res.data.completed || []);
    } catch (err) {
      setIncompleteTasks([]);
      setCompletedTasks([]);
    }
  };

  useEffect(() => {
    fetchDashboardTasks();
  }, []);

  const handleComplete = async (taskId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`http://localhost:8000/api/v1/tasks/${taskId}/complete/`, {}, {
        headers: { Authorization: `JWT ${token}` },
      });
      fetchDashboardTasks();
    } catch (err) {
      // エラー時の処理（必要ならアラート等）
    }
  };

  const handleStart = (task) => {
    navigate(`/tasks/timer/${task.id}`);
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 6 }}>
      <Typography variant="h4" align="center" gutterBottom>
        今日のフォーカスタスク
      </Typography>
      <Box sx={{ mt: 4 }}>
        {incompleteTasks.length === 0 && completedTasks.length === 0 ? (
          <Typography align="center" color="text.secondary">
            実施予定のタスクはありません。
          </Typography>
        ) : (
          <>
            <Typography variant="h6" gutterBottom>未完了タスク</Typography>
            {incompleteTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onComplete={handleComplete}
                onStart={handleStart}
              />
            ))}
            
            {completedTasks.length > 0 && (
              <Box sx={{ mt: 3 }}>
                <Box 
                  display="flex" 
                  alignItems="center" 
                  onClick={() => setShowCompleted(!showCompleted)}
                  sx={{ cursor: 'pointer' }}
                >
                  <Typography variant="h6">
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
                      onStart={handleStart}
                    />
                  ))}
                </Collapse>
              </Box>
            )}
          </>
        )}
      </Box>
      <Box display="flex" justifyContent="center" mt={4}>
        <Button variant="outlined" onClick={() => navigate('/tasks')}>
          タスク一覧ページへ
        </Button>
      </Box>
    </Container>
  );
};

export default Dashboard; 