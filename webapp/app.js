const express = require('express');
const client = require('prom-client');
const path = require('path');

const app = express();
const port = 3000;

// Create a Registry to register metrics
const register = new client.Registry();

// Add default metrics (memory, CPU, etc.)
client.collectDefaultMetrics({ 
  register,
  timeout: 10000,
  gcDurationBuckets: [0.001, 0.01, 0.1, 1, 2, 5], // These are the default buckets.
});

// Custom metrics
const httpRequestsTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register]
});

const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.001, 0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
  registers: [register]
});

const httpRequestsInProgress = new client.Gauge({
  name: 'http_requests_in_progress',
  help: 'Number of HTTP requests currently being processed',
  registers: [register]
});

const appUptime = new client.Gauge({
  name: 'app_uptime_seconds',
  help: 'Application uptime in seconds',
  registers: [register]
});

const customMetrics = new client.Gauge({
  name: 'app_custom_metric',
  help: 'Custom application metric for testing',
  labelNames: ['type'],
  registers: [register]
});

// Update uptime every 10 seconds
setInterval(() => {
  appUptime.set(process.uptime());
  
  // Update custom metrics with random values for testing
  customMetrics.set({ type: 'random' }, Math.floor(Math.random() * 100));
  customMetrics.set({ type: 'memory_usage_mb' }, process.memoryUsage().heapUsed / 1024 / 1024);
  customMetrics.set({ type: 'cpu_usage_percent' }, process.cpuUsage().user / 1000000);
}, 10000);

// Middleware for metrics collection
app.use((req, res, next) => {
  const start = Date.now();
  
  // Increment in-progress requests
  httpRequestsInProgress.inc();
  
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    const route = req.route ? req.route.path : req.path;
    
    // Record metrics
    httpRequestsTotal.labels(req.method, route, res.statusCode).inc();
    httpRequestDuration.labels(req.method, route, res.statusCode).observe(duration);
    
    // Decrement in-progress requests
    httpRequestsInProgress.dec();
  });
  
  next();
});

// Serve static files
app.use(express.static('public'));

// API Routes
app.get('/api/time', (req, res) => {
  res.json({ 
    timestamp: new Date().toISOString(),
    server_time: new Date().toLocaleString(),
    uptime: process.uptime(),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
  });
});

app.get('/api/stats', (req, res) => {
  const memUsage = process.memoryUsage();
  const cpuUsage = process.cpuUsage();
  
  res.json({
    memory_usage: {
      rss: memUsage.rss,
      heapTotal: memUsage.heapTotal,
      heapUsed: memUsage.heapUsed,
      external: memUsage.external,
      arrayBuffers: memUsage.arrayBuffers
    },
    cpu_usage: {
      user: cpuUsage.user,
      system: cpuUsage.system
    },
    version: process.version,
    platform: process.platform,
    arch: process.arch,
    node_env: process.env.NODE_ENV || 'development',
    pid: process.pid,
    uptime: process.uptime(),
    load_average: require('os').loadavg(),
    free_memory: require('os').freemem(),
    total_memory: require('os').totalmem()
  });
});

app.get('/api/random', (req, res) => {
  res.json({
    random_number: Math.floor(Math.random() * 1000),
    quote: "DevSecOps in action!",
    generated_at: new Date().toISOString(),
    request_id: Math.random().toString(36).substring(7)
  });
});

app.get('/api/test-load', (req, res) => {
  // Simulate some work
  const iterations = Math.floor(Math.random() * 1000000);
  let sum = 0;
  for (let i = 0; i < iterations; i++) {
    sum += Math.random();
  }
  
  res.json({
    message: 'Load test completed',
    iterations,
    result: sum,
    timestamp: new Date().toISOString()
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  const healthData = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    pid: process.pid,
    version: process.version,
    environment: process.env.NODE_ENV || 'development'
  };
  
  res.status(200).json(healthData);
});

// Readiness check
app.get('/ready', (req, res) => {
  res.status(200).json({
    status: 'ready',
    timestamp: new Date().toISOString()
  });
});

// Metrics endpoint
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  try {
    const metrics = await register.metrics();
    res.end(metrics);
  } catch (error) {
    res.status(500).end(error.message);
  }
});

// Main route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    path: req.path,
    timestamp: new Date().toISOString()
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

app.listen(port, '0.0.0.0', () => {
  console.log(`DevSecOps webapp running on port ${port}`);
  console.log(`Health check: http://localhost:${port}/health`);
  console.log(`Metrics: http://localhost:${port}/metrics`);
  console.log(`API endpoints:`);
  console.log(`  - /api/time`);
  console.log(`  - /api/stats`);
  console.log(`  - /api/random`);
  console.log(`  - /api/test-load`);
});