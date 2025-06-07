import React from 'react';
import { Container, Typography, Box } from '@mui/material';
import MovieCard from './MovieCard';
import { Movie } from '../types';

interface MovieListProps {
    movies: Movie[];
    onEdit: (movie: Movie) => void;
    onDelete: (id: number) => void;
}

const MovieList: React.FC<MovieListProps> = ({ movies, onEdit, onDelete }) => {
    if (movies.length === 0) {
        return (
            <Container sx={{ py: 4 }}>
                <Typography variant="h6" align="center" color="text.secondary">
                    No movies added yet. Add your first movie!
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
                        xs: 'repeat(2, 1fr)',
                        sm: 'repeat(2, 1fr)',
                        md: 'repeat(3, 1fr)',
                        xl: 'repeat(5, 1fr)'
                    },
                    gap: { xs: 1, sm: 2, md: 3 },
                    width: '100%',
                    justifyContent: 'center',
                    '& > *': {
                        display: 'flex',
                        justifyContent: 'center'
                    }
                }}
            >
                {movies.map((movie) => (
                    <Box key={movie.id} sx={{ width: '100%' }}>
                        <MovieCard
                            movie={movie}
                            onEdit={onEdit}
                            onDelete={onDelete}
                        />
                    </Box>
                ))}
            </Box>
        </Container>
    );
};

export default MovieList; 