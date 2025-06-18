# HR Assistant Router Service

A Node.js Express backend service that acts as a router between frontend and backend services (admin/user) for the Smart HR Assistant application.

## Features

- JWT-based authentication
- Role-based request routing
- Request forwarding to appropriate backend services
- Comprehensive error handling
- Logging for debugging

## Prerequisites

- Node.js (v14+)
- npm or yarn

## Setup Instructions

1. Clone the repository
2. Set up environment variables:
   ```
   cp .env.example .env
   ```
3. Update the `.env` file with your configuration values
4. Install dependencies:
   ```
   npm install
   ```

## Running the Application

### Development Mode
```
npm run dev
```

### Production Mode
```
npm start
```

## API Endpoints

### Authentication

- **POST /api/auth/signup** - Register a new user
  - Body: `{ "email": "...", "password": "...", "firstName": "...", "lastName": "...", "role": "...", "organizationId": "..." }`

- **POST /api/auth/login** - Log in a user
  - Body: `{ "email": "...", "password": "..." }`

- **GET /api/auth/logout** - Log out a user

- **GET /api/auth/me** - Get current user information (requires authentication)

- **GET /api/auth/verify-token** - Verify JWT token (requires authentication)

### Router

- **ALL /api/\*** - All requests with authentication will be forwarded to appropriate backend based on user role

## Testing with Postman

1. **Authentication:**
   - Send a POST request to `http://localhost:5000/api/auth/login` with the following body:
     ```json
     {
       "email": "admin@example.com",
       "password": "password123"
     }
     ```
   - This will return a JWT token in the response

2. **Using the Token:**
   - For all subsequent requests, add the token to the Authorization header:
   - `Authorization: Bearer your_token_here`

3. **Test Backend Routing:**
   - Send any request to `/api/...` endpoints
   - The router will forward the request to either the admin or user backend based on the role in the JWT token

## Mock Users for Testing

- **Admin User:**
  - Email: admin@example.com
  - Password: password123

- **Employee User:**
  - Email: employee@example.com
  - Password: password123

## Deployment to AWS Lambda

This service can be deployed to AWS Lambda using the Serverless Framework. See the serverless.yml file for configuration.

```bash
# Install Serverless Framework globally
npm install -g serverless

# Deploy to AWS
serverless deploy
``` 