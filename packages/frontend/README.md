# Duck Another Go - Frontend

A modern React application for searching with a clean, responsive interface using Joy UI components.

## Technical Overview

### Built With
- **React 18** - Frontend library
- **Redux Toolkit** - State management
- **Joy UI (MUI)** - UI component library
- **TypeScript** - Type safety and better developer experience
- **Vite** - Build tool and development server

### Key Features
- Real-time search interface
- Search history tracking
- Results pagination
- Result highlighting
- Responsive design

### Architecture
- **Components**: Modular, reusable components following single-responsibility principle
- **State Management**: Centralized Redux store with RTK Query for API calls
- **Styling**: Joy UI components with custom theming
- **API Integration**: RESTful API consumption with proper error handling

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm (v8 or higher)

### Installation

This frontend application is part of a monorepo structure where multiple packages coexist in a single repository.

1. Clone the monorepo:
```bash
git clone [repository-url]
cd duck-another-go
```

2. Install dependencies at the root level (this will install dependencies for all packages):
```bash
npm install
```

3. Navigate to the frontend package:
```bash
cd packages/frontend
```

4. Install frontend-specific dependencies (if needed):
```bash
npm install
```

5. Set up environment variables:
```bash
cp .env.example .env
```
Then edit the `.env` file with your specific configuration if needed. The application will use these defaults if no .env file is provided:
- `ANOTHER_DUCK_API_BASE_URL`: http://localhost:3000

### Running the Application

#### Development Mode
Start the development server:
```bash
npm start
```
The application will be available at `http://localhost:5173`

#### Production Build
1. Create a production build:
```bash
npm run build
```

2. Preview the production build:
```bash
npm run preview
```

### Available Scripts

- `npm start` - Start development server
- `npm run dev` - Alias for start
- `npm run build` - Create production build
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint for code quality

## Project Structure

```
src/
├── components/         # Reusable UI components
│   ├── SearchBox.tsx
│   ├── SearchResultItem.tsx
│   ├── Pagination.tsx
│   └── SearchHistory.tsx
├── features/          # Redux slices and features
│   └── searchSlice.ts
├── services/          # API services
│   └── duckApi.ts
├── store/            # Redux store configuration
│   └── store.ts
└── App.tsx           # Main application component
```

## API Integration

The application integrates with a search API that provides:
- Search results with title and URL
- Search history tracking
- Pagination support

### Key Endpoints
- `/search` - Main search endpoint
- `/search/history` - Search history endpoint

## Features

### Search
- Real-time search interface
- "Search on Ducks" button for executing searches
- "Find in the results" button for highlighting terms

### Results
- Displays up to 10 results per page
- Shows title and clickable URL for each result
- Links open in new tabs
- Pagination controls when results span multiple pages

### History
- Tracks last 5 search queries
- Shows timestamp for each history item
- Clicking history items performs the search again
- History items are clickable and trigger new searches

## Configuration

The application can be configured using environment variables. Create a `.env` file in the frontend package directory:

```bash
cp .env.example .env
```

Available environment variables:

| Variable                  | Default               | Description                 |
|---------------------------|-----------------------|-----------------------------|
| ANOTHER_DUCK_API_BASE_URL | http://localhost:3000 | Base URL for the API server |

If no `.env` file is provided, the application will use the default values.

### Environment Files
- `.env`: Main environment file (not committed to git)
- `.env.example`: Example environment file with default values (committed to git)

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
