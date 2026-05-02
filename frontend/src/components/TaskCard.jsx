import { format, isBefore, endOfDay } from 'date-fns';
import { Clock, AlertCircle, Trash2 } from 'lucide-react';

const TaskCard = ({ task, onStatusChange, onDelete, isAdmin, currentUser }) => {
  const isOverdue = task.dueDate && isBefore(endOfDay(new Date(task.dueDate)), new Date()) && task.status !== 'Done';
  
  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'High': return 'priority-high';
      case 'Medium': return 'priority-medium';
      case 'Low': return 'priority-low';
      default: return '';
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'ToDo': return 'status-todo';
      case 'InProgress': return 'status-inprogress';
      case 'Done': return 'status-done';
      default: return '';
    }
  };

  const canEditStatus = isAdmin || (currentUser?._id === task.assignedTo?._id);

  return (
    <div className={`task-card ${isOverdue ? 'task-overdue' : ''}`}>
      <div className="task-header">
        <h3>{task.title}</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span className={`status-badge ${getStatusColor(task.status)}`}>{task.status}</span>
          {isAdmin && (
            <button 
              onClick={() => { if(window.confirm('Are you sure you want to delete this task?')) onDelete(task._id); }}
              style={{ background: 'transparent', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: '0.2rem' }}
              title="Delete Task"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>
      
      <p className="task-desc">{task.description}</p>
      
      <div className="task-meta">
        <span className={`priority-badge ${getPriorityColor(task.priority)}`}>
          {task.priority}
        </span>
        
        {task.dueDate && (
          <span className={`due-date ${isOverdue ? 'text-danger' : ''}`}>
            {isOverdue ? <AlertCircle size={14}/> : <Clock size={14}/>}
            {format(new Date(task.dueDate), 'MMM dd, yyyy')}
          </span>
        )}
      </div>

      <div className="task-footer">
        <div className="assigned-to">
          {task.assignedTo ? (
            <div className="avatar" title={task.assignedTo.name}>
              {task.assignedTo.name.charAt(0).toUpperCase()}
            </div>
          ) : (
            <span className="unassigned">Unassigned</span>
          )}
        </div>

        {canEditStatus && task.status !== 'Done' && (
          <select 
            value={task.status} 
            onChange={(e) => onStatusChange(task._id, e.target.value)}
            className="status-select"
          >
            <option value="ToDo">To Do</option>
            <option value="InProgress">In Progress</option>
            <option value="Done">Done</option>
          </select>
        )}
      </div>
    </div>
  );
};

export default TaskCard;
