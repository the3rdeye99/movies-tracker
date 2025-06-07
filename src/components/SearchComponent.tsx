import React, { useState } from 'react';
import {
    Box,
    TextField,
    InputAdornment,
    IconButton,
    Paper,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';

interface SearchComponentProps {
    onSearch: (query: string) => void;
}

const SearchComponent: React.FC<SearchComponentProps> = ({ onSearch }) => {
    const [searchQuery, setSearchQuery] = useState('');

    const handleSearch = () => {
        onSearch(searchQuery);
    };

    const handleClear = () => {
        setSearchQuery('');
        onSearch('');
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    return (
        <Paper 
            elevation={3} 
            sx={{ 
                p: { xs: 1, sm: 2 }, 
                mb: 3, 
                borderRadius: 2,
                position: 'sticky',
                top: 0,
                zIndex: 1000,
                backdropFilter: 'blur(8px)',
                backgroundColor: 'rgba(18, 18, 18, 0.8)',
                borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
                width: { xs: 'calc(100% - 8px)', sm: '95%', md: '90%' },
                mx: 'auto',
                maxWidth: '1400px',
                px: { xs: 0.5, sm: 2 }
            }}
        >
            <Box sx={{ display: 'flex', gap: 1, width: '100%' }}>
                <TextField
                    fullWidth
                    placeholder="Search your list..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={handleKeyPress}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon color="action" />
                            </InputAdornment>
                        ),
                        endAdornment: searchQuery && (
                            <InputAdornment position="end">
                                <IconButton
                                    onClick={handleClear}
                                    edge="end"
                                    size="small"
                                >
                                    <ClearIcon />
                                </IconButton>
                            </InputAdornment>
                        ),
                    }}
                />
            </Box>
        </Paper>
    );
};

export default SearchComponent; 