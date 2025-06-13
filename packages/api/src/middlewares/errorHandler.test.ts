import { errorHandler } from './errorHandler';
import { Context } from 'koa';

describe('errorHandler', () => {
  let mockContext: Context;
  let mockNext: jest.Mock<any, any[]>;
  let consoleSpy: jest.SpyInstance;

  beforeEach(() => {
    mockContext = {
      status: 200,
      body: {},
    } as unknown as Context;
    mockNext = jest.fn();
    consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    process.env.NODE_ENV = 'development';
  });

  afterEach(() => {
    consoleSpy.mockRestore();
    process.env.NODE_ENV = 'test';
  });

  test('should call next middleware if no error is thrown', async () => {
    await errorHandler(mockContext, mockNext);
    expect(mockNext).toHaveBeenCalledTimes(1);
    expect(mockContext.status).toBe(200);
    expect(mockContext.body).toEqual({});
    expect(consoleSpy).not.toHaveBeenCalled();
  });

  test('should catch and handle an error with custom status and message', async () => {
    const customError = new Error('Custom error message');
    (customError as any).status = 404;
    (customError as any).name = 'NotFoundError';
    mockNext.mockImplementationOnce(() => {
      throw customError;
    });

    await errorHandler(mockContext, mockNext);

    expect(mockContext.status).toBe(404);
    expect(mockContext.body).toEqual({
      error: {
        code: 'NotFoundError',
        message: 'Custom error message',
      },
    });
    expect(consoleSpy).toHaveBeenCalledWith('Error thrown by middleware:', customError);
  });

  test('should handle an error with statusCode property', async () => {
    const statusCodeError = new Error('Status code error');
    (statusCodeError as any).statusCode = 401;
    mockNext.mockImplementationOnce(() => {
      throw statusCodeError;
    });

    await errorHandler(mockContext, mockNext);

    expect(mockContext.status).toBe(401);
    expect(mockContext.body).toEqual({
      error: {
        code: 'Error',
        message: 'Status code error',
      },
    });
  });

  test('should not log error in production environment', async () => {
    process.env.NODE_ENV = 'production';
    const prodError = new Error('Production error');
    mockNext.mockImplementationOnce(() => {
      throw prodError;
    });

    await errorHandler(mockContext, mockNext);

    expect(consoleSpy).not.toHaveBeenCalled();
    expect(mockContext.status).toBe(500);
  });

  test('should use default error message if error.message is empty', async () => {
    const errorNoMessage = new Error();
    (errorNoMessage as any).status = 400;
    mockNext.mockImplementationOnce(() => {
      throw errorNoMessage;
    });

    await errorHandler(mockContext, mockNext);

    expect(mockContext.status).toBe(400);
    expect(mockContext.body).toEqual({
      error: {
        code: 'Error',
        message: 'Internal server error',
      },
    });
  });

  test('should use default error code if error.name is empty', async () => {
    const errorNoName = new Error('Error with no name');

    Object.defineProperty(errorNoName, 'name', { value: '' }); 
    (errorNoName as any).status = 400;
    mockNext.mockImplementationOnce(() => {
      throw errorNoName;
    });

    await errorHandler(mockContext, mockNext);

    expect(mockContext.status).toBe(400);
    expect(mockContext.body).toEqual({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Error with no name',
      },
    });
  });
});