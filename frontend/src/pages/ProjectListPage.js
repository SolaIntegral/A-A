import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Card,
  CardContent,
  CardActions,
  Collapse,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip
} from '@mui/material';
import { Add, Edit, Delete, ExpandMore } from '@mui/icons-material';
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, orderBy, where, getDocs } from 'firebase/firestore';
import { useAuth } from '../components/Auth/AuthProvider';
import { initFirebase } from '../firebase';
import dayjs from 'dayjs';

export default function ProjectListPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [openForm, setOpenForm] = useState(false);
  const [editProject, setEditProject] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '', startDate: '', endDate: '' });
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(null);
  const [tasksByProject, setTasksByProject] = useState({});

  useEffect(() => {
    if (!user) return;
    const fetchProjects = async () => {
      const { db } = await initFirebase();
      const q = query(collection(db, 'projects'), orderBy('createdAt', 'desc'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        setProjects(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      });
      return unsubscribe;
    };
    fetchProjects();
  }, [user]);

  // プロジェクトごとのタスクを取得
  useEffect(() => {
    if (!user || projects.length === 0) return;
    const fetchTasks = async () => {
      const { db } = await initFirebase();
      let newTasksByProject = {};
      for (const project of projects) {
        const q = query(collection(db, 'tasks'), where('project', '==', project.name), where('userId', '==', user.uid));
        const snap = await getDocs(q);
        newTasksByProject[project.id] = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      }
      setTasksByProject(newTasksByProject);
    };
    fetchTasks();
  }, [projects, user]);

  const handleOpenForm = (project = null) => {
    setEditProject(project);
    setFormData({
      name: project?.name || '',
      description: project?.description || '',
      startDate: project?.startDate || '',
      endDate: project?.endDate || ''
    });
    setOpenForm(true);
  };

  const handleCloseForm = () => {
    setOpenForm(false);
    setEditProject(null);
    setFormData({ name: '', description: '', startDate: '', endDate: '' });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const { db } = await initFirebase();
      if (editProject) {
        await updateDoc(doc(db, 'projects', editProject.id), {
          ...formData,
          updatedAt: new Date()
        });
      } else {
        await addDoc(collection(db, 'projects'), {
          ...formData,
          userId: user.uid,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
      handleCloseForm();
    } catch (error) {
      alert('保存に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('このプロジェクトを削除しますか？')) return;
    try {
      const { db } = await initFirebase();
      await deleteDoc(doc(db, 'projects', id));
    } catch (error) {
      alert('削除に失敗しました');
    }
  };

  const handleAccordionChange = (projectId) => {
    setExpanded(expanded === projectId ? null : projectId);
  };

  // タイムライン用: プロジェクトの期間の最小・最大日を計算
  const allDates = projects.flatMap(p => [p.startDate, p.endDate].filter(Boolean));
  const minDate = allDates.length ? dayjs(allDates.filter(Boolean).sort()[0]) : null;
  const maxDate = allDates.length ? dayjs(allDates.filter(Boolean).sort().reverse()[0]) : null;
  const totalDays = minDate && maxDate ? maxDate.diff(minDate, 'day') + 1 : 1;

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4">プロジェクトタイムライン</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => handleOpenForm()}>
          新規作成
        </Button>
      </Box>
      {/* タイムライン表示 */}
      <Box sx={{ overflowX: 'auto', mb: 4, border: '1px solid #eee', borderRadius: 2, p: 2, background: '#fafbfc' }}>
        <Box sx={{ minWidth: 600 }}>
          {projects.length === 0 && (
            <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
              プロジェクトがありません。新しいプロジェクトを作成しましょう！
            </Typography>
          )}
          {projects.map((project, idx) => {
            const start = project.startDate ? dayjs(project.startDate) : null;
            const end = project.endDate ? dayjs(project.endDate) : null;
            let left = 0, width = 0;
            if (start && end && minDate && totalDays > 0) {
              left = ((start.diff(minDate, 'day')) / totalDays) * 100;
              width = ((end.diff(start, 'day') + 1) / totalDays) * 100;
            }
            return (
              <Box key={project.id} sx={{ display: 'flex', alignItems: 'center', mb: 2, height: 40 }}>
                <Box sx={{ width: 120, minWidth: 120, pr: 2 }}>
                  <Typography variant="body1" noWrap>{project.name}</Typography>
                  <Typography variant="caption" color="text.secondary" noWrap>
                    {project.startDate || '未設定'} ~ {project.endDate || '未設定'}
                  </Typography>
                </Box>
                <Box sx={{ flex: 1, position: 'relative', height: 24, background: '#f0f0f0', borderRadius: 1 }}>
                  {start && end && minDate ? (
                    <Box sx={{
                      position: 'absolute',
                      left: `${left}%`,
                      width: `${width}%`,
                      height: 24,
                      background: '#1976d2',
                      borderRadius: 1,
                      transition: 'all 0.3s',
                      display: 'flex',
                      alignItems: 'center',
                      color: 'white',
                      px: 1,
                      fontSize: 14
                    }}>
                      {project.name}
                    </Box>
                  ) : (
                    <Box sx={{ position: 'absolute', left: 0, width: '100%', height: 24, background: '#ccc', borderRadius: 1, color: '#fff', display: 'flex', alignItems: 'center', px: 1, fontSize: 14 }}>
                      期間未設定
                    </Box>
                  )}
                </Box>
              </Box>
            );
          })}
        </Box>
      </Box>
      <Dialog open={openForm} onClose={handleCloseForm} maxWidth="sm" fullWidth>
        <DialogTitle>{editProject ? 'プロジェクト編集' : '新規プロジェクト作成'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="normal"
            label="プロジェクト名"
            name="name"
            fullWidth
            value={formData.name}
            onChange={handleChange}
          />
          <TextField
            margin="normal"
            label="説明"
            name="description"
            fullWidth
            multiline
            rows={3}
            value={formData.description}
            onChange={handleChange}
          />
          <TextField
            margin="normal"
            label="開始日"
            name="startDate"
            type="date"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={formData.startDate}
            onChange={handleChange}
          />
          <TextField
            margin="normal"
            label="終了日"
            name="endDate"
            type="date"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={formData.endDate}
            onChange={handleChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseForm}>キャンセル</Button>
          <Button onClick={handleSubmit} variant="contained" disabled={loading}>{editProject ? '更新' : '作成'}</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
} 