const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.BACKEND_PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Demo data
let users = [
  { id: '1', username: 'backend_user', email: 'backend@example.com', role: 'admin' }
];

let reports = [
  { id: '1', title: 'Backend Report', description: 'This is from the backend', status: 'processing' }
];

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Backend is running!',
    timestamp: new Date().toISOString(),
    port: PORT
  });
});

// Auth endpoints
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  res.json({
    message: 'Backend login endpoint (not connected to frontend)',
    received: { email, password }
  });
});

app.post('/api/auth/register', (req, res) => {
  const { username, email, password } = req.body;
  res.json({
    message: 'Backend register endpoint (not connected to frontend)',
    received: { username, email }
  });
});

// Reports endpoints
app.get('/api/reports', (req, res) => {
  res.json({
    message: 'Backend reports endpoint (not connected to frontend)',
    reports: reports,
    count: reports.length
  });
});

app.post('/api/reports', (req, res) => {
  res.json({
    message: 'Backend create report endpoint (not connected to frontend)',
    received: req.body
  });
});

// Stats endpoint
app.get('/api/stats', (req, res) => {
  res.json({
    message: 'Backend stats endpoint (not connected to frontend)',
    stats: {
      totalReports: reports.length,
      totalUsers: users.length,
      backendRunning: true
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🚀 Backend Server Running!`);
  console.log(`📡 Port: ${PORT}`);
  console.log(`🌐 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`📊 Stats: http://localhost:${PORT}/api/stats`);
  
});






