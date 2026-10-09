import React, { useState, useEffect } from 'react';
import {
  CheckSquare,
  Plus,
  Search,
  Columns,
  List,
  Calendar,
  Clock,
  User,
  MessageSquare,
  Send,
} from 'lucide-react';
import { api } from '../services/api';
import { StatusBadge } from '../components/StatusBadge';
import { Modal } from '../components/Modal';
import { EmptyState } from '../components/EmptyState';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { useAuth } from '../context/AuthContext';

export const TasksPage = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Views & Filters
  const [viewMode, setViewMode] = useState('kanban'); // 'kanban', 'table', 'calendar'
  const [search, setSearch] = useState('');
  const [priority, setPriority] = useState('all');
  const [status, setStatus] = useState('all');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    project: '',
    assignedTo: '',
    priority: 'Medium',
    dueDate: '',
    status: 'Todo',
  });

  useEffect(() => {
    fetchData();
  }, [search, priority, status]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [resTasks, resProj, resUsers] = await Promise.all([
        api.getTasks({ search, priority, status }),
        api.getProjects(),
        api.getUsers(),
      ]);
      if (resTasks.success) setTasks(resTasks.data);
      if (resProj.success) setProjects(resProj.data);
      if (resUsers.success) setUsersList(resUsers.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = { ...formData };
      if (!payload.complianceRequirement) {
        delete payload.complianceRequirement;
      }
      if (!payload.assignedTo && user) {
        payload.assignedTo = user._id;
      }
      const res = await api.createTask(payload);
      if (res.success) {
        setIsModalOpen(false);
        setFormData({
          title: '',
          description: '',
          project: '',
          assignedTo: '',
          priority: 'Medium',
          dueDate: '',
          status: 'Todo',
        });
        fetchData();
      }
    } catch (err) {
      alert(err.message || 'Error creating task');
    } finally {
      setSubmitting(false);
    }
  };

  const handleMoveStatus = async (taskId, nextStatus) => {
    try {
      await api.updateTaskStatus(taskId, { status: nextStatus });
      fetchData();
      if (selectedTask && selectedTask._id === taskId) {
        setSelectedTask((prev) => ({ ...prev, status: nextStatus }));
      }
    } catch (err) {
      alert(err.message || 'Failed to update task status');
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !selectedTask) return;
    try {
      const res = await api.addTaskComment(selectedTask._id, { comment: newComment.trim() });
      if (res.success) {
        setNewComment('');
        setSelectedTask(res.data);
        fetchData();
      }
    } catch (err) {
      alert(err.message || 'Failed to add comment');
    }
  };

  const kanbanColumns = [
    { id: 'Todo', title: 'To Do', color: 'border-slate-400' },
    { id: 'In Progress', title: 'In Progress', color: 'border-blue-500' },
    { id: 'In Review', title: 'In Review', color: 'border-amber-500' },
    { id: 'Done', title: 'Completed', color: 'border-emerald-500' },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Compliance & Mitigation Tasks
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Assign statutory tasks, monitor deadlines, and resolve corrective action items.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold text-xs hover:bg-emerald-700 transition shadow-sm shadow-emerald-600/20"
        >
          <Plus className="w-4 h-4" />
          <span>Create Task</span>
        </button>
      </div>

      {/* Filter and View Control Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-card flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-3 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tasks by title or assignee..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-900 focus:border-emerald-500 dark:focus:border-emerald-400 outline-none text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 transition"
          />
        </div>

        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          className="px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-900 focus:border-emerald-500 dark:focus:border-emerald-400 outline-none text-slate-800 dark:text-slate-200 transition w-full md:w-auto"
        >
          <option value="all">All Priorities</option>
          <option value="Critical">Critical</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>

        {/* View Toggle */}
        <div className="flex items-center gap-1 border border-slate-200 dark:border-slate-700 rounded-xl p-1 bg-slate-50 dark:bg-slate-800 self-end md:self-auto">
          <button
            onClick={() => setViewMode('kanban')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              viewMode === 'kanban'
                ? 'bg-white dark:bg-slate-700 shadow-sm text-emerald-600 dark:text-emerald-400'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Columns className="w-3.5 h-3.5" />
            <span>Kanban</span>
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              viewMode === 'table'
                ? 'bg-white dark:bg-slate-700 shadow-sm text-emerald-600 dark:text-emerald-400'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            <span>Table</span>
          </button>
          <button
            onClick={() => setViewMode('calendar')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              viewMode === 'calendar'
                ? 'bg-white dark:bg-slate-700 shadow-sm text-emerald-600 dark:text-emerald-400'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Deadlines</span>
          </button>
        </div>
      </div>

      {/* Main Task Views */}
      {loading ? (
        <LoadingSkeleton type="cards" count={4} />
      ) : tasks.length === 0 ? (
        <EmptyState
          icon={CheckSquare}
          title="No tasks found"
          description="Create actionable tasks to fulfill environmental clearance conditions."
          actionLabel="Create Task"
          onAction={() => setIsModalOpen(true)}
        />
      ) : viewMode === 'kanban' ? (
        /* KANBAN BOARD VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 items-start">
          {kanbanColumns.map((col) => {
            const colTasks = tasks.filter((t) => t.status === col.id);
            return (
              <div
                key={col.id}
                className="bg-slate-100/70 dark:bg-slate-850/60 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 flex flex-col space-y-3 min-h-[500px]"
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-700/60">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                    <h3 className="font-bold text-xs text-slate-800 dark:text-slate-200 uppercase tracking-wider">{col.title}</h3>
                  </div>
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-full shadow-sm">
                    {colTasks.length}
                  </span>
                </div>

                <div className="space-y-3 flex-1">
                  {colTasks.map((t) => (
                    <div
                      key={t._id}
                      className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-4 shadow-sm hover:shadow-card transition flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-1 mb-2">
                          <span className="text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                            {t.project?.code}
                          </span>
                          <StatusBadge status={t.priority} size="xs" />
                        </div>

                        <h4
                          onClick={() => {
                            setSelectedTask(t);
                            setIsDetailOpen(true);
                          }}
                          className="font-bold text-xs text-slate-900 dark:text-white hover:text-emerald-600 dark:hover:text-emerald-400 transition cursor-pointer line-clamp-2"
                        >
                          {t.title}
                        </h4>

                        <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500">
                          <span className="flex items-center gap-1 text-slate-600 dark:text-slate-300 font-medium truncate max-w-[120px]">
                            <User className="w-3 h-3 text-slate-400" />
                            {t.assignedTo?.name || 'Assignee'}
                          </span>
                          <span className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
                            <Clock className="w-3 h-3 text-slate-400" />
                            {new Date(t.dueDate).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                      </div>

                      {/* Move to next stage button */}
                      <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <button
                          onClick={() => {
                            setSelectedTask(t);
                            setIsDetailOpen(true);
                          }}
                          className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1"
                        >
                          <MessageSquare className="w-3 h-3" />
                          <span>{t.comments?.length || 0}</span>
                        </button>

                        <div className="flex items-center gap-1">
                          {col.id !== 'Done' && (
                            <button
                              onClick={() => {
                                const nextMap = {
                                  'Todo': 'In Progress',
                                  'In Progress': 'In Review',
                                  'In Review': 'Done',
                                };
                                handleMoveStatus(t._id, nextMap[col.id]);
                              }}
                              className="px-2 py-0.5 text-[10px] font-bold rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 border border-emerald-200 dark:border-emerald-800/60 transition"
                            >
                              Advance &rarr;
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : viewMode === 'table' ? (
        /* TABLE VIEW */
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
                  <th className="px-5 py-3.5">Task Title</th>
                  <th className="px-5 py-3.5">Project</th>
                  <th className="px-5 py-3.5">Assigned To</th>
                  <th className="px-5 py-3.5">Priority</th>
                  <th className="px-5 py-3.5">Due Date</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {tasks.map((t) => (
                  <tr key={t._id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                    <td className="px-5 py-4 font-bold text-slate-900 dark:text-white max-w-xs truncate">
                      {t.title}
                    </td>
                    <td className="px-5 py-4 font-mono text-slate-600 dark:text-slate-400">{t.project?.code}</td>
                    <td className="px-5 py-4 text-slate-700 dark:text-slate-300">{t.assignedTo?.name || 'Staff'}</td>
                    <td className="px-5 py-4"><StatusBadge status={t.priority} size="xs" /></td>
                    <td className="px-5 py-4 text-slate-600 dark:text-slate-400">{new Date(t.dueDate).toLocaleDateString()}</td>
                    <td className="px-5 py-4"><StatusBadge status={t.status} size="xs" /></td>
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => {
                          setSelectedTask(t);
                          setIsDetailOpen(true);
                        }}
                        className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* DEADLINE CALENDAR LIST VIEW */
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-card space-y-4">
          <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">Chronological Deadlines</h3>
          <div className="space-y-3">
            {tasks.map((t) => (
              <div key={t._id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-bold flex flex-col items-center justify-center border border-emerald-100 dark:border-emerald-800/60">
                    <span className="text-[10px] uppercase">{new Date(t.dueDate).toLocaleString('default', { month: 'short' })}</span>
                    <span className="text-xs">{new Date(t.dueDate).getDate()}</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-slate-900 dark:text-white">{t.title}</h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Project: {t.project?.name} &bull; Assignee: {t.assignedTo?.name}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={t.priority} size="xs" />
                  <StatusBadge status={t.status} size="xs" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Task Inspection & Comment Thread Modal */}
      {selectedTask && (
        <Modal
          isOpen={isDetailOpen}
          onClose={() => setIsDetailOpen(false)}
          title={`Task Inspection: ${selectedTask.title}`}
          maxWidth="max-w-2xl"
        >
          <div className="space-y-4 text-xs">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <StatusBadge status={selectedTask.priority} />
                <StatusBadge status={selectedTask.status} />
              </div>
              <span className="font-semibold text-slate-500 dark:text-slate-400">
                Due: {new Date(selectedTask.dueDate).toLocaleDateString()}
              </span>
            </div>

            <p className="text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
              {selectedTask.description || 'No detailed instructions provided.'}
            </p>

            <div className="grid grid-cols-2 gap-4 text-slate-600 dark:text-slate-400">
              <div>
                <span className="text-slate-400 dark:text-slate-500 block font-medium">Assigned Engineer</span>
                <strong className="text-slate-800 dark:text-slate-200">{selectedTask.assignedTo?.name || 'Staff Member'}</strong>
              </div>
              <div>
                <span className="text-slate-400 dark:text-slate-500 block font-medium">Associated Project</span>
                <strong className="text-slate-800 dark:text-slate-200">{selectedTask.project?.name} ({selectedTask.project?.code})</strong>
              </div>
            </div>

            {/* Quick status change buttons */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
              <span className="text-slate-400 dark:text-slate-500 block font-medium mb-1.5">Change Task Stage:</span>
              <div className="flex flex-wrap gap-2">
                {['Todo', 'In Progress', 'In Review', 'Done'].map((st) => (
                  <button
                    key={st}
                    onClick={() => handleMoveStatus(selectedTask._id, st)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                      selectedTask.status === st
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Comments Thread */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
              <h4 className="font-bold text-slate-800 dark:text-slate-200 text-xs">Discussion & Verification Logs</h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {selectedTask.comments && selectedTask.comments.length > 0 ? (
                  selectedTask.comments.map((c, i) => (
                    <div key={i} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                      <div className="flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500 mb-1">
                        <strong className="text-slate-700 dark:text-slate-300">{c.userName || 'Member'}</strong>
                        <span>{new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <p className="text-slate-700 dark:text-slate-300">{c.comment}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-400 dark:text-slate-500 text-center py-2">No comments yet</p>
                )}
              </div>

              <form onSubmit={handleAddComment} className="flex gap-2 pt-2">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Post field update or verification note..."
                  className="flex-1 px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-900 focus:border-emerald-500 dark:focus:border-emerald-400 outline-none text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 transition"
                />
                <button
                  type="submit"
                  className="px-3 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          </div>
        </Modal>
      )}

      {/* Create Task Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create New Compliance Task"
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Task Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Calibrate PM2.5 Continuous Ambient Sensor #2"
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-900 focus:border-emerald-500 dark:focus:border-emerald-400 outline-none text-slate-800 dark:text-slate-200 transition"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Project *
              </label>
              <select
                required
                value={formData.project}
                onChange={(e) => setFormData({ ...formData, project: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-900 focus:border-emerald-500 dark:focus:border-emerald-400 outline-none text-slate-800 dark:text-slate-200 transition"
              >
                <option value="">Select Project</option>
                {projects.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.name} ({p.code})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Assignee *
              </label>
              <select
                required
                value={formData.assignedTo}
                onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-900 focus:border-emerald-500 dark:focus:border-emerald-400 outline-none text-slate-800 dark:text-slate-200 transition"
              >
                <option value="">Select Member</option>
                {usersList.map((u) => (
                  <option key={u._id} value={u._id}>
                    {u.name} ({u.role})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Due Date *
              </label>
              <input
                type="date"
                required
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-900 focus:border-emerald-500 dark:focus:border-emerald-400 outline-none text-slate-800 dark:text-slate-200 transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-900 focus:border-emerald-500 dark:focus:border-emerald-400 outline-none text-slate-800 dark:text-slate-200 transition"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Initial Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-900 focus:border-emerald-500 dark:focus:border-emerald-400 outline-none text-slate-800 dark:text-slate-200 transition"
              >
                <option value="Todo">Todo</option>
                <option value="In Progress">In Progress</option>
                <option value="In Review">In Review</option>
                <option value="Done">Done</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Instructions & Standard Operating Procedure
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Outline steps, compliance requirements, or attachments needed..."
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-900 focus:border-emerald-500 dark:focus:border-emerald-400 outline-none text-slate-800 dark:text-slate-200 transition"
            ></textarea>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition shadow-sm disabled:opacity-50"
            >
              {submitting ? 'Creating...' : 'Assign Task'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
