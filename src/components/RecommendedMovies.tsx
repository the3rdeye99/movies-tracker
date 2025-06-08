import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, IconButton, useTheme, useMediaQuery, CircularProgress, Snackbar, Alert } from '@mui/material';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';
import MovieCard from './MovieCard';
import { Movie, MovieFormData } from '../types';
import { getRecommendedMovies, addMovie, getMovies } from '../services/api';

interface RecommendedMoviesProps {
    onMovieAdded: () => void;
}

const RecommendedMovies: React.FC<RecommendedMoviesProps> = ({ onMovieAdded }) => {
    const [recommendations, setRecommendations] = useState<Movie[]>([]);
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

    const fetchRecommendations = async () => {
        try {
            setLoading(true);
            const data = await getRecommendedMovies();
            setRecommendations(data);
            setError(null);
        } catch (err) {
            setError('Failed to fetch movie recommendations');
            console.error('Error fetching movie recommendations:', err);
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
        fetchRecommendations();
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
                status: 'Want to Watch',
                overview: movie.overview,
                recommendation: movie.recommendation,
                poster_url: movie.poster_url,
                type: 'movie'
            };

            // Optimistically update the UI
            setRecommendations(prev => prev.filter(m => m.id !== movie.id));
            setCurrentMovies(prev => [...prev, { ...movie, ...movieData }]);
            
            // Trigger parent update immediately
            onMovieAdded();
            window.dispatchEvent(new CustomEvent('movie-added'));

            // Show success message
            setSnackbar({
                open: true,
                message: 'Movie added successfully!',
                severity: 'success'
            });

            // Make API call in the background
            await addMovie(movieData);
            
            // Refresh data in the background
            Promise.all([
                fetchCurrentMovies(),
                fetchRecommendations()
            ]).catch(err => {
                console.error('Error refreshing data:', err);
            });

        } catch (err) {
            // Revert optimistic update on error
            setRecommendations(prev => [...prev, movie]);
            setCurrentMovies(prev => prev.filter(m => m.id !== movie.id));
            
            console.error('Error adding movie:', err);
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

    const handleScrollLeft = () => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollBy({
                left: -400,
                behavior: 'smooth'
            });
        }
    };

    const handleScrollRight = () => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollBy({
                left: 400,
                behavior: 'smooth'
            });
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ p: 4, textAlign: 'center' }}>
                <Typography color="error">
                    {error === 'Failed to fetch movie recommendations'
                        ? 'Please add at least three movies to your watchlist to receive personalized recommendations.'
                        : error}
                </Typography>
            </Box>
        );
    }

    if (recommendations.length === 0) {
        return (
            <Box sx={{ p: 4, textAlign: 'center' }}>
                <Typography>
                    Add at least three movies to your watchlist to receive personalized recommendations!
                </Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ mt: 4 }}>
            <Typography variant="h5" sx={{ mb: 2 }}>
                Recommended Movies
            </Typography>
            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                    <CircularProgress />
                </Box>
            ) : error ? (
                <Typography color="error" align="center">
                    {error}
                </Typography>
            ) : recommendations.length === 0 ? (
                <Typography align="center" color="text.secondary">
                    No recommendations available at the moment.
                </Typography>
            ) : (
                <Box sx={{ position: 'relative' }}>
                    <IconButton
                        onClick={handleScrollLeft}
                        sx={{
                            position: 'absolute',
                            left: -20,
                            top: '50%',
                            transform: 'translateY(-50%)',
                            bgcolor: 'background.paper',
                            boxShadow: 1,
                            '&:hover': { bgcolor: 'background.paper' },
                            zIndex: 1,
                            display: { xs: 'none', sm: 'flex' }
                        }}
                    >
                        <ChevronLeft />
                    </IconButton>
                    <Box
                        ref={scrollContainerRef}
                        sx={{
                            display: 'flex',
                            overflowX: 'auto',
                            scrollBehavior: 'smooth',
                            scrollbarWidth: 'none',
                            msOverflowStyle: 'none',
                            '&::-webkit-scrollbar': {
                                display: 'none'
                            },
                            gap: 3,
                            pb: 2
                        }}
                    >
                        {recommendations.map((movie) => (
                            <Box
                                key={`recommended-movie-${movie.id}-${movie.title}`}
                                sx={{
                                    flex: '0 0 auto',
                                    width: {
                                        xs: '100%',
                                        sm: 'calc(50% - 12px)',
                                        md: 'calc(33.333% - 16px)',
                                        lg: 'calc(25% - 18px)',
                                        xl: 'calc(20% - 19.2px)'
                                    }
                                }}
                            >
                                <MovieCard
                                    movie={movie}
                                    onEdit={handleAdd}
                                    onDelete={() => {}}
                                    isRecommended={true}
                                />
                            </Box>
                        ))}
                    </Box>
                    <IconButton
                        onClick={handleScrollRight}
                        sx={{
                            position: 'absolute',
                            right: -20,
                            top: '50%',
                            transform: 'translateY(-50%)',
                            bgcolor: 'background.paper',
                            boxShadow: 1,
                            '&:hover': { bgcolor: 'background.paper' },
                            zIndex: 1,
                            display: { xs: 'none', sm: 'flex' }
                        }}
                    >
                        <ChevronRight />
                    </IconButton>
                </Box>
            )}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert
                    onClose={handleCloseSnackbar}
                    severity={snackbar.severity}
                    sx={{ width: '100%' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default RecommendedMovies; 