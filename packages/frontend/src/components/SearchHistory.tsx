import { Button, Stack, Typography } from '@mui/joy';

interface SearchHistoryItem {
  searchQuery: string;
  timestamp: string;
}

interface SearchHistoryProps {
  history: SearchHistoryItem[];
  onHistoryItemClick: (query: string) => void;
}

export const SearchHistory = ({ history, onHistoryItemClick }: SearchHistoryProps) => {
  if (!history || history.length === 0) return null;

  return (
    <Stack spacing={1} sx={{ mt: 4 }}>
      <Typography level="body-xs" color="neutral">
        Recent searches:
      </Typography>
      {history.map((item, index) => (
        <Button
          key={index}
          variant="plain"
          color="neutral"          onClick={() => onHistoryItemClick(item.searchQuery)}
          sx={{
            justifyContent: 'flex-start',
            fontSize: '12px',
            py: 0
          }}
        >
          {item.searchQuery} ({item.timestamp})
        </Button>
      ))}
    </Stack>
  );
};
