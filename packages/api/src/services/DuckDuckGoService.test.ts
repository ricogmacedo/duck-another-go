import axios from 'axios';
import { DuckDuckGoApiResponse, RelatedTopic, DuckDuckGoService } from './DuckDuckGoService';
import { adaptDuckDuckGoRelatedTopics } from '../adapters/RelatedTopicsAdapter';
import { DuckDuckGoGETApiError, SearchQueryRequiredError } from '../errors';

jest.mock('axios');
jest.mock('../config', () => ({
  config: {
    duckDuckGoApiBaseUrl: 'https://api.duckduckgo.com',
  },
}));
jest.mock('../adapters/RelatedTopicsAdapter');

const mockedAxios = axios as jest.Mocked<typeof axios>;
const mockedAdaptTopics = adaptDuckDuckGoRelatedTopics as jest.Mock;

describe('DuckDuckGoService', () => {
  let service: DuckDuckGoService;

  beforeEach(() => {
    service = new DuckDuckGoService();
    jest.resetAllMocks();
  });

  it('should throw SearchQueryRequiredError if searchQuery is not provided', async () => {
    await expect( service.search({ searchQuery: '', pageNumber: 1, limitNumber: 10 }))
      .rejects.toThrow(SearchQueryRequiredError);
  });

  it('should return data and pagination on a successful search', async () => {
    const mockApiResponse: DuckDuckGoApiResponse = {
      RelatedTopics: [{ Text: 'Result 1', FirstURL: 'url1' }, { Text: 'Result 2', FirstURL: 'url2' }],
    };
    
    const mockAdaptedTopics: RelatedTopic[] = [
      { title: 'Result 1', url: 'url1' },
      { title: 'Result 2', url: 'url2' },
      { title: 'Result 3', url: 'url3' },
    ];

    mockedAxios.get.mockResolvedValue({
      data: mockApiResponse,
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {} as any,
    });
    mockedAdaptTopics.mockReturnValue(mockAdaptedTopics);

    const params = { searchQuery: 'test', pageNumber: 1, limitNumber: 2 };
    const result = await service.search(params);
    
    expect(axios.get).toHaveBeenCalledWith('https://api.duckduckgo.com/?q=test&format=json');
    expect(mockedAdaptTopics).toHaveBeenCalledWith(mockApiResponse.RelatedTopics);
    expect(result.data).toHaveLength(2);
    expect(result.data[0].title).toBe('Result 1');
    expect(result.pagination).toEqual({
      totalItems: 3,
      totalPages: 2,
      currentPage: 1,
      pageSize: 2,
      hasNextPage: true,
      hasPreviousPage: false,
    });
  });
  
  it('should return an empty response when API returns no RelatedTopics', async () => {
    const mockApiResponse = { RelatedTopics: [] };
    mockedAxios.get.mockResolvedValue({
      data: mockApiResponse,
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {} as any,
    });

    mockedAdaptTopics.mockReturnValue([]);

    const params = { searchQuery: 'empty', pageNumber: 1, limitNumber: 10 };
    const result = await service.search(params);

    expect(result.data).toEqual([]);
    expect(result.pagination).toEqual({
        totalItems: 0,
        totalPages: 1,
        currentPage: 1,
        pageSize: 10,
        hasNextPage: false,
        hasPreviousPage: false,
    });
  });

  it('should throw DuckDuckGoGETApiError when the API call fails', async () => {
    const apiError = new Error('Network Error');
    mockedAxios.get.mockRejectedValue(apiError);

    const params = { searchQuery: 'error', pageNumber: 1, limitNumber: 10 };

    await expect(service.search(params)).rejects.toThrow(DuckDuckGoGETApiError);
  });

  it('should handle pagination correctly for subsequent pages', async () => {
    const mockAdaptedTopics: RelatedTopic[] = [
      { title: 'Result 1', url: 'url1' },
      { title: 'Result 2', url: 'url2' },
      { title: 'Result 3', url: 'url3' },
      { title: 'Result 4', url: 'url4' },
    ];
    
    mockedAxios.get.mockResolvedValue({
      data: { RelatedTopics: [{}] },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {} as any,
    });

    mockedAdaptTopics.mockReturnValue(mockAdaptedTopics);
    
    const params = { searchQuery: 'pagination test', pageNumber: 2, limitNumber: 2 };
    const result = await service.search(params);

    expect(result.data).toHaveLength(2);
    expect(result.data[0].title).toBe('Result 3'); // Verifica se pegou os itens corretos
    expect(result.pagination).toEqual({
      totalItems: 4,
      totalPages: 2,
      currentPage: 2,
      pageSize: 2,
      hasNextPage: false,
      hasPreviousPage: true,
    });
  });
});