const Task = require('../models/Task');
const Notification = require('../models/Notification');
const { logAudit } = require('../middleware/audit');

// @desc    Get all tasks with optional project, assignee, and status filter
// @route   GET /api/tasks
// @access  Private
exports.getTasks = async (req, res, next) => {
  try {
    const { project, assignedTo, status, priority, search } = req.query;
    let query = {};

    if (project) query.project = project;
    if (assignedTo) query.assignedTo = assignedTo;
    if (status && status !== 'all') query.status = status;
    if (priority && priority !== 'all') query.priority = priority;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const tasks = await Task.find(query)
      .populate('project', 'name code location projectType')
      .populate('assignedTo', 'name email role department')
      .populate('createdBy', 'name email')
      .populate('complianceRequirement', 'title regulatoryCategory dueDate')
      .sort('dueDate');

    res.status(200).json({ success: true, count: tasks.length, data: tasks });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single task
// @route   GET /api/tasks/:id
// @access  Private
exports.getTaskById = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('project', 'name code location')
      .populate('assignedTo', 'name email role department phone')
      .populate('createdBy', 'name email')
      .populate('complianceRequirement', 'title regulatoryCategory dueDate status priority');

    if (!task) {
      return res.status(404).json({ success: false, error: 'Task not found' });
    }

    res.status(200).json({ success: true, data: task });
  } catch (err) {
    next(err);
  }
};

// @desc    Create task
// @route   POST /api/tasks
// @access  Private
exports.createTask = async (req, res, next) => {
  try {
    req.body.createdBy = req.user.id;
    if (!req.body.complianceRequirement || req.body.complianceRequirement === '') {
      delete req.body.complianceRequirement;
    }
    if (!req.body.assignedTo || req.body.assignedTo === '') {
      req.body.assignedTo = req.user.id;
    }
    if (!req.body.dueDate) {
      const d = new Date();
      d.setDate(d.getDate() + 7);
      req.body.dueDate = d;
    }
    const task = await Task.create(req.body);

    // Notify assigned user if different from creator
    if (task.assignedTo && task.assignedTo.toString() !== req.user.id.toString()) {
      await Notification.create({
        recipient: task.assignedTo,
        title: 'New Compliance Task Assigned',
        message: `You were assigned task: "${task.title}" with priority ${task.priority}`,
        type: task.priority === 'Critical' ? 'Critical' : 'Information',
        link: '/tasks',
      });
    }

    await logAudit({
      req,
      action: 'CREATE',
      module: 'Tasks',
      recordId: task._id,
      recordTitle: task.title,
      details: `Created task with priority ${task.priority}`,
      newValue: task,
    });

    res.status(201).json({ success: true, data: task });
  } catch (err) {
    next(err);
  }
};

// @desc    Update task (including drag-and-drop Kanban status)
// @route   PUT /api/tasks/:id
// @access  Private
exports.updateTask = async (req, res, next) => {
  try {
    const existing = await Task.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Task not found' });
    }

    if (req.body.complianceRequirement === '') {
      req.body.complianceRequirement = null;
    }
    if (req.body.assignedTo === '') {
      delete req.body.assignedTo;
    }

    const task = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate('project', 'name code')
      .populate('assignedTo', 'name email');

    // Notify if status changed to Done or In Review
    if (req.body.status && req.body.status !== existing.status) {
      await logAudit({
        req,
        action: 'STATUS_CHANGE',
        module: 'Tasks',
        recordId: task._id,
        recordTitle: task.title,
        details: `Task status changed from ${existing.status} to ${task.status}`,
        previousValue: existing.status,
        newValue: task.status,
      });

      if (task.createdBy && task.createdBy.toString() !== req.user.id.toString()) {
        await Notification.create({
          recipient: task.createdBy,
          title: `Task Status Update: ${task.title}`,
          message: `${req.user.name} moved task status to "${task.status}"`,
          type: task.status === 'Done' ? 'Success' : 'Information',
          link: '/tasks',
        });
      }
    }

    res.status(200).json({ success: true, data: task });
  } catch (err) {
    next(err);
  }
};

// @desc    Add comment to task
// @route   POST /api/tasks/:id/comments
// @access  Private
exports.addTaskComment = async (req, res, next) => {
  try {
    const rawComment = req.body.comment;
    const comment = typeof rawComment === 'object' && rawComment !== null ? rawComment.comment : rawComment;
    if (!comment || typeof comment !== 'string' || !comment.trim()) {
      return res.status(400).json({ success: false, error: 'Comment text is required' });
    }

    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, error: 'Task not found' });
    }

    task.comments.push({
      user: req.user.id,
      userName: req.user.name,
      comment,
      createdAt: new Date(),
    });

    await task.save();

    res.status(200).json({ success: true, data: task });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private
exports.deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, error: 'Task not found' });
    }

    await task.deleteOne();

    await logAudit({
      req,
      action: 'DELETE',
      module: 'Tasks',
      recordId: task._id,
      recordTitle: task.title,
      details: `Deleted task`,
    });

    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    next(err);
  }
};
