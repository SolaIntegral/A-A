import React, { useState, useEffect } from 'react';
import { Container, Typography, Box } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import TaskForm from '../components/TaskForm';
import { createTask, getTask, updateTask } from '../api/tasks';

const TaskFormPage = () => {
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    const fetchTask = async () => {
      if (id) {
        try {
          const data = await getTask(id);
          setTask(data);
        } catch (error) {
          console.error('タスクの取得に失敗しました:', error);
          navigate('/tasks');
        }
      }
    };

    fetchTask();
  }, [id, navigate]);

  const handleSubmit = async (formData) => {
    setLoading(true);
    try {
      if (id) {
        await updateTask(id, formData);
      } else {
        await createTask(formData);
      }
      navigate('/tasks');
    } catch (error) {
      console.error('タスクの保存に失敗しました:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/tasks');
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        {id ? 'タスクの編集' : '新規タスク作成'}
      </Typography>

      <Box sx={{ mt: 4 }}>
        <TaskForm
          initialData={task}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          loading={loading}
        />
      </Box>
    </Container>
  );
};

export default TaskFormPage; 