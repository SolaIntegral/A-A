import React from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';

const SKILL_COLORS = {
  learning: '#2196f3',
  creativity: '#9c27b0',
  execution: '#4caf50',
  communication: '#ff9800'
};

const SKILL_LABELS = {
  learning: '学習力',
  creativity: '創造力',
  execution: '実行力',
  communication: 'コミュニケーション力'
};

export default function SkillProgress({ skillKey, level, exp, maxExp = 100 }) {
  const progress = (exp / maxExp) * 100;
  const color = SKILL_COLORS[skillKey];
  const label = SKILL_LABELS[skillKey];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 2 }}>
      <Box sx={{ position: 'relative', display: 'inline-flex' }}>
        <CircularProgress
          variant="determinate"
          value={progress}
          size={80}
          thickness={4}
          sx={{ color }}
        />
        <Box
          sx={{
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
            position: 'absolute',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography variant="caption" component="div" color="text.secondary">
            {level}
          </Typography>
        </Box>
      </Box>
      <Typography variant="body2" sx={{ mt: 1, fontWeight: 'bold' }}>
        {label}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        Lv.{level} ({exp}/{maxExp})
      </Typography>
    </Box>
  );
} 