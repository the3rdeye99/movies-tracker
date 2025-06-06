import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, IconButton, useTheme, useMediaQuery } from '@mui/material';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';
import MovieCard from './MovieCard';
import { Movie, MovieFormData } from '../types';
import { getRecommendedMovies, addMovie } from '../services/api';

const RecommendedMovies: React.FC<{ onMovieAdded: () => void }> = ({ onMovieAdded }) => {
    const [recommendedMovies, setRecommendedMovies] = useState<Movie[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const fetchRecommendedMovies = async () => {
        try {
            setLoading(true);
            const movies = await getRecommendedMovies();
            setRecommendedMovies(movies);
            setError(null);
        } catch (err) {
            setError('Failed to fetch recommended movies');
            console.error('Error fetching recommended movies:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRecommendedMovies();
    }, []);

    const handleAdd = async (movie: Movie) => {
        try {
            const movieData: MovieFormData = {
                title: movie.title,
                year: typeof movie.year === 'string' ? parseInt(movie.year) : movie.year,
                rating: movie.rating,
                status: 'Want to Watch' as const,
                overview: movie.overview,
                recommendation: '',
                poster_url: movie.poster_url
            };
            await addMovie(movieData);
            // Remove the added movie from recommendations
            setRecommendedMovies(prev => prev.filter(m => m.id !== movie.id));
            // Fetch a new recommendation
            fetchRecommendedMovies();
            onMovieAdded();
        } catch (error) {
            console.error('Error adding movie:', error);
        }
    };

    const handleScroll = (direction: 'left' | 'right') => {
        if (scrollContainerRef.current) {
            const scrollAmount = 240; // Width of one card
            const currentScroll = scrollContainerRef.current.scrollLeft;
            const newScroll = direction === 'left' 
                ? currentScroll - scrollAmount 
                : currentScroll + scrollAmount;
            
            scrollContainerRef.current.scrollTo({
                left: newScroll,
                behavior: 'smooth'
            });
        }
    };

    if (loading) {
        return (
            <Box sx={{ p: 4, textAlign: 'center' }}>
                <Typography>Loading recommendations...</Typography>
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ p: 4, textAlign: 'center' }}>
                <Typography color="error">{error}</Typography>
            </Box>
        );
    }

    if (recommendedMovies.length === 0) {
        return (
            <Box sx={{ p: 4, textAlign: 'center' }}>
                <Typography>No recommendations available. Add some movies to your watchlist first!</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ mb: 4 }}>
            <Typography variant="h5" component="h2" sx={{ mb: 2, px: 4 }}>
                Recommended Movies
            </Typography>
            <Box sx={{ position: 'relative' }}>
                {!isMobile && (
                    <>
                        <IconButton
                            onClick={() => handleScroll('left')}
                            sx={{
                                position: 'absolute',
                                left: 4,
                                top: '50%',
                                transform: 'translateY(-50%)',
                                bgcolor: 'background.paper',
                                boxShadow: 1,
                                zIndex: 1,
                                '&:hover': { bgcolor: 'background.paper' }
                            }}
                        >
                            <ChevronLeft />
                        </IconButton>
                        <IconButton
                            onClick={() => handleScroll('right')}
                            sx={{
                                position: 'absolute',
                                right: 4,
                                top: '50%',
                                transform: 'translateY(-50%)',
                                bgcolor: 'background.paper',
                                boxShadow: 1,
                                zIndex: 1,
                                '&:hover': { bgcolor: 'background.paper' }
                            }}
                        >
                            <ChevronRight />
                        </IconButton>
                    </>
                )}
                <Box
                    ref={scrollContainerRef}
                    sx={{
                        display: 'flex',
                        gap: 2,
                        overflowX: 'auto',
                        px: { xs: 4, sm: 6, md: 8 },
                        py: 2,
                        scrollbarWidth: 'none',
                        '&::-webkit-scrollbar': { display: 'none' },
                        '& > *': { flexShrink: 0 }
                    }}
                >
                    {recommendedMovies.map((movie) => (
                        <MovieCard
                            key={`recommended-${movie.id}-${movie.title}`}
                            movie={movie}
                            onEdit={handleAdd}
                            onDelete={() => {}}
                            isRecommended={true}
                        />
                    ))}
                </Box>
            </Box>
        </Box>
    );
};

export default RecommendedMovies; 