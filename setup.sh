#!/bin/bash

echo "🚀 Setting up DevSecOps Health Dashboard..."

# Make scripts executable
chmod +x security-scan.sh

# Create necessary directories
mkdir -p grafana/provisioning/datasources
mkdir -p grafana/provisioning/dashboards
mkdir -p grafana/dashboards

# Run security scan
echo "🔍 Running initial security scan..."
./security-scan.sh

# Build and start services
echo "🔨 Building and starting services..."
docker-compose up --build -d

# Wait for services to start
echo "⏳ Waiting for services to start..."
sleep 30

# Check service health
echo "🏥 Checking service health..."
echo "Webapp health:"
curl -s http://localhost:3000/health | jq '.' || echo "Webapp not ready yet"

echo "Prometheus targets:"
curl -s http://localhost:9090/api/v1/targets | jq '.data.activeTargets[].health' || echo "Prometheus not ready yet"

echo ""
echo "✅ Setup completed!"
echo ""
echo "🌐 Access URLs:"
echo "  - Web App: http://localhost:3000"
echo "  - Prometheus: http://localhost:9090"
echo "  - Grafana: http://localhost:3001 (admin/admin123)"
echo ""
echo "📊 Useful endpoints:"
echo "  - Health check: http://localhost:3000/health"
echo "  - Metrics: http://localhost:3000/metrics"
echo "  - Simulate load: http://localhost:3000/simulate-load"