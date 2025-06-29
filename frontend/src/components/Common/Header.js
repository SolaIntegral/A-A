import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { useAuth } from '../Auth/AuthProvider';
import { initFirebase } from '../../firebase';

export default function Header() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const { auth } = await initFirebase();
      await signOut(auth);
      navigate('/auth');
    } catch (error) {
      console.error('ログアウトエラー:', error);
    }
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography 
          variant="h6" 
          component="div" 
          sx={{ flexGrow: 1, cursor: user ? 'pointer' : 'default' }}
          onClick={user ? () => navigate('/') : undefined}
        >
          A-A
        </Typography>
        
        {user ? (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button color="inherit" onClick={() => navigate('/tasks')}>
              Task List
            </Button>
            <Button color="inherit" onClick={() => navigate('/projects')}>
              Projects
            </Button>
            <Button color="inherit" onClick={() => navigate('/profile')}>
              Memory
            </Button>
            <Button color="inherit" onClick={handleLogout}>
              Logout
            </Button>
          </Box>
        ) : (
          <Button color="inherit" onClick={() => navigate('/auth')}>
            Login
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
} 