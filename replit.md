# ScamShield

## Overview

ScamShield is a full-stack web application designed to help users identify and report phone scam attempts. The platform allows users to look up phone numbers to check if they've been reported as scams, submit new scam reports, and view community statistics. Built with a modern React frontend and Express.js backend, the application serves as a community-driven database for protecting users from fraudulent phone calls.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety and modern development practices
- **Routing**: Wouter for lightweight client-side routing
- **UI Framework**: Shadcn/ui components built on Radix UI primitives with Tailwind CSS for styling
- **State Management**: TanStack Query (React Query) for server state management and caching
- **Form Handling**: React Hook Form with Zod validation for type-safe form validation
- **Build Tool**: Vite for fast development and optimized production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js framework for RESTful API endpoints
- **Language**: TypeScript with ES modules for modern JavaScript features
- **API Design**: RESTful endpoints for phone number lookup, scam reporting, and statistics
- **Error Handling**: Centralized error middleware with structured error responses
- **Request Logging**: Custom middleware for API request logging and monitoring

### Data Storage
- **Database**: PostgreSQL with Drizzle ORM for type-safe database interactions
- **Schema Management**: Drizzle Kit for database migrations and schema management
- **Connection**: Neon Database serverless PostgreSQL for cloud-hosted database
- **Fallback Storage**: In-memory storage implementation for development and testing

### Database Schema
- **scam_reports**: Core table storing phone numbers, categories, descriptions, verification status, and report counts
- **disputes**: Table for handling disputes against scam reports
- **Validation**: Zod schemas for runtime type checking and API validation
- **Categories**: Predefined scam categories including debt collection, tech support, fake prizes, etc.

### Authentication & Authorization
- Currently using a simple session-based approach with connect-pg-simple for PostgreSQL session storage
- No complex user authentication system implemented - focuses on anonymous reporting

### API Endpoints
- `GET /api/lookup/:phoneNumber` - Look up scam reports for a specific phone number
- `POST /api/reports` - Submit new scam reports or increment existing report counts
- `GET /api/reports/recent` - Retrieve recently reported scam numbers
- `GET /api/stats` - Get platform statistics (total scams, today's reports, community size)
- `POST /api/disputes` - Submit disputes against existing reports

### Development & Build Process
- **Development**: Concurrent frontend (Vite) and backend (tsx) development servers
- **Build**: Vite for frontend bundling, esbuild for backend compilation
- **Type Checking**: Shared TypeScript configuration across frontend, backend, and shared modules
- **Code Organization**: Monorepo structure with shared schema definitions

## External Dependencies

### Database Services
- **Neon Database**: Serverless PostgreSQL hosting for production database
- **Drizzle ORM**: Modern TypeScript ORM for database operations and migrations

### UI Component Libraries
- **Radix UI**: Headless UI primitives for accessible component foundations
- **Tailwind CSS**: Utility-first CSS framework for responsive design
- **Lucide React**: Icon library for consistent iconography

### Development Tools
- **Replit Integration**: Development plugins for Replit environment compatibility
- **ESBuild**: Fast JavaScript bundler for backend compilation
- **PostCSS**: CSS processing with Tailwind CSS integration

### Runtime Dependencies
- **TanStack Query**: Server state management and caching
- **React Hook Form**: Performance-focused form library
- **Zod**: TypeScript-first schema validation
- **Date-fns**: Date utility library for time formatting
- **Wouter**: Lightweight routing library for React

### Session Management
- **connect-pg-simple**: PostgreSQL session store for Express sessions
- Session-based state management without complex authentication flows