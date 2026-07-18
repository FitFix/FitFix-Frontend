const express = require('express');
const router = express.Router();
const Lead = require('../models/Lead');

router.post('/', async (req, res) => {
  try {
    const { gymName, locations, email } = req.body;
    if (!gymName || !email || !/.+@.+\..+/.test(email)) {
      return res.status(400).json({ error: 'Gym name and a valid work email are required.' });
    }
    const lead = await Lead.create({
      gymName,
      locations: Number(locations) || 1,
      email
    });
    res.status(201).json({ success: true, id: lead._id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
