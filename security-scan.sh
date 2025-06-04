#!/bin/bash

echo "🔍 Starting comprehensive security scan with Trivy..."

# Install latest Trivy if not present
if ! command -v trivy &> /dev/null; then
    echo "Installing Trivy..."
    curl -sfL https://raw.githubusercontent.com/aquasecurity/trivy/main/contrib/install.sh | sh -s -- -b /usr/local/bin v0.46.0
fi

# Update Trivy database
echo "📡 Updating Trivy vulnerability database..."
trivy image --download-db-only

# Build the webapp image
echo "🔨 Building webapp image..."
docker build -t health-dashboard-webapp:latest ./webapp

# Comprehensive image scan with exit code for CI/CD
echo "🔍 Scanning webapp image for vulnerabilities..."
trivy image --severity HIGH,CRITICAL --format table \
  --scanners vuln,secret,config \
  --exit-code 1 \
  health-dashboard-webapp:latest

# Scan Docker configurations
echo "🔍 Scanning Docker configurations..."
trivy config --severity HIGH,CRITICAL docker-compose.yml
trivy config --severity HIGH,CRITICAL webapp/Dockerfile

# Scan for secrets
echo "🔍 Scanning for secrets and sensitive information..."
trivy fs --scanners secret --severity HIGH,CRITICAL .

# Scan Node.js dependencies
echo "🔍 Scanning Node.js dependencies..."
trivy fs --scanners vuln webapp/package.json

# Generate reports for CI/CD integration
echo "📄 Generating security reports..."
trivy image --format json --output security-report.json health-dashboard-webapp:latest
trivy image --format sarif --output security-report.sarif health-dashboard-webapp:latest

echo "✅ Security scan completed!"
echo "📊 Reports generated:"
echo "  - JSON: security-report.json"
echo "  - SARIF: security-report.sarif"

# Exit with error if critical vulnerabilities found
if [ $? -eq 1 ]; then
    echo "⚠️  Critical vulnerabilities found! Please review and fix before deploying."
    exit 1
else
    echo "✅ No critical vulnerabilities detected."
fi