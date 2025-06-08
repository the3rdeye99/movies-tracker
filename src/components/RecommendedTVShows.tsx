import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, IconButton, useTheme, useMediaQuery, CircularProgress, Snackbar, Alert } from '@mui/material';
import { ChevronLeft, ChevronRight, Refresh as RefreshIcon } from '@mui/icons-material';
import TVShowCard from './TVShowCard';
import { Movie, MovieFormData } from '../types';
import { getRecommendedTVShows, addTVShow, getTVShows } from '../services/api';

interface RecommendedTVShowsProps {
    onShowAdded: () => void;
}

const RecommendedTVShows: React.FC<RecommendedTVShowsProps> = ({ onShowAdded }) => {
    const [recommendations, setRecommendations] = useState<Movie[]>([]);
    const [currentShows, setCurrentShows] = useState<Movie[]>([]);
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
            const data = await getRecommendedTVShows();
            setRecommendations(data);
            setError(null);
        } catch (err) {
            setError('Failed to fetch TV show recommendations');
            console.error('Error fetching TV show recommendations:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchCurrentShows = async () => {
        try {
            const shows = await getTVShows();
            setCurrentShows(shows);
        } catch (err) {
            console.error('Error fetching current TV shows:', err);
        }
    };

    useEffect(() => {
        fetchRecommendations();
        fetchCurrentShows();
    }, []);

    const handleAdd = async (show: Movie) => {
        try {
            // Check if show already exists
            const showExists = currentShows.some(
                s => s.title.toLowerCase() === show.title.toLowerCase()
            );

            if (showExists) {
                setSnackbar({
                    open: true,
                    message: 'This TV show is already in your list!',
                    severity: 'error'
                });
                return;
            }

            const showData: MovieFormData = {
                title: show.title,
                year: typeof show.year === 'string' ? parseInt(show.year) : show.year,
                rating: show.rating,
                status: 'Want to Watch',
                overview: show.overview,
                recommendation: show.recommendation,
                poster_url: show.poster_url,
                type: 'tv'
            };

            // Optimistically update the UI
            setRecommendations(prev => prev.filter(s => s.id !== show.id));
            setCurrentShows(prev => [...prev, { ...show, ...showData }]);
            
            // Trigger parent update immediately
            onShowAdded();
            window.dispatchEvent(new CustomEvent('tvshow-added'));

            // Show success message
            setSnackbar({
                open: true,
                message: 'TV show added successfully!',
                severity: 'success'
            });

            // Make API call in the background
            await addTVShow(showData);
            
            // Refresh data in the background
            Promise.all([
                fetchCurrentShows(),
                fetchRecommendations()
            ]).catch(err => {
                console.error('Error refreshing data:', err);
            });

        } catch (err) {
            // Revert optimistic update on error
            setRecommendations(prev => [...prev, show]);
            setCurrentShows(prev => prev.filter(s => s.id !== show.id));
            
            console.error('Error adding TV show:', err);
            setSnackbar({
                open: true,
                message: 'Failed to add TV show. Please try again.',
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
                    {error === 'Failed to fetch TV show recommendations'
                        ? 'Please add at least three TV shows to your watchlist to receive personalized recommendations.'
                        : error}
                </Typography>
            </Box>
        );
    }

    if (recommendations.length === 0) {
        return (
            <Box sx={{ p: 4, textAlign: 'center' }}>
                <Typography>
                    Add at least three TV shows to your watchlist to receive personalized recommendations!
                </Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ mt: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h5">
                Recommended TV Shows
            </Typography>
                <IconButton 
                    onClick={fetchRecommendations}
                    disabled={loading}
                    sx={{ 
                        color: 'primary.main',
                        '&:hover': { color: 'primary.dark' }
                    }}
                >
                    {loading ? <CircularProgress size={24} /> : <RefreshIcon />}
                </IconButton>
            </Box>
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
                            gap: 2,
                            pb: 2
                        }}
                    >
                        {recommendations.map((show) => (
                            <Box
                                key={`recommended-show-${show.id}-${show.title}`}
                                sx={{
                                    flex: '0 0 auto',
                                    width: {
                                        xs: 'calc(100% - 16px)',
                                        sm: 'calc(50% - 8px)',
                                        md: 'calc(33.333% - 11px)',
                                        lg: 'calc(25% - 12px)',
                                        xl: 'calc(20% - 13px)'
                                    },
                                    maxWidth: {
                                        xs: '100%',
                                        sm: '300px',
                                        md: '250px',
                                        lg: '220px',
                                        xl: '200px'
                                    }
                                }}
                            >
                                <TVShowCard
                                    show={show}
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

export default RecommendedTVShows; 