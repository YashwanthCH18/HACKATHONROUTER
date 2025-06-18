const axios = require('axios');
const config = require('../config/config');
const { logRequest } = require('../utils');

/**
 * Middleware to route requests to appropriate backend based on user role
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const routeRequest = async (req, res, next) => {
  try {
    const { role } = req.user;
    let targetUrl;
    
    // Determine target backend URL based on user role
    if (role === 'admin') {
      targetUrl = `${config.backendServices.admin}${req.originalUrl.replace('/api', '')}`;
    } else if (role === 'employee') {
      targetUrl = `${config.backendServices.user}${req.originalUrl.replace('/api', '')}`;
    } else {
      const error = new Error(`Unsupported role: ${role}`);
      error.statusCode = 403;
      error.isRoutingError = true;
      error.details = `No backend service defined for role: ${role}`;
      return next(error);
    }
    
    // Log routing for debugging
    logRequest(req, targetUrl);
    
    // Forward request to target backend with original headers and body
    const response = await axios({
      method: req.method,
      url: targetUrl,
      data: req.body,
      headers: {
        ...req.headers,
        // Add additional headers if needed
        'x-forwarded-by': 'router-service',
        'x-forwarded-for': req.ip,
        'x-organization-id': req.user.organizationId,
        'x-user-id': req.user.id
      },
      validateStatus: false // Don't throw error on non-2xx responses
    });
    
    // Forward response from backend to client
    return res.status(response.status).json(response.data);
  } catch (error) {
    // Handle axios errors
    if (error.response) {
      // The request was made and the server responded with a status code
      // outside of the 2xx range
      return res.status(error.response.status).json(error.response.data);
    } else if (error.request) {
      // The request was made but no response was received
      const routingError = new Error('Backend service is unavailable');
      routingError.statusCode = 503;
      routingError.isRoutingError = true;
      routingError.details = error.message;
      return next(routingError);
    } else {
      // Something happened in setting up the request
      const routingError = new Error('Router service error');
      routingError.statusCode = 500;
      routingError.isRoutingError = true;
      routingError.details = error.message;
      return next(routingError);
    }
  }
};

module.exports = {
  routeRequest
}; 