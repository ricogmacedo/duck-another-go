import { Stack, Typography } from '@mui/joy';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';

interface SearchResultItemProps {
  title: string;
  url: string;
}

export const SearchResultItem = ({ title, url }: SearchResultItemProps) => {
  const highlightTerm = useSelector((state: RootState) => state.search.highlightTerm);
  
  const highlightText = (text: string) => {
    if (!highlightTerm) return text;
    
    const parts = text.split(new RegExp(`(${highlightTerm})`, 'gi'));
    return parts.map((part, i) => 
      part.toLowerCase() === highlightTerm.toLowerCase() ? 
        <span key={i} style={{ backgroundColor: 'yellow' }}>{part}</span> : part
    );
  };

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <Stack
      direction="column"
      spacing={1}
      sx={{
        p: 1,
        '&:hover': {
          backgroundColor: 'neutral.50',
          borderRadius: 'sm',
        }
      }}
    >
      <Typography
        component="a"
        href={url}
        onClick={handleClick}
        level="title-md"
        sx={{
          color: 'primary.500',
          cursor: 'pointer',
          textDecoration: 'none',
          '&:hover': {
            textDecoration: 'underline',
            color: 'primary.600'
          }
        }}
      >
        {highlightText(title)}
      </Typography>
      <Typography
        level="body-xs"
        sx={{
          color: 'success.600',
          wordBreak: 'break-all'
        }}
      >
        {url}
      </Typography>
    </Stack>
  );
};