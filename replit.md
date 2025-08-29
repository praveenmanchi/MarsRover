# NASA JPL Mars Rover Mission Control

## Overview

This is a full-stack web application for tracking NASA Mars rovers with interactive mapping, timeline navigation, and rover image galleries using real NASA APIs. The application provides a mission control interface to monitor active Mars rovers including Perseverance, Curiosity, Opportunity, and Spirit, displaying real-time data, photos, and mission timelines.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The client-side application is built with **React 18** using TypeScript and follows a component-based architecture. The UI is styled with **Tailwind CSS** and uses **shadcn/ui** components for consistent design. The application uses **Vite** as the build tool for fast development and optimized production builds.

**State Management**: Uses **TanStack Query (React Query)** for server state management, providing caching, background updates, and optimistic updates for NASA API data.

**Routing**: Implements client-side routing with **Wouter**, a lightweight routing library.

**Styling**: Utilizes Tailwind CSS with custom CSS variables for theming and shadcn/ui components for pre-built, accessible UI elements.

### Backend Architecture
The server is built with **Express.js** and TypeScript, following a RESTful API design pattern. The server acts as a proxy and data aggregator for NASA's Mars Photos API.

**API Endpoints**:
- `/api/rovers` - Get all available rovers
- `/api/rovers/:name` - Get specific rover details
- `/api/rovers/:name/photos` - Get rover photos by sol or earth date
- `/api/rovers/:name/latest_photos` - Get latest photos from a rover

**Storage Layer**: Uses an in-memory storage implementation with plans for PostgreSQL integration via Drizzle ORM. The storage interface abstracts data operations for rovers and photos.

### Data Storage Solutions
**Primary Database**: Configured for **PostgreSQL** with **Drizzle ORM** for type-safe database operations. The schema includes tables for rovers and rover photos with proper indexing and relationships.

**Caching Strategy**: Implements in-memory caching for NASA API responses to reduce external API calls and improve performance.

**Database Schema**:
- `rovers` table: Stores rover metadata including status, landing dates, and mission statistics
- `rover_photos` table: Caches NASA photo data with rover associations and metadata

### Authentication and Authorization
Currently implements a basic session-based approach with plans for more robust authentication. The application uses `connect-pg-simple` for PostgreSQL session storage.

### External Service Integrations
**NASA Mars Photos API**: Primary data source for rover information and images. The application handles API rate limiting and error responses gracefully.

**Mapping Services**: Integrates with **Leaflet** for interactive Mars surface mapping, displaying rover positions and mission paths.

**Image Processing**: Handles NASA's image URLs with fallback mechanisms for failed image loads.

### Development and Deployment
**Build Process**: Uses Vite for frontend builds and esbuild for backend compilation. The application supports both development and production environments with different configurations.

**Environment Configuration**: Supports multiple environment variables for NASA API keys and database connections.

**Error Handling**: Implements comprehensive error handling with user-friendly error messages and fallback UI states.

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL database driver optimized for serverless environments
- **drizzle-orm**: Type-safe ORM for database operations
- **express**: Web framework for the backend API
- **@tanstack/react-query**: Server state management for React

### UI Framework
- **React 18**: Core frontend framework
- **@radix-ui/***: Accessible UI primitives for building the component system
- **tailwindcss**: Utility-first CSS framework
- **lucide-react**: Icon library

### Development Tools
- **vite**: Build tool and development server
- **typescript**: Type safety across the application
- **wouter**: Lightweight client-side routing

### External APIs
- **NASA Mars Photos API**: Provides rover data and images
- **Leaflet**: Interactive mapping library for Mars surface visualization

### Specialized Libraries
- **date-fns**: Date manipulation and formatting
- **zod**: Runtime type validation and schema definition
- **leaflet**: Interactive mapping capabilities