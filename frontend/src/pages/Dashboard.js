import React, { useEffect, useState } from 'react';
import { Container, Typography, Box, Button } from '@mui/material';
import TaskCard from '../components/TaskCard';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Dashboard = () => {
  const [tasks, setTasks] = useState([]);
  const navigate = useNavigate();

  const fetchDashboardTasks = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:8000/api/v1/dashboard-tasks/', {
        headers: { Authorization: `JWT ${token}` },
      });
      setTasks(res.data);
    } catch (err) {
      setTasks([]);
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
        {tasks.length === 0 ? (
          <Typography align="center" color="text.secondary">
            実施予定のタスクはありません。
          </Typography>
        ) : (
          tasks.map((task) => <TaskCard key={task.id} task={task} onComplete={handleComplete} onStart={handleStart} />)
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