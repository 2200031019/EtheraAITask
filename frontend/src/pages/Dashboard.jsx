import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../api/axios';
import { CheckCircle, Clock, AlertTriangle, ListTodo } from 'lucide-react';
import TaskCard from '../components/TaskCard';
import { isBefore, endOfDay } from 'date-fns';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState({ totalTasks: 0, completedTasks: 0, overdueTasks: 0, totalProjects: 0 });
  const [recentTasks, setRecentTasks] = useState([]);
  const [recentProjects, setRecentProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [tasksRes, projectsRes] = await Promise.all([
          api.get('/tasks'),
          api.get('/projects')
        ]);
        
        const tasks = tasksRes.data;
        const projects = projectsRes.data;
        
        const now = new Date();
        const completedTasks = tasks.filter(t => t.status === 'Done').length;
        const overdueTasks = tasks.filter(t => t.dueDate && isBefore(endOfDay(new Date(t.dueDate)), now) && t.status !== 'Done').length;
        
        setStats({ 
          totalTasks: tasks.length, 
          completedTasks, 
          overdueTasks,
          totalProjects: projects.length 
        });
        
        // Get top 3 recent items
        setRecentTasks(tasks.slice(0, 3));
        setRecentProjects(projects.slice(0, 3));
      } catch (error) {
        toast.error("Failed to load dashboard data");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await api.patch(`/tasks/${taskId}/status`, { status: newStatus });
      setRecentTasks(recentTasks.map(t => t._id === taskId ? { ...t, status: newStatus } : t));
      
      // Update stats based on status change
      if (newStatus === 'Done') {
        setStats(prev => ({...prev, completedTasks: prev.completedTasks + 1}));
      }
    } catch (error) {
      console.error('Failed to update status', error);
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await api.delete(`/tasks/${taskId}`);
      setRecentTasks(recentTasks.filter(t => t._id !== taskId));
      setStats(prev => ({ ...prev, totalTasks: prev.totalTasks - 1 }));
      toast.success('Task deleted successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete task');
    }
  };

  if (loading) return (
    <div className="page-container">
      <div className="skeleton" style={{height: '60px', width: '300px', marginBottom: '2rem'}}></div>
      <div className="stats-grid">
        {[1,2,3,4].map(i => <div key={i} className="stat-card skeleton" style={{height: '100px'}}></div>)}
      </div>
      <div className="mt-8 skeleton" style={{height: '200px', width: '100%'}}></div>
    </div>
  );

  return (
    <div className="page-container">
      <header className="page-header">
        <h1>Dashboard</h1>
        <p>Overview of your current workload and task statuses.</p>
      </header>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon bg-primary-light text-primary">
            <ListTodo size={24} />
          </div>
          <div className="stat-details">
            <h3>{stats.totalTasks}</h3>
            <p>Total Tasks</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon bg-primary-light text-primary" style={{ background: '#e0e7ff', color: '#4f46e5' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
          </div>
          <div className="stat-details">
            <h3>{stats.totalProjects}</h3>
            <p>Projects</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon bg-success-light text-success">
            <CheckCircle size={24} />
          </div>
          <div className="stat-details">
            <h3>{stats.completedTasks}</h3>
            <p>Completed Tasks</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon bg-danger-light text-danger">
            <AlertTriangle size={24} />
          </div>
          <div className="stat-details">
            <h3>{stats.overdueTasks}</h3>
            <p>Overdue Tasks</p>
          </div>
        </div>
      </div>

      <div className="recent-tasks-section mt-8">
        <h2 className="section-title">Recent Tasks</h2>
        {recentTasks.length === 0 ? (
          <div className="empty-state">No tasks found. Get started by creating one!</div>
        ) : (
          <div className="tasks-grid">
            {recentTasks.map(task => (
              <TaskCard 
                key={task._id} 
                task={task} 
                onStatusChange={handleStatusChange} 
                onDelete={handleDeleteTask}
                isAdmin={user?.role === 'Admin'}
                currentUser={user}
              />
            ))}
          </div>
        )}
      </div>

      <div className="recent-projects-section mt-8">
        <h2 className="section-title">Your Projects</h2>
        {recentProjects.length === 0 ? (
          <div className="empty-state">No projects found.</div>
        ) : (
          <div className="projects-grid">
            {recentProjects.map(project => (
              <div key={project._id} className="project-card">
                <h3>{project.name}</h3>
                <p className="project-desc">{project.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
