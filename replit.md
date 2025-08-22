# Overview

This is a real-time chat application built with a modern full-stack architecture. The application allows users to join a chat room by setting a username and exchange messages in real-time. It features a clean, responsive interface built with React and shadcn/ui components, backed by an Express.js server with PostgreSQL database storage using Drizzle ORM.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript
- **UI Library**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Build Tool**: Vite for fast development and optimized production builds

## Backend Architecture
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js for REST API endpoints
- **Database ORM**: Drizzle ORM with PostgreSQL dialect
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **Session Management**: Express sessions with PostgreSQL store
- **API Design**: RESTful endpoints for message operations

## Data Storage
- **Primary Database**: PostgreSQL via Neon Database serverless
- **ORM**: Drizzle ORM for type-safe database operations
- **Schema Management**: Drizzle Kit for migrations and schema management
- **Fallback Storage**: In-memory storage implementation for development/testing

## Database Schema
- **Users Table**: Stores user credentials (id, username, password)
- **Messages Table**: Stores chat messages (id, content, username, timestamp)
- **Validation**: Zod schemas for runtime type validation and API request validation

## Real-time Features
- **Polling Strategy**: Client-side polling every 2 seconds for new messages
- **Auto-scroll**: Automatic scrolling to latest messages
- **Local State**: Username persistence in localStorage

## Development & Deployment
- **Development**: Hot module replacement via Vite dev server
- **Production Build**: Static file serving with Express
- **Environment**: Supports both development and production configurations
- **Replit Integration**: Optimized for Replit hosting environment

# External Dependencies

## Core Framework Dependencies
- **React Ecosystem**: React 18, React DOM for frontend rendering
- **Express.js**: Web framework for API server
- **TypeScript**: Type safety across frontend and backend

## Database & ORM
- **@neondatabase/serverless**: Serverless PostgreSQL database connection
- **drizzle-orm**: Type-safe ORM for database operations
- **drizzle-kit**: Database schema management and migrations
- **connect-pg-simple**: PostgreSQL session store for Express

## UI & Styling
- **@radix-ui/***: Headless UI components (30+ components including dialogs, dropdowns, forms)
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Type-safe component variants
- **clsx**: Conditional CSS class utilities

## State Management & Data Fetching
- **@tanstack/react-query**: Server state management and caching
- **wouter**: Lightweight routing library

## Form Handling & Validation
- **react-hook-form**: Form state management
- **@hookform/resolvers**: Form validation resolvers
- **zod**: Runtime type validation and schema definition

## Development Tools
- **vite**: Fast build tool and dev server
- **@replit/vite-plugin-runtime-error-modal**: Error handling for Replit environment
- **@replit/vite-plugin-cartographer**: Development tooling for Replit
- **esbuild**: JavaScript bundler for server-side code

## Additional Libraries
- **date-fns**: Date manipulation utilities
- **nanoid**: Unique ID generation
- **cmdk**: Command palette component
- **embla-carousel-react**: Carousel/slider components