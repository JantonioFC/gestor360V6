# Gestor 360 - Document Management Application

## Overview

Gestor 360 is a modern document management application built with a full-stack TypeScript architecture. The application serves as a personal knowledge management system with Markdown editing capabilities, folder organization, and a specialized Kanban view for project management. It combines the functionality of note-taking apps like Obsidian with the clarity of Notion, featuring a clean dark theme interface.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for lightweight client-side routing
- **Build Tool**: Vite for fast development and optimized builds
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **State Management**: TanStack Query (React Query) for server state management
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **API Design**: RESTful API with JSON responses
- **Schema Validation**: Zod schemas shared between client and server

### Development Setup
- **Package Manager**: npm with package-lock.json
- **TypeScript Configuration**: Shared tsconfig.json for client, server, and shared code
- **Module System**: ES Modules throughout the application
- **Development Server**: Vite dev server with HMR integration

## Key Components

### Data Models
The application uses three main entities:
- **Users**: Basic authentication system with username/password
- **Documents**: Markdown documents with title, content, folder organization, and timestamps
- **Folders**: Predefined categories (DDE, Planificación, Retrospectivas, Notas) with icons and paths

### UI Components Structure
- **Sidebar**: Hierarchical folder navigation with search functionality and document listing
- **MainContent**: Multi-view container supporting editor, preview, and kanban modes
- **MarkdownEditor**: Live markdown editing with auto-save functionality
- **MarkdownPreview**: Rendered markdown display with custom styling
- **KanbanView**: Special view that parses markdown content into kanban boards
- **NewEntryModal**: Dynamic form generator based on selected folder type

### Storage System
- **Development**: In-memory storage with sample data initialization
- **Production**: PostgreSQL database with Drizzle ORM migrations
- **File Operations**: CRUD operations for documents and folders through REST API

## Data Flow

### Document Management Flow
1. User selects folder from sidebar
2. System fetches documents for selected folder via REST API
3. User can create new documents using folder-specific templates
4. Document editing happens in real-time with auto-save functionality
5. Changes are persisted to database through PATCH requests

### View Switching Flow
1. User selects view mode (editor/preview/kanban) from main content header
2. Component switches rendering mode while maintaining document state
3. Kanban view parses markdown content to extract task information
4. All views share the same document data but present different interfaces

### Search and Navigation Flow
1. User enters search query in sidebar
2. System performs real-time search across document titles and content
3. Results are filtered and displayed in sidebar
4. Search state is managed through React Query with debouncing

## External Dependencies

### Core Framework Dependencies
- **React Ecosystem**: React, React DOM, React Hook Form
- **Routing**: Wouter for lightweight client-side routing
- **HTTP Client**: Fetch API with custom wrapper functions
- **State Management**: TanStack Query for server state caching

### UI and Styling Dependencies
- **UI Framework**: Radix UI primitives for accessibility
- **Styling**: Tailwind CSS with PostCSS processing
- **Icons**: Lucide React for consistent iconography
- **Utilities**: clsx and tailwind-merge for conditional styling

### Backend Dependencies
- **Database**: Drizzle ORM with PostgreSQL dialect
- **Database Provider**: Neon Database serverless driver
- **Validation**: Zod for runtime type checking and schema validation
- **Date Handling**: date-fns for date manipulation and formatting

### Development Dependencies
- **Build Tools**: Vite with React plugin and TypeScript support
- **Code Quality**: ESBuild for server bundling
- **Development Tools**: Replit-specific plugins for development environment

## Deployment Strategy

### Build Process
1. **Client Build**: Vite builds React application with code splitting and optimization
2. **Server Build**: ESBuild bundles Node.js server with external package handling
3. **Static Assets**: Client build outputs to `dist/public` directory
4. **Server Bundle**: Server bundle outputs to `dist/index.js`

### Environment Configuration
- **Development**: Uses tsx for TypeScript execution with Vite dev server
- **Production**: Uses built JavaScript bundle with static file serving
- **Database**: Environment-based DATABASE_URL configuration for Neon Database

### Hosting Requirements
- **Node.js Environment**: Compatible with Replit and similar platforms
- **PostgreSQL Database**: Neon Database for serverless PostgreSQL hosting
- **Static File Serving**: Express serves built client files in production
- **Environment Variables**: DATABASE_URL required for database connection

### Scaling Considerations
- **Database**: Neon Database provides automatic scaling for PostgreSQL
- **File Storage**: Currently in-database, can be extended to external storage
- **Session Management**: Ready for session store integration with connect-pg-simple
- **API Caching**: TanStack Query provides client-side caching with configurable strategies