import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Box
} from '@mui/material';
import { Close } from '@mui/icons-material';
import PomodoroTimer from './PomodoroTimer';

export default function TimerModal({ open, onClose, task, onTaskComplete }) {
  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          ポモドーロタイマー
          <IconButton onClick={onClose}>
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        <PomodoroTimer 
          task={task} 
          onClose={onClose}
          onTaskComplete={onTaskComplete}
        />
      </DialogContent>
    </Dialog>
  );
} 