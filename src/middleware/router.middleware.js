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
    if (role.toLowerCase() === 'admin') {
      // For admin, strip the /admin prefix from the path
      const adminPath = req.originalUrl.replace(/^\/admin/, '');
      targetUrl = `${config.backendServices.admin}${adminPath}`;
    } else if (role.toLowerCase() === 'employee' || role.toLowerCase() === 'manager') {
      // For user roles, strip the /user prefix from the path
      const userPath = req.originalUrl.replace(/^\/user/, '');
      targetUrl = `${config.backendServices.user}${userPath}`;
    } else {
      const error = new Error(`Unsupported role: ${role}`);
      error.statusCode = 403;
      error.isRoutingError = true;
      error.details = `No backend service defined for role: ${role}`;
      return next(error);
    }
    
    // Log routing for debugging
    logRequest(req, targetUrl);
    
    // Selectively forward only necessary headers to avoid contamination
    const forwardedHeaders = {
      'Content-Type': req.headers['content-type'] || 'application/json',
      'Authorization': req.headers.authorization,
      'x-forwarded-by': 'router-service',
      'x-forwarded-for': req.ip,
      'x-organization-id': req.user.organizationId,
      'x-user-id': req.user.id
    };

    // Remove any undefined headers
    Object.keys(forwardedHeaders).forEach(key => forwardedHeaders[key] === undefined && delete forwardedHeaders[key]);
    
    // Forward request to target backend with the clean headers and original body
    const response = await axios({
      method: req.method,
      url: targetUrl,
      data: req.body,
      headers: forwardedHeaders,
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