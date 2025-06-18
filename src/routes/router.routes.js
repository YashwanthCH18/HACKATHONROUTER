const express = require('express');
const { authenticateJWT } = require('../middleware/auth.middleware');
const { routeRequest } = require('../middleware/router.middleware');

const router = express.Router();

// All requests to /* should be authenticated and routed to appropriate backend
router.all('/*', authenticateJWT, routeRequest);

module.exports = router; 