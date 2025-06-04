# Use the latest LTS version with security updates
FROM node:20-alpine3.19

# Install security updates and required tools
RUN apk update && apk upgrade && \
    apk add --no-cache wget && \
    rm -rf /var/cache/apk/*

# Create a non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

WORKDIR /app

# Copy package.json first for better Docker layer caching
COPY package.json .

# Install dependencies
RUN npm install --production && \
    npm cache clean --force

# Copy application code and frontend files
COPY app.js .
COPY public/ public/

# Change ownership to non-root user
RUN chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

# Start the application
CMD ["npm", "start"]