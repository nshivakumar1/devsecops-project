# DevSecOps Health Dashboard

A simple DevSecOps implementation featuring a health metrics dashboard with security scanning, monitoring, and observability.

![Architecture](https://img.shields.io/badge/Architecture-Microservices-blue)
![Security](https://img.shields.io/badge/Security-Trivy%20Scanning-green)
![Monitoring](https://img.shields.io/badge/Monitoring-Prometheus-orange)
![Dashboard](https://img.shields.io/badge/Dashboard-Grafana-red)

## 🏗️ Architecture

![alt text](https://github.com/nshivakumar1/devsecops-project/blob/main/Project-Architecture.png)

## Screenshots
! [alt text] (https://github.com/nshivakumar1/devsecops-project/blob/main/Screenshots/Dashboard%20Screenshot.png)
! [alt text] (https://github.com/nshivakumar1/devsecops-project/blob/main/Screenshots/Github%20Actions-successful%20deployment.png)
! [alt text] (https://github.com/nshivakumar1/devsecops-project/blob/main/Screenshots/Grafana%20Dashboard.png)
! [alt text] (https://github.com/nshivakumar1/devsecops-project/blob/main/Screenshots/Github%20Actions%20Failure%20Deployments.png)

## 🚀 Quick Start

```bash
# Clone the repository
git clone <repository-url>
cd devsecops-health-dashboard

# Run the setup script
chmod +x setup.sh
./setup.sh
```

## 🌐 Access Points

| Service | URL | Credentials |
|---------|-----|-------------|
| Web App | http://localhost:3000 | - |
| Prometheus | http://localhost:9090 | - |
| Grafana | http://localhost:3001 | admin/admin123 |

## 📊 Key Features

### 🔧 Web Application
- **Health Endpoints**: `/health`, `/metrics`
- **Load Simulation**: `/simulate-load`
- **Prometheus Integration**: Custom metrics collection
- **Docker Health Checks**: Automated container health monitoring

### 🔍 Security Scanning
- **Trivy Integration**: Vulnerability scanning for containers
- **Configuration Scanning**: Docker Compose security analysis
- **Secret Detection**: Repository-wide secret scanning
- **Automated Reports**: Security scan results and recommendations

### 📈 Monitoring & Observability
- **Prometheus Metrics**: 
  - HTTP request rates and duration
  - Application uptime
  - Memory usage
  - Custom business metrics
- **Grafana Dashboards**: 
  - Real-time health visualization
  - Performance metrics
  - System resource monitoring

## 🛠️ Tech Stack

- **Containerization**: Docker & Docker Compose
- **Security**: Trivy vulnerability scanner
- **Monitoring**: Prometheus metrics collection
- **Visualization**: Grafana dashboards
- **Application**: Node.js with Express
- **Metrics**: Prometheus client library

## 📁 Project Structure

```
devsecops-health-dashboard/
├── webapp/                 # Node.js health dashboard app
│   ├── Dockerfile         # Container configuration
│   ├── package.json       # Dependencies
│   └── app.js            # Main application
├── prometheus/            # Metrics collection config
│   └── prometheus.yml    # Prometheus configuration
├── grafana/              # Dashboard configuration
│   ├── dashboards/       # Dashboard definitions
│   └── provisioning/     # Auto-provisioning config
│       ├── dashboards/   # Dashboard provisioning
│       └── datasources/  # Datasource provisioning
│           └── datasources.yml  # Prometheus datasource config
├── docker-compose.yml    # Service orchestration
├── security-scan.sh      # Security scanning script
├── setup.sh             # Quick setup script
├── .gitignore           # Git ignore patterns
└── README.md            # This file
```

## 🔨 Manual Setup

### Prerequisites
- Docker & Docker Compose
- curl (for testing)
- jq (optional, for JSON formatting)

### Step by Step

1. **Start Services**
   ```bash
   docker-compose up --build -d
   ```

2. **Run Security Scan**
   ```bash
   chmod +x security-scan.sh
   ./security-scan.sh
   ```

3. **Test the Application**
   ```bash
   curl http://localhost:3000/health
   curl http://localhost:3000/metrics
   ```

4. **Generate Test Traffic**
   ```bash
   for i in {1..10}; do 
     curl http://localhost:3000/simulate-load
   done
   ```

## 📊 Available Metrics

### Application Metrics
- `http_requests_total` - Total HTTP requests by method, route, status
- `http_request_duration_seconds` - Request duration histogram
- `app_uptime_seconds` - Application uptime in seconds

### System Metrics
- `process_resident_memory_bytes` - Memory usage
- `process_cpu_seconds_total` - CPU usage
- `nodejs_heap_size_total_bytes` - Node.js heap size

## 🔐 Security Features

### Vulnerability Scanning
- **Container Images**: Scans for known CVEs
- **Dependencies**: Checks for vulnerable packages
- **Configuration**: Reviews Docker and Compose security
- **Secrets**: Detects exposed credentials

### Security Best Practices
- Non-root container execution
- Minimal base images (Alpine Linux)
- Health check implementation
- Environment-based configuration
- Network isolation between services

## 🧪 Testing

### Health Check Endpoints
```bash
# Application health
curl http://localhost:3000/health

# Prometheus metrics
curl http://localhost:3000/metrics

# Load simulation
curl http://localhost:3000/simulate-load
```

### Service Status
```bash
# Check all services
docker-compose ps

# View logs
docker-compose logs webapp
docker-compose logs prometheus
docker-compose logs grafana
```

## 🔧 Configuration

### Environment Variables
- `NODE_ENV` - Application environment (development/production)
- `GF_SECURITY_ADMIN_USER` - Grafana admin username
- `GF_SECURITY_ADMIN_PASSWORD` - Grafana admin password

### Customization
- **Metrics**: Modify `webapp/app.js` to add custom metrics
- **Dashboards**: Edit `grafana/dashboards/health-dashboard.json`
- **Alerts**: Configure in `prometheus/prometheus.yml`

## 🚨 Troubleshooting

### Common Issues

**Services not starting**
```bash
docker-compose logs
docker-compose ps
```

**Port conflicts**
```bash
# Edit docker-compose.yml to change ports
# For example, change 3000:3000 to 3002:3000
```

**Grafana dashboard not loading**
```bash
# Wait 2-3 minutes for provisioning
# Check grafana logs
docker-compose logs grafana
```

**Trivy not found**
```bash
# Install Trivy manually
curl -sfL https://raw.githubusercontent.com/aquasecurity/trivy/main/contrib/install.sh | sh -s -- -b /usr/local/bin
```

### Useful Commands
```bash
# Restart all services
docker-compose restart

# Rebuild without cache
docker-compose build --no-cache

# Clean up everything
docker-compose down -v
docker system prune -f

# Update images
docker-compose pull
```

## 📈 Monitoring Guide

### Prometheus Queries
```promql
# Request rate
rate(http_requests_total[5m])

# Error rate
rate(http_requests_total{status=~"5.."}[5m]) / rate(http_requests_total[5m])

# Memory usage
process_resident_memory_bytes / 1024 / 1024

# Uptime
app_uptime_seconds / 3600
```

### Grafana Dashboard Features
- Real-time request metrics
- Memory and CPU usage graphs
- Application uptime tracking
- Error rate monitoring
- Response time distribution

## 🔄 CI/CD Integration

This project is designed to integrate with CI/CD pipelines:

```yaml
# Example GitHub Actions step
- name: Security Scan
  run: |
    docker build -t app:latest ./webapp
    trivy image --exit-code 1 --severity HIGH,CRITICAL app:latest
```

## 📚 Next Steps

### Enhancements
- [ ] Add alerting rules in Prometheus
- [ ] Implement log aggregation with ELK stack
- [ ] Add database metrics
- [ ] Implement distributed tracing
- [ ] Add performance testing
- [ ] Implement blue-green deployment

### Security Improvements
- [ ] Add HashiCorp Vault for secrets
- [ ] Implement HTTPS/TLS
- [ ] Add OAuth2 authentication
- [ ] Container signing with Cosign
- [ ] Network policies
- [ ] RBAC implementation

## 📄 License

MIT License - see LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run security scans
5. Submit a pull request

## 📞 Support

For issues and questions:
- Check the troubleshooting section
- Review Docker Compose logs
- Open an issue in the repository

---

**Built with ❤️ for DevSecOps practices**