import * as fs from 'fs';
import * as path from 'path';

const logsDirectory = path.join(__dirname, './');
const searchLogFile = path.join(logsDirectory, 'search_queries.log');

interface SearchLogEntry {
  timestamp: string;
  method: string;
  searchQuery: string;
  pageNumber?: number;
  limitNumber?: number;
}

export interface SearchLogParam {
  method: string;
  searchQuery: string;
  pageNumber?: number;
  limitNumber?: number;
}

const ensureLogDirectoryExists = () => {
  if (!fs.existsSync(logsDirectory)) {
    fs.mkdirSync(logsDirectory, { recursive: true });
  }
};

/**
 * Store search history log in file.
 * @param method request method (GET|POST)
 * @param searchQuery seach query.
 * @param pageNumber number of the page (if provided).
 * @param limitNumber page sizeof results (if provided).
 */
export const logSearchQuery = async ({
    method,
    searchQuery,
    pageNumber,
    limitNumber
  }: SearchLogParam): Promise<void> => {
  ensureLogDirectoryExists();

  const logEntry: SearchLogEntry = {
    timestamp: new Date().toISOString(),
    method,
    searchQuery,
    pageNumber,
    limitNumber,
  };

  const logLine = JSON.stringify(logEntry) + '\n';

  try {
    await fs.promises.appendFile(searchLogFile, logLine, 'utf8');
  } catch (error) {
    console.error('Error trying store search history log:', error);
  }
};

/**
 * Get history log items.
 * @param itemsToShow number of items to show (always the newest)
 * @return array of search log entry
 */
export const getLogSearchItems = async (itemsToShow: number): Promise<SearchLogEntry[]> => {
  ensureLogDirectoryExists();

  if (itemsToShow <= 0) {
    return [];
  }

  try {
    const data = await fs.promises.readFile(searchLogFile, 'utf8');
    if (data.length === 0) {
      return [];
    }

    const allLogEntries: SearchLogEntry[] = data
      .split('\n')
      .filter(line => line.trim() !== '')
      .map(line => {
        try {
          return JSON.parse(line);
        } catch (parseError) {
          console.error('Error parsing log line:', line, parseError);
          return null;
        }
      })
      .filter(entry => entry !== null) as SearchLogEntry[];

    const getMethodEntries = allLogEntries.filter(entry => entry.method === 'GET').reverse();
    return getMethodEntries.slice(0, itemsToShow);
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      return [];
    }
    console.error('Error reading or processing search history log:', error);
    return [];
  }
}