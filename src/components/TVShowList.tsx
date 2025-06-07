import React from 'react';
import { Container, Typography, Box } from '@mui/material';
import TVShowCard from './TVShowCard';
import { Movie } from '../types';

interface TVShowListProps {
    shows: Movie[];
    onEdit: (show: Movie) => void;
    onDelete: (id: number) => void;
    onShowClick?: (show: Movie) => void;
}

const TVShowList: React.FC<TVShowListProps> = ({ shows, onEdit, onDelete, onShowClick }) => {
    if (shows.length === 0) {
        return (
            <Container sx={{ py: 4 }}>
                <Typography variant="h6" align="center" color="text.secondary">
                    No TV shows added yet. Add your first show!
                </Typography>
            </Container>
        );
    }

    return (
        <Container sx={{ py: 4 }}>
            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: {
                        xs: 'repeat(1, 1fr)',
                        sm: 'repeat(2, 1fr)',
                        md: 'repeat(3, 1fr)',
                        lg: 'repeat(4, 1fr)',
                        xl: 'repeat(5, 1fr)'
                    },
                    gap: { xs: 2, sm: 2, md: 3 },
                    width: '100%',
                    justifyContent: 'center',
                    '& > *': {
                        display: 'flex',
                        justifyContent: 'center',
                        width: '100%'
                    }
                }}
            >
                {shows.map((show) => (
                    <Box 
                        key={show.id}
                        sx={{ 
                            width: '100%'
                        }}
                    >
                        <TVShowCard
                            show={show}
                            onEdit={onEdit}
                            onDelete={onDelete}
                            onShowClick={onShowClick}
                        />
                    </Box>
                ))}
            </Box>
        </Container>
    );
};

export default TVShowList; 