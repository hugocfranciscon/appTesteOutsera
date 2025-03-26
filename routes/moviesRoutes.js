const express = require('express');
const { getAwardIntervals } = require('../controllers/moviesController');

const router = express.Router();

router.get('/awards/intervals', getAwardIntervals);

module.exports = router;