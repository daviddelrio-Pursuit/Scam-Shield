# Docker Deployment Guide for Scam-Shield

This guide explains how to deploy the Scam-Shield application using Docker, specifically for EasyPanel.

## Overview

Scam-Shield is a full-stack application built with:
- **Frontend**: React + Vite + TypeScript
- **Backend**: Node.js + Express.js + TypeScript  
- **Database**: PostgreSQL with Drizzle ORM
- **Port**: 5000 (serves both API and static files)

## Environment Variables

The following environment variables are required:

### Required
- `DATABASE_URL` - PostgreSQL connection string (e.g., `postgresql://user:password@host:port/database`)
- `NODE_ENV` - Set to `production` for deployment

### Optional
- `PORT` - Server port (defaults to 5000)

## EasyPanel Deployment

### 1. Docker Configuration
The included `Dockerfile` is optimized for EasyPanel with:
- Node.js 20 Alpine base image for security and smaller size
- Multi-stage approach for optimized builds
- Non-root user for security
- Health checks for monitoring
- Proper caching of dependencies

### 2. Build Command
```bash
docker build -t scam-shield .
```

### 3. Run Command
```bash
docker run -p 5000:5000 \
  -e DATABASE_URL="your_postgres_connection_string" \
  -e NODE_ENV="production" \
  scam-shield
```

### 4. EasyPanel Setup

1. **Create a new service** in EasyPanel
2. **Select "Docker Image"** as the source
3. **Build settings**:
   - Repository: Your Git repository URL
   - Dockerfile path: `./Dockerfile`
4. **Environment Variables**:
   - Add `DATABASE_URL` with your PostgreSQL connection string
   - Add `NODE_ENV=production`
5. **Port Configuration**:
   - Container port: `5000`
   - Public port: `80` or `443` (EasyPanel will handle this)
6. **Health Check**: Enabled automatically via Dockerfile

### 5. Database Setup

Ensure your PostgreSQL database is accessible from EasyPanel. You can either:
- Use EasyPanel's built-in PostgreSQL service
- Use an external PostgreSQL provider (Neon, Supabase, etc.)

The application will run database migrations automatically on startup.

## File Structure

```
.
├── Dockerfile          # Main Docker configuration
├── .dockerignore       # Files to exclude from Docker build
├── package.json        # Dependencies and scripts
├── client/            # React frontend source
├── server/            # Express.js backend source
└── shared/            # Shared types and schemas
```

## Build Process

The Docker build process:
1. Installs system dependencies
2. Copies package files and installs npm dependencies  
3. Copies application source code
4. Builds the application (`npm run build`)
5. Removes development dependencies
6. Sets up non-root user for security
7. Configures health checks

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Verify `DATABASE_URL` is correct
   - Ensure database is accessible from EasyPanel
   - Check database credentials and permissions

2. **Build Failures**
   - Check if all dependencies are properly listed in `package.json`
   - Verify Node.js version compatibility

3. **Health Check Failures**
   - Application takes time to start (adjust health check start period)
   - Database connection issues preventing startup

### Logs
Monitor application logs in EasyPanel dashboard for detailed error information.

### Performance Optimization

- The Dockerfile uses Alpine Linux for smaller image size
- Dependencies are cached separately from source code for faster rebuilds
- Production dependencies only in final image
- Health checks ensure service reliability

## Security Features

- Non-root user execution
- Minimal base image (Alpine)
- No unnecessary packages
- Environment-based configuration
- Latest Node.js LTS version