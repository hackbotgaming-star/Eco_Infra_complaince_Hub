const express = require('express');
const router = express.Router();
const { register, login, getMe, demoSwitch } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const seedData = require('../utils/seed');

router.post('/register', register);
router.post('/login', login);
router.post('/demo-switch', demoSwitch);
router.get('/me', protect, getMe);
router.post('/purge-dummy-data', protect, async (req, res, next) => {
  try {
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, error: 'Only Administrators can purge database records.' });
    }
    await seedData();
    res.json({ success: true, message: 'All dummy projects and reference records successfully purged.' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
