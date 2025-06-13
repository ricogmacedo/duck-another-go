# Duck Another Go

A monorepo containing a search application that uses DuckDuckGo's API. The project consists of two main packages:

## Packages

### [Frontend](packages/frontend/README.md)
A React application built with:
- TypeScript
- Redux Toolkit for state management 
- Joy UI (Material-UI) for components
- Vite as the build tool

### [API](packages/api/README.md) 
A Node.js service that:
- Proxies requests to DuckDuckGo's API
- Provides search history tracking
- Built with Koa.js and TypeScript

## Getting Started

### Prerequisites

- Node.js (v22.16.0 or higher)
- npm (included with Node.js)
- Docker (optional, for containerized deployment)

### Installation

Install all dependencies for both packages:

```bash
npm run all:install
```

### Running the Applications

#### Frontend
Start the development server:
```bash
npm run frontend:start
```
The application will be available at `http://localhost:5173`

Build for production:
```bash
npm run frontend:build
```

#### API
Start normally:
```bash
npm run api:start
```
The API will be available at `http://localhost:3000`

Build for production:
```bash
npm run api:build
```

#### Using Docker (API)
Build the API container:
```bash
npm run api:docker:build
```

Run the API container:
```bash
npm run api:docker:run
```

## Contributing

The project uses Husky for git hooks and lint-staged for pre-commit checks. These are automatically set up when you install dependencies.

To contribute:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes - this will trigger pre-commit hooks
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE