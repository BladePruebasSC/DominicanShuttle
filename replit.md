# Overview

This is a full-stack web application for Dominican Transport Pro, a tourism transportation service in the Dominican Republic. The application provides booking functionality for airport transfers, private tours, and group transportation services. It features a modern React frontend with TypeScript, a Node.js/Express backend, and PostgreSQL database integration using Drizzle ORM.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite as the build tool
- **Routing**: Wouter for client-side routing with pages for home, booking, tours, fleet, and contact
- **UI Library**: Radix UI components with shadcn/ui design system and Tailwind CSS for styling
- **State Management**: TanStack Query (React Query) for server state management and caching
- **Form Handling**: React Hook Form with Zod validation for type-safe form validation
- **Component Structure**: Modular component architecture with reusable UI components and page-specific components

## Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful API endpoints for vehicles, tours, testimonials, bookings, and contact messages
- **Development Server**: Vite integration for hot module replacement during development
- **Error Handling**: Centralized error handling middleware with structured error responses

## Data Storage
- **Database**: PostgreSQL with Neon serverless database
- **ORM**: Drizzle ORM for type-safe database operations and schema management
- **Schema Design**: Well-structured tables for users, bookings, vehicles, tours, testimonials, and contact messages
- **Migrations**: Drizzle Kit for database schema migrations and management
- **Development Storage**: In-memory storage implementation for development/testing

## Authentication & Authorization
- **Session Management**: Express sessions with PostgreSQL session store (connect-pg-simple)
- **User System**: Basic user authentication with username/password (currently minimal implementation)
- **Security**: Basic session-based authentication prepared for future enhancement

## External Dependencies

### Core Framework Dependencies
- **React Ecosystem**: React 18, React DOM, TypeScript support
- **Build Tools**: Vite with React plugin and TypeScript configuration
- **Development Tools**: ESBuild for production builds, TSX for development server

### UI and Styling
- **UI Components**: Comprehensive Radix UI component library for accessible components
- **Styling**: Tailwind CSS with custom design tokens and utility classes
- **Icons**: Lucide React for consistent iconography
- **Fonts**: Google Fonts integration (Inter, DM Sans, Fira Code, Geist Mono, Architects Daughter)

### Database and Backend
- **Database**: Neon Database (serverless PostgreSQL) via @neondatabase/serverless
- **ORM**: Drizzle ORM with PostgreSQL dialect and Zod integration for schema validation
- **Session Storage**: connect-pg-simple for PostgreSQL-backed session management

### Form and Validation
- **Form Management**: React Hook Form with Hookform Resolvers for Zod integration
- **Validation**: Zod for runtime type checking and validation schemas
- **Date Handling**: date-fns for date formatting and manipulation

### State Management and Data Fetching
- **Server State**: TanStack React Query for caching, synchronization, and background updates
- **Utility Libraries**: clsx and tailwind-merge for conditional CSS classes
- **Component Utilities**: class-variance-authority for component variant management

### Development and Replit Integration
- **Replit Tools**: Specialized Vite plugins for Replit environment integration
- **Error Handling**: Runtime error overlay for development debugging
- **Environment**: Replit-specific configurations and development banner

### Business Logic Libraries
- **UUID Generation**: crypto.randomUUID for unique identifier generation
- **Carousel**: Embla Carousel React for image and content carousels
- **Command Interface**: cmdk for search and command interfaces

The application follows a modern full-stack architecture with clear separation of concerns, type safety throughout the stack, and development-friendly tooling. The codebase is structured for scalability with modular components, shared type definitions, and a robust data layer.