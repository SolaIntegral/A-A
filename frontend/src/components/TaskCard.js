import React from 'react';
import { Card, CardContent, Typography, Box, Button } from '@mui/material';

const TaskCard = ({ task, onComplete, onStart, onEdit, onDelete }) => {
  const isOverdue = task.due_date && new Date(task.due_date) < new Date();
  
  return (
    <Card 
      sx={{ 
        mb: 2,
        border: isOverdue ? '2px solid #ff6b6b' : 'none',
        backgroundColor: isOverdue ? '#fff5f5' : 'inherit'
      }}
    >
      <CardContent>
        <Typography variant="h6" component="div" sx={{ mb: 1, color: isOverdue ? '#ff6b6b' : 'inherit' }}>
          {task.title}
          {isOverdue && (
            <Typography component="span" sx={{ ml: 1, color: '#ff6b6b', fontSize: '0.8em' }}>
              (期限切れ)
            </Typography>
          )}
        </Typography>
        <Box sx={{ mb: 1 }}>
          <Typography variant="body2" color={isOverdue ? '#ff6b6b' : 'text.secondary'}>
            締切日: {task.due_date ? new Date(task.due_date).toLocaleDateString() : '-'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            実施予定日: {task.scheduled_date ? new Date(task.scheduled_date).toLocaleDateString() : '-'}
          </Typography>
        </Box>
        <Box display="flex" justifyContent="flex-end" gap={1}>
          {onStart && (
            <Button variant="outlined" color="primary" size="small" onClick={() => onStart(task)}>
              開始
            </Button>
          )}
          {onEdit && (
            <Button variant="outlined" color="secondary" size="small" onClick={() => onEdit(task.id)}>
              編集
            </Button>
          )}
          {onDelete && (
            <Button variant="outlined" color="error" size="small" onClick={() => onDelete(task.id)}>
              削除
            </Button>
          )}
          {onComplete && task.status !== 'completed' && (
            <Button variant="contained" color="primary" size="small" onClick={() => onComplete(task.id)}>
              完了
            </Button>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default TaskCard; 