import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface HistoryItem {
  query: string;
  timestamp: string;
}

interface SearchState {
  currentQuery: string;
  searchHistory: HistoryItem[];
  highlightTerm: string;
}

const initialState: SearchState = {
  currentQuery: '',
  searchHistory: [],
  highlightTerm: '',
};

export const searchSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {
    setCurrentQuery: (state, action: PayloadAction<string>) => {
      state.currentQuery = action.payload;
    },
    addToHistory: (state, action: PayloadAction<string>) => {
      const newHistoryItem = {
        query: action.payload,
        timestamp: new Date().toLocaleString('en-US'),
      };
      state.searchHistory = [newHistoryItem, ...state.searchHistory].slice(0, 5);
    },
    setHighlightTerm: (state, action: PayloadAction<string>) => {
      state.highlightTerm = action.payload;
    },
  },
});

export const { setCurrentQuery, addToHistory, setHighlightTerm } = searchSlice.actions;
export default searchSlice.reducer;
