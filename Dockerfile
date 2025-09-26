# Use Node.js 20 Alpine as base image for smaller size and better security
FROM node:22-alpine

# Set working directory
WORKDIR /app

# Install system dependencies for native packages
RUN apk add --no-cache python3 make g++ && ln -sf python3 /usr/bin/python

# Copy package files
COPY package.json package-lock.json* ./

# Install ALL dependencies (including devDependencies for building)
RUN npm ci && npm cache clean --force

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Remove development dependencies to reduce image size
RUN npm prune --production

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Change ownership of the app directory to nodejs user
RUN chown -R nodejs:nodejs /app
USER nodejs

# Expose port (5000 for production)
EXPOSE 5000

# Health check - check if the server is responding
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })" || exit 1

# Start the application
CMD ["npm", "start"]