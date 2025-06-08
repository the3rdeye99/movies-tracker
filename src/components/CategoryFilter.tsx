import React from 'react';
import { Box, ToggleButton, ToggleButtonGroup, useTheme, useMediaQuery } from '@mui/material';

interface CategoryFilterProps {
    selectedCategory: string;
    onCategoryChange: (category: string) => void;
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({ selectedCategory, onCategoryChange }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const handleChange = (
        event: React.MouseEvent<HTMLElement>,
        newCategory: string,
    ) => {
        if (newCategory !== null) {
            onCategoryChange(newCategory);
        }
    };

    return (
        <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            mb: 3,
            px: isMobile ? 1 : 0,
            overflowX: 'auto',
            '&::-webkit-scrollbar': {
                display: 'none'
            },
            msOverflowStyle: 'none',
            scrollbarWidth: 'none'
        }}>
            <ToggleButtonGroup
                value={selectedCategory}
                exclusive
                onChange={handleChange}
                aria-label="movie status filter"
                size={isMobile ? "small" : "medium"}
                sx={{
                    '& .MuiToggleButton-root': {
                        px: isMobile ? 1.5 : 3,
                        py: isMobile ? 0.5 : 1,
                        textTransform: 'none',
                        fontWeight: 'medium',
                        borderRadius: '20px !important',
                        fontSize: isMobile ? '0.75rem' : '0.875rem',
                        whiteSpace: 'nowrap',
                        '&.Mui-selected': {
                            backgroundColor: 'primary.main',
                            color: 'white',
                            '&:hover': {
                                backgroundColor: 'primary.dark',
                            },
                        },
                    },
                }}
            >
                <ToggleButton value="all" aria-label="all movies">
                    All
                </ToggleButton>
                <ToggleButton value="Want to Watch" aria-label="want to watch">
                    Want to Watch
                </ToggleButton>
                <ToggleButton value="Watching" aria-label="watching">
                    Watching
                </ToggleButton>
                <ToggleButton value="Watched" aria-label="watched">
                    Watched
                </ToggleButton>
            </ToggleButtonGroup>
        </Box>
    );
};

export default CategoryFilter; 