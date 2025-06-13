import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

interface SearchResult {
  title: string;
  url: string;
}

interface SearchResponse {
  data: SearchResult[];
  pagination: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export const duckApi = createApi({
  reducerPath: 'duckApi',
  baseQuery: fetchBaseQuery({ 
    baseUrl: '/api',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    }
  }),
  endpoints: (builder) => ({
    search: builder.query<SearchResponse, { query: string; page?: number; limit?: number; history?: boolean }>({
      query: ({ query, page = 1, limit = 10, history = false }) => ({
        url: '/search',
        params: {
          query,
          page,
          limit,
          history,
        },
      }),
    }),
    getHistory: builder.query<Array<{ searchQuery: string; timestamp: string }>, number>({
      query: (items = 5) => ({
        url: '/search/history',
        params: { items },
      }),
    }),
  }),
});
