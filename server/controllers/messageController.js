const Message = require('../models/Message');
const { logAudit } = require('../middleware/audit');

// @desc    Get team discussion messages
// @route   GET /api/messages
// @access  Private (All authenticated roles)
exports.getMessages = async (req, res, next) => {
  try {
    const { channel, project, category, search } = req.query;
    let query = {};

    if (channel && channel !== 'all') {
      query.channel = channel;
    }
    if (project && project !== 'all') {
      query.project = project;
    }
    if (category && category !== 'all') {
      query.category = category;
    }
    if (search) {
      query.content = { $regex: search, $options: 'i' };
    }

    const messages = await Message.find(query)
      .populate('sender', 'name email role department avatar')
      .populate('project', 'name code')
      .populate('resolvedBy', 'name role')
      .sort('createdAt');

    res.status(200).json({
      success: true,
      count: messages.length,
      data: messages,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Send a new message / clarification doubt
// @route   POST /api/messages
// @access  Private (All authenticated roles)
exports.sendMessage = async (req, res, next) => {
  try {
    const { content, channel, category, project } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Message text cannot be empty.',
      });
    }

    const message = await Message.create({
      sender: req.user._id,
      content: content.trim(),
      channel: channel || 'general-regulatory',
      category: category || 'Doubt & Question',
      project: project || null,
    });

    const populated = await Message.findById(message._id)
      .populate('sender', 'name email role department avatar')
      .populate('project', 'name code');

    res.status(201).json({
      success: true,
      data: populated,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Mark a doubt as resolved/unresolved
// @route   PATCH /api/messages/:id/resolve
// @access  Private
exports.toggleResolve = async (req, res, next) => {
  try {
    const message = await Message.findById(req.params.id);
    if (!message) {
      return res.status(404).json({ success: false, error: 'Message not found' });
    }

    message.isResolved = !message.isResolved;
    message.resolvedBy = message.isResolved ? req.user._id : null;
    await message.save();

    const populated = await Message.findById(message._id)
      .populate('sender', 'name email role department avatar')
      .populate('project', 'name code')
      .populate('resolvedBy', 'name role');

    res.status(200).json({
      success: true,
      data: populated,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete a message (Author or Admin only)
// @route   DELETE /api/messages/:id
// @access  Private
exports.deleteMessage = async (req, res, next) => {
  try {
    const message = await Message.findById(req.params.id);
    if (!message) {
      return res.status(404).json({ success: false, error: 'Message not found' });
    }

    const isAuthor = message.sender.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'ADMIN';

    if (!isAuthor && !isAdmin) {
      return res.status(403).json({
        success: false,
        error: 'Access Denied: You can only delete your own messages.',
      });
    }

    await message.deleteOne();
    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    next(err);
  }
};
