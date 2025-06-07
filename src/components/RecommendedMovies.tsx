import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, IconButton, useTheme, useMediaQuery, Snackbar, Alert } from '@mui/material';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';
import MovieCard from './MovieCard';
import { Movie, MovieFormData } from '../types';
import { getRecommendedMovies, addMovie, getMovies } from '../services/api';

const RecommendedMovies: React.FC<{ onMovieAdded: () => void }> = ({ onMovieAdded }) => {
    const [recommendedMovies, setRecommendedMovies] = useState<Movie[]>([]);
    const [currentMovies, setCurrentMovies] = useState<Movie[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
        open: false,
        message: '',
        severity: 'success'
    });
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

    const fetchCurrentMovies = async () => {
        try {
            const movies = await getMovies();
            setCurrentMovies(movies);
        } catch (err) {
            console.error('Error fetching current movies:', err);
        }
    };

    useEffect(() => {
        fetchRecommendedMovies();
        fetchCurrentMovies();
    }, []);

    const handleAdd = async (movie: Movie) => {
        try {
            // Check if movie already exists
            const movieExists = currentMovies.some(
                m => m.title.toLowerCase() === movie.title.toLowerCase()
            );

            if (movieExists) {
                setSnackbar({
                    open: true,
                    message: 'This movie is already in your list!',
                    severity: 'error'
                });
                return;
            }

            const movieData: MovieFormData = {
                title: movie.title,
                year: typeof movie.year === 'string' ? parseInt(movie.year) : movie.year,
                rating: movie.rating,
                status: 'Want to Watch' as const,
                overview: movie.overview,
                recommendation: movie.recommendation,
                poster_url: movie.poster_url,
                type: 'movie'
            };
            await addMovie(movieData);
            // Remove the added movie from recommendations
            setRecommendedMovies(prev => prev.filter(m => m.id !== movie.id));
            // Fetch a new recommendation
            fetchRecommendedMovies();
            // Update current movies list
            fetchCurrentMovies();
            onMovieAdded();
            setSnackbar({
                open: true,
                message: 'Movie added successfully!',
                severity: 'success'
            });
        } catch (error) {
            console.error('Error adding movie:', error);
            setSnackbar({
                open: true,
                message: 'Failed to add movie. Please try again.',
                severity: 'error'
            });
        }
    };

    const handleCloseSnackbar = () => {
        setSnackbar(prev => ({ ...prev, open: false }));
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
            <Snackbar
                open={snackbar.open}
                autoHideDuration={3000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default RecommendedMovies; 