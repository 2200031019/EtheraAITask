import React, { useState, useEffect, useContext } from 'react';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import TaskCard from '../components/TaskCard';
import { Plus, Filter } from 'lucide-react';
import toast from 'react-hot-toast';

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filterMode, setFilterMode] = useState('All'); // 'All' or 'MyTasks'
  const { user } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    title: '', description: '', projectId: '', assignedTo: '', priority: 'Medium', dueDate: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [tasksRes, projRes, usersRes] = await Promise.all([
        api.get('/tasks'),
        api.get('/projects'),
        api.get('/auth/users')
      ]);
      setTasks(tasksRes.data);
      setProjects(projRes.data);
      setUsers(usersRes.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/tasks', formData);
      setShowModal(false);
      fetchData();
      toast.success('Task created successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create task');
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await api.patch(`/tasks/${taskId}/status`, { status: newStatus });
      setTasks(tasks.map(t => t._id === taskId ? { ...t, status: newStatus } : t));
      toast.success('Task status updated!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update status');
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await api.delete(`/tasks/${taskId}`);
      setTasks(tasks.filter(t => t._id !== taskId));
      toast.success('Task deleted successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete task');
    }
  };

  if (loading) return (
    <div className="page-container">
      <div className="skeleton" style={{height: '40px', width: '200px', marginBottom: '2rem'}}></div>
      <div className="kanban-board">
        {[1,2,3].map(i => (
          <div key={i} className="kanban-column skeleton" style={{height: '300px'}}></div>
        ))}
      </div>
    </div>
  );

  const displayedTasks = filterMode === 'MyTasks' 
    ? tasks.filter(t => t.assignedTo?._id === user?._id)
    : tasks;

  const groupedTasks = {
    ToDo: displayedTasks.filter(t => t.status === 'ToDo'),
    InProgress: displayedTasks.filter(t => t.status === 'InProgress'),
    Done: displayedTasks.filter(t => t.status === 'Done'),
  };

  // Filter users for the dropdown based on selected project
  const selectedProjectObj = projects.find(p => p._id === formData.projectId);
  const assignableUsers = selectedProjectObj 
    ? users.filter(u => selectedProjectObj.members.some(m => (m._id || m) === u._id))
    : [];

  return (
    <div className="page-container">
      <header className="page-header flex-between">
        <div>
          <h1>Tasks Board</h1>
          <p>Track your team's progress.</p>
        </div>
        <div className="flex-center gap-2">
          <button 
            className="btn btn-secondary flex-center gap-2"
            onClick={() => setFilterMode(filterMode === 'All' ? 'MyTasks' : 'All')}
          >
            <Filter size={18} /> {filterMode === 'All' ? 'View My Tasks' : 'View All Tasks'}
          </button>
          {user?.role === 'Admin' && (
            <button className="btn btn-primary flex-center gap-2" onClick={() => setShowModal(true)}>
              <Plus size={18} /> New Task
            </button>
          )}
        </div>
      </header>

      <div className="kanban-board">
        {['ToDo', 'InProgress', 'Done'].map(status => (
          <div key={status} className="kanban-column">
            <h3 className="kanban-col-title">
              {status.replace(/([A-Z])/g, ' $1').trim()} 
              <span className="task-count">{groupedTasks[status].length}</span>
            </h3>
            <div className="kanban-cards">
              {groupedTasks[status].map(task => (
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
          </div>
        ))}
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Create New Task</h2>
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label>Title</label>
                <input type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} rows="2"></textarea>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Project</label>
                  <select value={formData.projectId} onChange={e => setFormData({...formData, projectId: e.target.value})} required>
                    <option value="">Select Project</option>
                    {projects.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Assignee</label>
                  <select value={formData.assignedTo} onChange={e => setFormData({...formData, assignedTo: e.target.value})}>
                    <option value="">Unassigned</option>
                    {assignableUsers.map(u => <option key={u._id} value={u._id}>{u.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Priority</label>
                  <select value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value})}>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Due Date</label>
                  <input type="date" value={formData.dueDate} onChange={e => setFormData({...formData, dueDate: e.target.value})} />
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Task</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tasks;
