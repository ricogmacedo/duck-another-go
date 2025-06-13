# Duck Another Go - API

A RESTful API service that provides search functionality using the DuckDuckGo API. Built with Koa.js and TypeScript.

## Technical Overview

### Built With
- **NodeJS** - JavaScript runtime environment for executing server-side code
- **TypeScript** - JavaScript superset that adds static typing and modern features
- **KoaJS** - Lightweight and modern Node.js web framework focused on middleware architecture
- **Jest** - Delightful JavaScript testing framework with rich features and snapshot testing
- **Docker** - Container platform for consistent development and deployment environments
- **DuckDuckGo API** - Search engine API providing privacy-focused search results

### Key Features
- Queries DuckDuckGo's API for search results
- Provides pagination support
- Logs search queries
- Includes comprehensive error handling
- Uses dependency injection for better testability

## Getting Started

### Prerequisites

- Node.js (v22.16.0 or later)
- npm (included with Node.js)
- Docker (optional, for containerized deployment)

### Installation

This frontend application is part of a monorepo structure where multiple packages coexist in a single repository.

1. Clone the monorepo:
```bash
git clone [repository-url]
cd duck-another-go
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

### Running the Application

Run the development server:
```bash
npm run dev
```

The API will be available at `http://localhost:3000`

## Available Scripts

- `npm start` - Run the production server
- `npm run dev` - Run development server with hot reload
- `npm run build` - Build TypeScript code
- `npm test` - Run unit tests
- `npm run test:watch` - Run tests in watch mode
- `npm run dev:init` - Initialize development environment by creating .env file from template
- `npm run dev:docker:build` - Build Docker image for development environment
- `npm run dev:docker:run` - Run the application in a Docker container with hot reload

## API Endpoints

### GET /search
Search for topics with optional pagination.

Query parameters:
- `query` (required) - Search term
- `page` (optional) - Page number (default: 1)
- `limit` (optional) - Results per page (default: 10)

### GET /search/history
Retrieve search history.

Query parameters:
- `items` (optional) - Number of history items (default: 10)

## Environment Variables

- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment (development/production)
- `DUCKDUCKGO_API_BASE_URL` - DuckDuckGo API URL

## Project Structure

```
src/
├── adapters/          # Data transformation layer
├── config/           # Configuration files
├── controllers/      # Request handlers
├── middlewares/      # Custom middleware
├── routes/           # API routes
├── services/         # Business logic
├── types/           # TypeScript type definitions
└── utils/           # Utility functions
```

## Error Handling

The API implements consistent error responses:
- 400: Bad Request
- 404: Not Found
- 500: Internal Server Error
- 502: Bad Gateway (DuckDuckGo API errors)

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.