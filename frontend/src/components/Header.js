import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { logout } from '../api/auth';

const Header = ({ isAuthenticated, onLogout }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    onLogout();
    navigate('/auth');
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          <RouterLink to="/" style={{ color: 'white', textDecoration: 'none' }}>
            Budy
          </RouterLink>
        </Typography>
        <Box>
          {isAuthenticated ? (
            <>
              <Button color="inherit" component={RouterLink} to="/tasks">
                タスク一覧
              </Button>
              <Button color="inherit" component={RouterLink} to="/tasks/add">
                タスク追加
              </Button>
              <Button color="inherit" onClick={handleLogout}>
                ログアウト
              </Button>
            </>
          ) : (
            <Button color="inherit" component={RouterLink} to="/auth">
              ログイン
            </Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header; 