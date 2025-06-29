import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Card,
  CardContent,
  CardActions,
  Divider
} from '@mui/material';
import { collection, query, where, orderBy, onSnapshot, updateDoc, doc } from 'firebase/firestore';
import { useAuth } from '../components/Auth/AuthProvider';
import { initFirebase } from '../firebase';

export default function MemoryPage() {
  const { user } = useAuth();
  const [completedTasks, setCompletedTasks] = useState([]);
  const [completedProjects, setCompletedProjects] = useState([]);
  const [editMemo, setEditMemo] = useState({});
  const [loading, setLoading] = useState(false);

  // 完了タスク取得
  useEffect(() => {
    if (!user) return;
    const fetchTasks = async () => {
      const { db } = await initFirebase();
      const q = query(
        collection(db, 'tasks'),
        where('userId', '==', user.uid),
        where('completed', '==', true),
        orderBy('updatedAt', 'desc')
      );
      onSnapshot(q, (snapshot) => {
        setCompletedTasks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      });
    };
    fetchTasks();
  }, [user]);

  // 完了プロジェクト取得（終了日が過去 or 明示的な完了フラグ）
  useEffect(() => {
    if (!user) return;
    const fetchProjects = async () => {
      const { db } = await initFirebase();
      const q = query(
        collection(db, 'projects'),
        where('userId', '==', user.uid),
        orderBy('endDate', 'desc')
      );
      onSnapshot(q, (snapshot) => {
        // 終了日が今日以前のものだけ表示
        const today = new Date().toISOString().split('T')[0];
        setCompletedProjects(snapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(p => p.endDate && p.endDate <= today)
        );
      });
    };
    fetchProjects();
  }, [user]);

  // メモ編集用
  const handleMemoChange = (type, id, value) => {
    setEditMemo(prev => ({ ...prev, [`${type}_${id}`]: value }));
  };

  const handleSaveMemo = async (type, item) => {
    setLoading(true);
    try {
      const { db } = await initFirebase();
      const ref = doc(db, type === 'task' ? 'tasks' : 'projects', item.id);
      await updateDoc(ref, { learning: editMemo[`${type}_${item.id}`] || '' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>メモリーページ</Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        完了したタスクやプロジェクトの「学び」や「振り返り」を記録・参照できます。
      </Typography>

      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" gutterBottom>完了したタスク</Typography>
        {completedTasks.length === 0 && (
          <Typography color="text.secondary">完了したタスクはありません。</Typography>
        )}
        {completedTasks.map(task => (
          <Card key={task.id} variant="outlined" sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="subtitle1">{task.title} {task.project && <span style={{ color: '#1976d2' }}>#{task.project}</span>}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                完了日: {task.completedAt ? new Date(task.completedAt.seconds * 1000).toLocaleDateString() : '-'}
              </Typography>
              <TextField
                label="学んだこと・振り返り"
                fullWidth
                multiline
                minRows={2}
                value={editMemo[`task_${task.id}`] !== undefined ? editMemo[`task_${task.id}`] : (task.learning || '')}
                onChange={e => handleMemoChange('task', task.id, e.target.value)}
                sx={{ mb: 1 }}
              />
            </CardContent>
            <CardActions>
              <Button
                size="small"
                variant="contained"
                onClick={() => handleSaveMemo('task', task)}
                disabled={loading}
              >保存</Button>
            </CardActions>
          </Card>
        ))}
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>完了したプロジェクト</Typography>
        {completedProjects.length === 0 && (
          <Typography color="text.secondary">完了したプロジェクトはありません。</Typography>
        )}
        {completedProjects.map(project => (
          <Card key={project.id} variant="outlined" sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="subtitle1">{project.name}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                期間: {project.startDate || '-'} ~ {project.endDate || '-'}
              </Typography>
              <TextField
                label="学んだこと・振り返り"
                fullWidth
                multiline
                minRows={2}
                value={editMemo[`project_${project.id}`] !== undefined ? editMemo[`project_${project.id}`] : (project.learning || '')}
                onChange={e => handleMemoChange('project', project.id, e.target.value)}
                sx={{ mb: 1 }}
              />
            </CardContent>
            <CardActions>
              <Button
                size="small"
                variant="contained"
                onClick={() => handleSaveMemo('project', project)}
                disabled={loading}
              >保存</Button>
            </CardActions>
          </Card>
        ))}
      </Paper>
    </Box>
  );
} 