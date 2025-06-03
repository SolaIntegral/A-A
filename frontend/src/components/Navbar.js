import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@mui/material';

const Navbar = () => {
  return (
    <div>
      <Button color="inherit" component={Link} to="/tasks">
        タスク一覧
      </Button>
      <Button color="inherit" component={Link} to="/profile">
        プロフィール
      </Button>
    </div>
  );
};

export default Navbar; 