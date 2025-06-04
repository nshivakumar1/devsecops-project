const express = require('express');
const client = require('prom-client');
const path = require('path');

const app = express();
const PORT = 3000;

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Create a Registry to register the metrics
const register = new client.Registry();

// Add a default label which is added to all metrics
register.setDefaultLabels({
  app: 'health-dashboard'
});

// Enable the collection of default metrics
client.collectDefaultMetrics({ register });

// Create custom metrics
const httpRequestsTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status']
});

const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status'],
  buckets: [0.1, 0.5, 1, 2, 5]
});

const appUptime = new client.Gauge({
  name: 'app_uptime_seconds',
  help: 'Application uptime in seconds'
});

const activeUsers = new client.Gauge({
  name: 'active_users_total',
  help: 'Number of active users'
});

const systemLoad = new client.Gauge({
  name: 'system_load_average',
  help: 'System load average'
});

// Register metrics
register.registerMetric(httpRequestsTotal);
register.registerMetric(httpRequestDuration);
register.registerMetric(appUptime);
register.registerMetric(activeUsers);
register.registerMetric(systemLoad);

// Start time for uptime calculation
const startTime = Date.now();

// Simulate some dynamic data
let userCount = 0;
setInterval(() => {
  userCount = Math.floor(Math.random() * 100) + 50;
  activeUsers.set(userCount);
  systemLoad.set(Math.random() * 4);
}, 5000);

// Middleware to track metrics
app.use((req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    const route = req.route ? req.route.path : req.path;
    
    httpRequestsTotal.labels(req.method, route, res.statusCode).inc();
    httpRequestDuration.labels(req.method, route, res.statusCode).observe(duration);
  });
  
  next();
});

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/api/health', (req, res) => {
  const uptime = process.uptime();
  const memoryUsage = process.memoryUsage();
  
  res.json({
    status: 'healthy',
    uptime: uptime,
    timestamp: new Date().toISOString(),
    memory: {
      rss: Math.round(memoryUsage.rss / 1024 / 1024) + ' MB',
      heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024) + ' MB',
      heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024) + ' MB'
    },
    environment: process.env.NODE_ENV || 'development',
    activeUsers: userCount,
    systemLoad: (Math.random() * 4).toFixed(2)
  });
});

app.get('/api/stats', (req, res) => {
  const uptime = process.uptime();
  const memoryUsage = process.memoryUsage();
  
  res.json({
    uptime: Math.floor(uptime),
    memoryUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024),
    memoryTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024),
    activeUsers: userCount,
    systemLoad: (Math.random() * 4).toFixed(2),
    requestsPerMinute: Math.floor(Math.random() * 1000) + 500,
    errorRate: (Math.random() * 5).toFixed(1),
    responseTime: (Math.random() * 200 + 50).toFixed(0)
  });
});

// Legacy health endpoint (for backward compatibility)
app.get('/health', (req, res) => {
  res.redirect('/api/health');
});

// Metrics endpoint for Prometheus
app.get('/metrics', async (req, res) => {
  // Update uptime metric
  appUptime.set((Date.now() - startTime) / 1000);
  
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

// Simulate some load for demo purposes
app.get('/simulate-load', (req, res) => {
  // Simulate some processing time
  const delay = Math.random() * 1000;
  setTimeout(() => {
    res.json({ message: 'Load simulated', delay: delay });
  }, delay);
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Health Dashboard running on port ${PORT}`);
  console.log(`Dashboard: http://localhost:${PORT}`);
  console.log(`API Health: http://localhost:${PORT}/api/health`);
  console.log(`Metrics: http://localhost:${PORT}/metrics`);
});