import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
} from '@mui/material';

const SnoozeDialog = ({ open, onClose, onSnooze }) => {
  const [reason, setReason] = useState('');

  const handleSubmit = () => {
    onSnooze(reason);
    setReason('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>タスクの延期</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="延期理由"
          fullWidth
          multiline
          rows={4}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>キャンセル</Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          延期
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SnoozeDialog; 