import React, { useState, useEffect } from 'react';
import { Container, Typography, Box } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import TaskForm from '../components/TaskForm';
import { createTask, getTask, updateTask } from '../api/tasks';

const TaskFormPage = () => {
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
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
    setApiError('');
    try {
      if (id) {
        await updateTask(id, formData);
      } else {
        await createTask(formData);
      }
      navigate('/tasks');
    } catch (error) {
      if (error.response && error.response.data && error.response.data.detail) {
        setApiError(error.response.data.detail);
      } else if (error.response && error.response.data && typeof error.response.data === 'string') {
        setApiError(error.response.data);
      } else {
        setApiError('タスクの保存に失敗しました。');
      }
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
          errorMessage={apiError}
        />
      </Box>
    </Container>
  );
};

export default TaskFormPage; 