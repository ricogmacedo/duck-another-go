import { SearchRounded, FormatListBulletedRounded } from '@mui/icons-material';
import { Button, Input, Stack, Typography } from '@mui/joy';
import { useDispatch, useSelector } from 'react-redux';
import { useState } from 'react';
import { RootState } from '../store/store';
import { setCurrentQuery, setHighlightTerm } from '../features/searchSlice';
import { duckApi } from '../services/duckApi';
import { SearchResultItem } from './SearchResultItem';
import { Pagination } from './Pagination';
import { SearchHistory } from './SearchHistory';

export const SearchBox = () => {
  const dispatch = useDispatch();
  const currentQuery = useSelector((state: RootState) => state.search.currentQuery);
  const [trigger, { isLoading, data, isFetching }] = duckApi.useLazySearchQuery();
  const [currentPage, setCurrentPage] = useState(1);
  const { refetch: refetchHistory } = duckApi.useGetHistoryQuery(5);
  const { data: history } = duckApi.useGetHistoryQuery(5);
  const handleSearch = async (page = 1) => {
    if (!currentQuery.trim()) return;
      setCurrentPage(page);
    const result = await trigger({ query: currentQuery, page, limit: 10 });
    if (result.data) {
      refetchHistory();
    }
  };

  const handleHighlight = () => {
    dispatch(setHighlightTerm(currentQuery));
  };

  const handlePageChange = (newPage: number) => {
    handleSearch(newPage);
  };
  const handleHistoryClick = (query: string) => {
    dispatch(setCurrentQuery(query));
    trigger({ 
      query, 
      history: true, 
      page: currentPage,
      limit: 10
    });
  };

  return (
    <>
      <Stack spacing={2} sx={{ width: '100%', maxWidth: 600, mx: 'auto' }}>
        <img src="/logo.svg" alt="Duck Logo" style={{ width: '100%', maxWidth: 600 }} />
        
        <Input
          size="lg"
          variant="soft"
          placeholder="Type to search..."
          value={currentQuery}
          onChange={(e) => dispatch(setCurrentQuery(e.target.value))}
        />
        
        <Stack direction="row" spacing={1}>
          <Button
            size="lg"
            variant="soft"
            startDecorator={<SearchRounded />}
            loading={isLoading}
            onClick={() => handleSearch(1)}
            sx={{ flexGrow: 1 }}
          >
            Search on Ducks
          </Button>
          
          <Button
            size="lg"
            variant="soft"
            startDecorator={<FormatListBulletedRounded />}
            onClick={handleHighlight}
            disabled={!data}
            sx={{ flexGrow: 1 }}
          >
            Find in the results
          </Button>
        </Stack>

        {data && (
          <Stack spacing={2} sx={{ mt: 4 }}>
            <Typography 
              level="body-sm" 
              color="neutral"
              sx={{ textAlign: 'right' }}
            >
              Found {data.pagination.totalItems} results
            </Typography>
            
            {data.data.map((result, index) => (
              <SearchResultItem key={`${result.url}-${index}`} {...result} />
            ))}

            {data.pagination.totalPages > 1 && (
              <Pagination 
                currentPage={data.pagination.currentPage}
                totalPages={data.pagination.totalPages}
                hasNextPage={data.pagination.hasNextPage}
                hasPreviousPage={data.pagination.hasPreviousPage}
                isLoading={isFetching}
                onPageChange={handlePageChange}
              />
            )}
          </Stack>
        )}

        <SearchHistory 
          history={history || []}
          onHistoryItemClick={handleHistoryClick}
        />
      </Stack>
    </>
  );
};