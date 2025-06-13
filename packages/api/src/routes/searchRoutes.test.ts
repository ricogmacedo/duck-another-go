import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import request from 'supertest';
import { errorHandler } from '../middlewares/errorHandler';

import router from './searchRoutes';
import { DuckDuckGoGETApiError } from '../errors';

const duckDuckGoSearchMock = jest.fn();
jest.mock('../services/DuckDuckGoService', () => ({
  DuckDuckGoService: jest.fn().mockImplementation(() => ({
    search: (...args: any) => duckDuckGoSearchMock(...args),
  })),
}));

const logSearchQueryMock = jest.fn();
const getLogSearchItemsMock = jest.fn();
jest.mock('../logs/searchLogger', () => ({
  logSearchQuery: (...args: any) => logSearchQueryMock(...args),
  getLogSearchItems: (...args: any) => getLogSearchItemsMock(...args),
}));

const app = new Koa();
app.use(errorHandler);
app.use(bodyParser());
app.use(router.routes());
app.use(router.allowedMethods());

describe('Search Routes', () => {
  beforeEach(() => {
    duckDuckGoSearchMock.mockRestore();
    logSearchQueryMock.mockRestore();
    process.env.NODE_ENV = 'development';
  });

  afterEach(() => {
    process.env.NODE_ENV = 'test';
  });

  describe('GET /search', () => {
    test('should return 400 if query is missing', async () => {
      const response = await request(app.callback()).get('/search');
      expect(response.status).toBe(400);
      expect(response.body.error.message).toBe('Search query is required!');
    });

    test('should return 400 if query is empty', async () => {
      const response = await request(app.callback()).get('/search?query=');
      expect(response.status).toBe(400);
      expect(response.body.error.message).toBe('Search query is required!');
    });

    test('should return 400 if page is not a number', async () => {
      const response = await request(app.callback()).get('/search?query=test&page=abc');
      expect(response.status).toBe(400);
      expect(response.body.error.message).toBe('Param page must be a number and greater than zero.');
    });

    test('should return 400 if page is less than 1', async () => {
      const response = await request(app.callback()).get('/search?query=test&page=0');
      expect(response.status).toBe(400);
      expect(response.body.error.message).toBe('Param page must be a number and greater than zero.');
    });

    test('should return 400 if limit is not a number', async () => {
      const response = await request(app.callback()).get('/search?query=test&limit=xyz');
      expect(response.status).toBe(400);
      expect(response.body.error.message).toBe('Param limit must be a number and greater than zero.');
    });

    test('should return 400 if limit is less than 1', async () => {
      const response = await request(app.callback()).get('/search?query=test&limit=0');
      expect(response.status).toBe(400);
      expect(response.body.error.message).toBe('Param limit must be a number and greater than zero.');
    });

    test('should return 200 and data on successful search with defaults', async () => {
      const mockResult = {
        data: [{ url: 'mock_url', title: 'Mock Title' }],
        pagination: { totalItems: 1, totalPages: 1, currentPage: 1, limit: 10, hasNextPage: false, hasPreviousPage: false }
      };
      duckDuckGoSearchMock.mockResolvedValue(mockResult); 

      const response = await request(app.callback()).get('/search?query=valid');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockResult);
      expect(duckDuckGoSearchMock).toHaveBeenCalledWith({ searchQuery: 'valid', pageNumber: 1, limitNumber: 10 });
      expect(logSearchQueryMock).toHaveBeenCalledWith({ method: 'GET', searchQuery: 'valid' });
    });

    test('should return 200 and data on successful search with custom pagination', async () => {
      const mockResult = {
        data: [{ url: 'mock_url_2', title: 'Mock Title 2' }],
        pagination: { totalItems: 20, totalPages: 2, currentPage: 2, limit: 10, hasNextPage: false, hasPreviousPage: true }
      };
      duckDuckGoSearchMock.mockResolvedValue(mockResult);

      const response = await request(app.callback()).get('/search?query=valid&page=2&limit=5');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockResult);
      expect(duckDuckGoSearchMock).toHaveBeenCalledWith({ searchQuery: 'valid', pageNumber: 2, limitNumber: 5 });
      expect(logSearchQueryMock).toHaveBeenCalledWith({ method: 'GET', searchQuery: 'valid', pageNumber: 2, limitNumber: 5 });
    });

    test('should return 502 if DuckDuckGoService throws an error', async () => {
      duckDuckGoSearchMock.mockRejectedValue(new DuckDuckGoGETApiError());

      const response = await request(app.callback()).get('/search?query=fail');

      expect(response.status).toBe(502);
      expect(response.body.error.message).toBe('Error trying get DuckDuckGo API data.');
    });

    test('should do a history query without saving a new log in the history', async () => {
      const mockResult = {
        data: [{ url: 'mock_url', title: 'Mock Title' }],
        pagination: { totalItems: 1, totalPages: 1, currentPage: 1, limit: 10, hasNextPage: false, hasPreviousPage: false }
      };
      duckDuckGoSearchMock.mockResolvedValue(mockResult); 

      const response = await request(app.callback()).get('/search?query=valid&history=true');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockResult);
      expect(duckDuckGoSearchMock).toHaveBeenCalledWith({ searchQuery: 'valid', pageNumber: 1, limitNumber: 10 });
      expect(logSearchQueryMock).not.toHaveBeenCalled();
    });
  });

  describe('POST /search', () => {
    test('should return 400 if query is missing in body', async () => {
      const response = await request(app.callback()).post('/search').send({});
      expect(response.status).toBe(400);
      expect(response.body.error.message).toBe('Search query is required!');
    });

    test('should return 400 if query is empty in body', async () => {
      const response = await request(app.callback()).post('/search').send({ query: '' });
      expect(response.status).toBe(400);
      expect(response.body.error.message).toBe('Search query is required!');
    });

    test('should return 200 and success data if page is given as 0', async () => {
      const mockResult = {
        data: [{ url: 'mock_url_post', title: 'Mock Title Post' }],
        pagination: { totalItems: 1, totalPages: 1, currentPage: 1, limit: 10, hasNextPage: false, hasPreviousPage: false }
      };
      duckDuckGoSearchMock.mockResolvedValue(mockResult);

      const response = await request(app.callback()).post('/search').send({ query: 'valid_post', page: 0 });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockResult);
      expect(duckDuckGoSearchMock).toHaveBeenCalledWith({ searchQuery: 'valid_post', pageNumber: 1, limitNumber: 10 });
      expect(logSearchQueryMock).toHaveBeenCalledWith({ method: 'POST', searchQuery: 'valid_post', pageNumber: 0 });
    });

    test('should return 200 and success data if limit is given as 0', async () => {
      const mockResult = {
        data: [{ url: 'mock_url_post', title: 'Mock Title Post' }],
        pagination: { totalItems: 1, totalPages: 1, currentPage: 1, limit: 10, hasNextPage: false, hasPreviousPage: false }
      };
      duckDuckGoSearchMock.mockResolvedValue(mockResult);

      const response = await request(app.callback()).post('/search').send({ query: 'valid_post', limit: 0 });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockResult);
      expect(duckDuckGoSearchMock).toHaveBeenCalledWith({ searchQuery: 'valid_post', pageNumber: 1, limitNumber: 10 });
      expect(logSearchQueryMock).toHaveBeenCalledWith({ method: 'POST', searchQuery: 'valid_post', limitNumber: 0 });
    });

    test('should return 200 and data on successful search with defaults in body', async () => {
      const mockResult = {
        data: [{ url: 'mock_url_post', title: 'Mock Title Post' }],
        pagination: { totalItems: 1, totalPages: 1, currentPage: 1, limit: 10, hasNextPage: false, hasPreviousPage: false }
      };
      duckDuckGoSearchMock.mockResolvedValue(mockResult);

      const response = await request(app.callback()).post('/search').send({ query: 'valid_post' });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockResult);
      expect(duckDuckGoSearchMock).toHaveBeenCalledWith({ searchQuery: 'valid_post', pageNumber: 1, limitNumber: 10 });
      expect(logSearchQueryMock).toHaveBeenCalledWith({ method: 'POST', searchQuery: 'valid_post' });
    });

    test('should return 200 and data on successful search with custom pagination in body', async () => {
      const mockResult = {
        data: [{ url: 'mock_url_post_2', title: 'Mock Title Post 2' }],
        pagination: { totalItems: 30, totalPages: 3, currentPage: 3, limit: 10, hasNextPage: false, hasPreviousPage: false }
      };
      duckDuckGoSearchMock.mockResolvedValue(mockResult);

      const response = await request(app.callback()).post('/search').send({ query: 'valid_post', page: 3, limit: 10 });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockResult);
      expect(duckDuckGoSearchMock).toHaveBeenCalledWith({ searchQuery: 'valid_post', pageNumber: 3, limitNumber: 10 });
      expect(logSearchQueryMock).toHaveBeenCalledWith({ method: 'POST', searchQuery: 'valid_post', pageNumber: 3, limitNumber: 10 });
    });

    test('should return 502 if DuckDuckGoService throws an error for POST', async () => {
      duckDuckGoSearchMock.mockRejectedValue(new DuckDuckGoGETApiError());

      const response = await request(app.callback()).post('/search').send({ query: 'fail_post' });

      expect(response.status).toBe(502);
      expect(response.body.error.message).toBe('Error trying get DuckDuckGo API data.');
    });

    test('should do a history query without saving a new log in the history', async () => {
      const mockResult = {
        data: [{ url: 'mock_url', title: 'Mock Title' }],
        pagination: { totalItems: 1, totalPages: 1, currentPage: 1, limit: 10, hasNextPage: false, hasPreviousPage: false }
      };
      duckDuckGoSearchMock.mockResolvedValue(mockResult); 

      const response = await request(app.callback()).post('/search').send({ query: 'valid_post', history: true });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockResult);
      expect(duckDuckGoSearchMock).toHaveBeenCalledWith({ searchQuery: 'valid_post', pageNumber: 1, limitNumber: 10 });
      expect(logSearchQueryMock).not.toHaveBeenCalled();
    });
  });

  describe('GET /search/history', () => {
    test('should return 400 if items is not a number', async () => {
      const response = await request(app.callback()).get('/search/history?items=test');
      expect(response.status).toBe(400);
      expect(response.body.error.message).toBe('Param items must be a number and greater than zero.');
    });

    test('should return 200 and data with search history log', async () => {
      const mockResult = [
        { timestamp: "2025-06-10T11:30:00.000Z", method: "GET", searchQuery: "one" },
        { timestamp: "2025-06-10T11:25:00.000Z", method: "GET", searchQuery: "two", pageNumber: 1, limitNumber: 2 },
      ];
      getLogSearchItemsMock.mockResolvedValue(mockResult); 

      const response = await request(app.callback()).get('/search/history');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockResult);
      expect(getLogSearchItemsMock).toHaveBeenCalledWith(10);
    });

    test('should return 200 and data with search history log with custom items param', async () => {
      const mockResult = [
        { timestamp: "2025-06-10T11:30:00.000Z", method: "GET", searchQuery: "one" },
      ];
      getLogSearchItemsMock.mockResolvedValue(mockResult); 

      const response = await request(app.callback()).get('/search/history?items=1');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockResult);
      expect(getLogSearchItemsMock).toHaveBeenCalledWith(1);
    });
  });
});