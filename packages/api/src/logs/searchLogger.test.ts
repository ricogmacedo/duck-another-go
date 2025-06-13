const fsExistsSyncMock = jest.fn();
const fsMkdirSyncMock = jest.fn();
const fsAppendFileMock = jest.fn();
const fsPromisesReadFileMock = jest.fn();
jest.mock('fs', () => ({
  existsSync: (...args: any) => fsExistsSyncMock(...args),
  mkdirSync: (...args: any) => fsMkdirSyncMock(...args),
  promises: {
    appendFile: (...args: any) => fsAppendFileMock(...args),
    readFile: (...args: any) => fsPromisesReadFileMock(...args),
  },
}));

const pathJoinMock = jest.fn();
const MOCK_LOGS_DIR = '/mock/logs';
const MOCK_LOG_FILE = '/mock/logs/search_queries.log';
pathJoinMock
  .mockReturnValueOnce(MOCK_LOGS_DIR)
  .mockReturnValueOnce(MOCK_LOG_FILE);
jest.mock('path', () => ({
  join: (...args: any) => pathJoinMock(...args),
}));

import { logSearchQuery, getLogSearchItems, SearchLogParam } from './searchLogger';

describe('searchLogger', () => {
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    fsExistsSyncMock.mockClear();
    fsMkdirSyncMock.mockClear();
    fsAppendFileMock.mockClear();

    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    fsExistsSyncMock.mockReturnValue(false);
    fsAppendFileMock.mockResolvedValue(undefined);
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  test('should create log directory if it does not exist', async () => {
    const params: SearchLogParam = { method: 'GET', searchQuery: 'test' };
    await logSearchQuery(params);

    expect(fsExistsSyncMock).toHaveBeenCalledWith(MOCK_LOGS_DIR);
    expect(fsExistsSyncMock).toHaveBeenCalledTimes(1);

    expect(fsMkdirSyncMock).toHaveBeenCalledWith(MOCK_LOGS_DIR, { recursive: true });
    expect(fsMkdirSyncMock).toHaveBeenCalledTimes(1);
  });

  test('should not create log directory if it already exists', async () => {
    fsExistsSyncMock.mockReturnValue(true);

    const params: SearchLogParam = { method: 'POST', searchQuery: 'another test' };
    await logSearchQuery(params);

    expect(fsExistsSyncMock).toHaveBeenCalledWith(MOCK_LOGS_DIR);
    expect(fsMkdirSyncMock).not.toHaveBeenCalled();
  });

  test('should append log entry to file with correct format', async () => {
    const mockDate = new Date('2025-06-10T12:00:00.000Z');
    jest.spyOn(global, 'Date').mockImplementation(() => mockDate as any);

    const params: SearchLogParam = {
      method: 'GET',
      searchQuery: 'example query',
      pageNumber: 1,
      limitNumber: 10,
    };
    await logSearchQuery(params);

    const expectedLogEntry = {
      timestamp: mockDate.toISOString(),
      method: 'GET',
      searchQuery: 'example query',
      pageNumber: 1,
      limitNumber: 10,
    };
    const expectedLogLine = JSON.stringify(expectedLogEntry) + '\n';

    expect(fsAppendFileMock).toHaveBeenCalledTimes(1);
    expect(fsAppendFileMock).toHaveBeenCalledWith(MOCK_LOG_FILE, expectedLogLine, 'utf8');
  });

  test('should handle log entry without optional pageNumber and limitNumber', async () => {
    const mockDate = new Date('2025-06-10T13:00:00.000Z');
    jest.spyOn(global, 'Date').mockImplementation(() => mockDate as any);

    const params: SearchLogParam = {
      method: 'POST',
      searchQuery: 'simple search',
    };
    await logSearchQuery(params);

    const expectedLogEntry = {
      timestamp: mockDate.toISOString(),
      method: 'POST',
      searchQuery: 'simple search',
    };
    const expectedLogLine = JSON.stringify(expectedLogEntry) + '\n';

    expect(fsAppendFileMock).toHaveBeenCalledTimes(1);
    expect(fsAppendFileMock).toHaveBeenCalledWith(MOCK_LOG_FILE, expectedLogLine, 'utf8');
  });

  test('should log an error to console if appendFile fails', async () => {
    const mockAppendError = new Error('Disk full error');
    fsAppendFileMock.mockRejectedValueOnce(mockAppendError);

    const params: SearchLogParam = { method: 'GET', searchQuery: 'fail test' };
    await logSearchQuery(params);

    expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
    expect(consoleErrorSpy).toHaveBeenCalledWith('Error trying store search history log:', mockAppendError);
  });
});

