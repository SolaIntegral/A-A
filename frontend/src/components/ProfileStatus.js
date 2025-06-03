import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, CircularProgress, Grid } from '@mui/material';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import axios from 'axios';

const ProfileStatus = () => {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const response = await axios.get('/api/user-profile/');
        setProfileData(response.data);
        setLoading(false);
      } catch (err) {
        setError('プロフィール情報の取得に失敗しました');
        setLoading(false);
      }
    };

    fetchProfileData();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={2}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  const { profile, statuses } = profileData;

  const getStatusLabel = (type) => {
    const labels = {
      learning: '学習力',
      creativity: '創造力',
      execution: '実行力',
      communication: 'コミュニケーション力'
    };
    return labels[type] || type;
  };

  return (
    <Box p={3}>
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          全体レベル
        </Typography>
        <Box display="flex" alignItems="center" gap={2}>
          <Box width={100} height={100}>
            <CircularProgressbar
              value={(profile.experience / (profile.level * 100)) * 100}
              text={`Lv.${profile.level}`}
              styles={buildStyles({
                pathColor: '#2196f3',
                textColor: '#2196f3',
              })}
            />
          </Box>
          <Box>
            <Typography variant="body1">
              経験値: {profile.experience} / {profile.level * 100}
            </Typography>
          </Box>
        </Box>
      </Paper>

      <Typography variant="h5" gutterBottom sx={{ mt: 4, mb: 2 }}>
        ステータス
      </Typography>
      <Grid container spacing={3}>
        {statuses.map((status) => (
          <Grid item xs={12} sm={6} md={3} key={status.status_type}>
            <Paper elevation={3} sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                {getStatusLabel(status.status_type)}
              </Typography>
              <Box width={80} height={80} mx="auto">
                <CircularProgressbar
                  value={(status.experience / (status.level * 50)) * 100}
                  text={`Lv.${status.level}`}
                  styles={buildStyles({
                    pathColor: '#4caf50',
                    textColor: '#4caf50',
                  })}
                />
              </Box>
              <Typography variant="body2" align="center" sx={{ mt: 1 }}>
                経験値: {status.experience} / {status.level * 50}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default ProfileStatus; 