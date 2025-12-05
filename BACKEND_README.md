# Backend Server (Standalone - Not Connected to Frontend)

This is a standalone Express.js backend server that runs independently from the Next.js frontend.

## 🚀 Running the Backend

### Start the backend server:
```bash
npm run backend
```

Or with auto-reload (development):
```bash
npm run backend:dev
```

The backend will start on **port 3001** (or the port specified in `BACKEND_PORT` environment variable).

## 📡 Available Endpoints

All endpoints are prefixed with `/api`:

- **GET** `/api/health` - Health check endpoint
- **POST** `/api/auth/login` - Login endpoint (not connected)
- **POST** `/api/auth/register` - Register endpoint (not connected)
- **GET** `/api/reports` - Get all reports (not connected)
- **POST** `/api/reports` - Create report (not connected)
- **GET** `/api/stats` - Get statistics (not connected)

## ⚠️ Important Notes

- **The frontend is NOT connected to this backend**
- The frontend uses localStorage for all operations
- This backend is for demonstration purposes only
- To test the backend, use tools like Postman, curl, or visit:
  - http://localhost:3001/api/health
  - http://localhost:3001/api/stats

## 🔧 Testing the Backend

### Using curl:
```bash
# Health check
curl http://localhost:3001/api/health

# Get stats
curl http://localhost:3001/api/stats

# Login (example)
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```

### Using browser:
Simply visit: http://localhost:3001/api/health

## 🎯 Purpose

This backend demonstrates that:
1. A backend server exists and is running
2. The backend has API endpoints
3. The frontend is intentionally disconnected
4. Both systems work independently






