import { Button, Stack } from '@mui/joy';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  isLoading: boolean;
  onPageChange: (page: number) => void;
}

export const Pagination = ({
  currentPage,
  totalPages,
  hasNextPage,
  hasPreviousPage,
  isLoading,
  onPageChange
}: PaginationProps) => {
  return (
    <Stack direction="row" spacing={1} justifyContent="center">
      <Button
        variant="soft"
        disabled={!hasPreviousPage || isLoading}
        onClick={() => onPageChange(currentPage - 1)}
      >
        Previous
      </Button>
      <Button
        variant="soft"
        color="neutral"
        disabled
        sx={{ minWidth: '80px' }}
      >
        {currentPage} / {totalPages}
      </Button>
      <Button
        variant="soft"
        disabled={!hasNextPage || isLoading}
        onClick={() => onPageChange(currentPage + 1)}
      >
        Next
      </Button>
    </Stack>
  );
};
