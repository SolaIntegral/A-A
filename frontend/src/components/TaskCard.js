import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Chip,
  IconButton,
} from '@mui/material';
import { Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const TaskCard = ({ task, onComplete, onSnooze, onDelete }) => {
  const navigate = useNavigate();

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'default';
      case 'in_progress':
        return 'primary';
      case 'completed':
        return 'success';
      case 'snoozed':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending':
        return '未着手';
      case 'in_progress':
        return '進行中';
      case 'completed':
        return '完了';
      case 'snoozed':
        return '延期';
      default:
        return status;
    }
  };

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" component="div">
            {task.title}
          </Typography>
          <Box>
            <IconButton
              size="small"
              onClick={() => navigate(`/tasks/edit/${task.id}`)}
            >
              <EditIcon />
            </IconButton>
            <IconButton size="small" onClick={() => onDelete(task.id)}>
              <DeleteIcon />
            </IconButton>
          </Box>
        </Box>
        <Typography color="text.secondary" sx={{ mb: 1 }}>
          {task.description}
        </Typography>
        <Box display="flex" gap={1} sx={{ mb: 1 }}>
          <Chip
            label={getStatusLabel(task.status)}
            color={getStatusColor(task.status)}
            size="small"
          />
          {task.category && (
            <Chip label={task.category} variant="outlined" size="small" />
          )}
        </Box>
        {task.due_date && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            期限: {new Date(task.due_date).toLocaleString()}
          </Typography>
        )}
        {task.estimated_time && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            予定時間: {task.estimated_time}分
          </Typography>
        )}
        <Box display="flex" gap={1}>
          {task.status !== 'completed' && (
            <Button
              variant="contained"
              color="primary"
              size="small"
              onClick={() => onComplete(task.id)}
            >
              完了
            </Button>
          )}
          {task.status !== 'snoozed' && (
            <Button
              variant="outlined"
              color="warning"
              size="small"
              onClick={() => onSnooze(task.id)}
            >
              延期
            </Button>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default TaskCard; 