describe('getLogSearchItems', () => {
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    fsPromisesReadFileMock.mockClear();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  test('should return an empty array if itemsToShow is 0 or less', async () => {
    const result = await getLogSearchItems(0);
    expect(result).toEqual([]);

    const result2 = await getLogSearchItems(-5);
    expect(result2).toEqual([]);

    expect(fsPromisesReadFileMock).not.toHaveBeenCalled();
  });

  test('should return an empty array if log file does not exist (ENOENT)', async () => {
    fsPromisesReadFileMock.mockRejectedValue({ code: 'ENOENT' });

    const result = await getLogSearchItems(5);
    expect(result).toEqual([]);
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  test('should return an empty array if log file is empty', async () => {
    fsPromisesReadFileMock.mockResolvedValue("");

    const result = await getLogSearchItems(5);
    expect(result).toEqual([]);
    expect(fsPromisesReadFileMock).toHaveBeenCalledTimes(1);
  });

  test('should return empty array if no GET entries are found', async () => {
    const mockLogContent = [
      '{"timestamp":"2025-06-10T11:00:00.000Z","method":"POST","searchQuery":"query1"}',
      '{"timestamp":"2025-06-10T11:01:00.000Z","method":"POST","searchQuery":"query2"}',
      '{"timestamp":"2025-06-10T11:02:00.000Z","method":"PUT","searchQuery":"query3"}',
    ];

    fsPromisesReadFileMock.mockResolvedValue(mockLogContent.join("\n"))

    const result = await getLogSearchItems(5);
    expect(result).toEqual([]);
    expect(fsPromisesReadFileMock).toHaveBeenCalledWith(MOCK_LOG_FILE, "utf8");
  });

  test('should return correct number of GET entries, sorted by timestamp (newest first)', async () => {
    const mockLogContent = [
      '{"timestamp":"2025-06-10T11:00:00.000Z","method":"GET","searchQuery":"oldest GET"}',
      '{"timestamp":"2025-06-10T11:05:00.000Z","method":"POST","searchQuery":"some POST"}',
      '{"timestamp":"2025-06-10T11:10:00.000Z","method":"GET","searchQuery":"middle GET"}',
      '{"timestamp":"2025-06-10T11:15:00.000Z","method":"POST","searchQuery":"another POST"}',
      '{"timestamp":"2025-06-10T11:20:00.000Z","method":"GET","searchQuery":"newest GET"}',
      '{"timestamp":"2025-06-10T11:25:00.000Z","method":"GET","searchQuery":"even newer GET"}',
      '{"timestamp":"2025-06-10T11:30:00.000Z","method":"GET","searchQuery":"very newest GET"}',
    ];

    fsPromisesReadFileMock.mockResolvedValue(mockLogContent.join("\n"));

    const expectedEntries = [
      { timestamp: "2025-06-10T11:30:00.000Z", method: "GET", searchQuery: "very newest GET" },
      { timestamp: "2025-06-10T11:25:00.000Z", method: "GET", searchQuery: "even newer GET" },
      { timestamp: "2025-06-10T11:20:00.000Z", method: "GET", searchQuery: "newest GET" },
      { timestamp: "2025-06-10T11:10:00.000Z", method: "GET", searchQuery: "middle GET" },
      { timestamp: "2025-06-10T11:00:00.000Z", method: "GET", searchQuery: "oldest GET" },
    ];

    const result = await getLogSearchItems(5);
    expect(result).toEqual(expectedEntries);
  });

  test('should return fewer items if itemsToShow is greater than available GET entries', async () => {
    const mockLogContent = [
      '{"timestamp":"2025-06-10T11:00:00.000Z","method":"GET","searchQuery":"one"}',
      '{"timestamp":"2025-06-10T11:05:00.000Z","method":"POST","searchQuery":"post"}',
      '{"timestamp":"2025-06-10T11:10:00.000Z","method":"GET","searchQuery":"two"}',
    ];

    fsPromisesReadFileMock.mockResolvedValue(mockLogContent.join("\n"));

    const expectedEntries = [
      { timestamp: "2025-06-10T11:10:00.000Z", method: "GET", searchQuery: "two" },
      { timestamp: "2025-06-10T11:00:00.000Z", method: "GET", searchQuery: "one" },
    ];

    const result = await getLogSearchItems(5);
    expect(result).toEqual(expectedEntries);
  });

  test('should handle malformed log lines gracefully and skip them', async () => {
    const mockLogContent = [
      '{"timestamp":"2025-06-10T11:00:00.000Z","method":"GET","searchQuery":"good line"}',
      '{"timestamp":"2025-06-10T11:05:00.000Z","method":"GET", "searchQuery":"another good",', // malformed JSON
      'this is not json',
      '{"timestamp":"2025-06-10T11:10:00.000Z","method":"GET","searchQuery":"last good line"}',
    ];

    fsPromisesReadFileMock.mockResolvedValue(mockLogContent.join("\n"));

    const expectedEntries = [
      { timestamp: "2025-06-10T11:10:00.000Z", method: "GET", searchQuery: "last good line" },
      { timestamp: "2025-06-10T11:00:00.000Z", method: "GET", searchQuery: "good line" },
    ];

    const result = await getLogSearchItems(5);
    expect(result).toEqual(expectedEntries);
    expect(consoleErrorSpy).toHaveBeenCalledTimes(2);
    expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('Error parsing log line'), expect.any(String), expect.any(Error));
  });

  test('should handle general error during file reading', async () => {
    const mockReadError = new Error('Permission denied');
    fsPromisesReadFileMock.mockRejectedValue(mockReadError);

    const result = await getLogSearchItems(5);
    expect(result).toEqual([]);
    expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
    expect(consoleErrorSpy).toHaveBeenCalledWith('Error reading or processing search history log:', mockReadError);
  });
});