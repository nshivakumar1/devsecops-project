#!/bin/bash

echo "🔒 Validating security configuration..."

# Build image
docker build -t test-webapp ./webapp

# Test 1: Verify non-root user
echo "🧪 Testing non-root user..."
USER_TEST=$(docker run --rm test-webapp whoami)
if [ "$USER_TEST" = "nodejs" ]; then
    echo "✅ Non-root user verified"
else
    echo "❌ Running as root user!"
    exit 1
fi

# Test 2: Check for vulnerabilities
echo "🧪 Testing for vulnerabilities..."
if trivy image --severity HIGH,CRITICAL --exit-code 1 test-webapp; then
    echo "✅ No high/critical vulnerabilities found"
else
    echo "❌ Vulnerabilities detected!"
    exit 1
fi

# Test 3: Verify app functionality
echo "🧪 Testing application functionality..."
docker run -d --name test-app -p 3002:3000 test-webapp
sleep 5

if curl -s http://localhost:3002/health | grep -q "healthy"; then
    echo "✅ Application health check passed"
    docker stop test-app && docker rm test-app
else
    echo "❌ Application health check failed!"
    docker stop test-app && docker rm test-app
    exit 1
fi

echo "✅ All security validations passed!"