import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, IconButton, useTheme, useMediaQuery, CircularProgress } from '@mui/material';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';
import MovieCard from './MovieCard';
import { Movie, MovieFormData } from '../types';
import { getRecommendedTVShows, addTVShow } from '../services/api';

interface RecommendedTVShowsProps {
    onShowAdded: () => void;
}

const RecommendedTVShows: React.FC<RecommendedTVShowsProps> = ({ onShowAdded }) => {
    const [recommendations, setRecommendations] = useState<Movie[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
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

    useEffect(() => {
        fetchRecommendations();
    }, []);

    const handleAdd = async (show: Movie) => {
        try {
            await addTVShow({
                ...show,
                status: 'Want to Watch',
                recommendation: ''
            });
            onShowAdded();
            // Remove the added show from recommendations
            setRecommendations(prev => prev.filter(s => s.id !== show.id));
        } catch (err) {
            console.error('Error adding TV show:', err);
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
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
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

    if (recommendations.length === 0) {
        return (
            <Box sx={{ p: 4, textAlign: 'center' }}>
                <Typography>No TV show recommendations available</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ mt: 4 }}>
            <Typography variant="h6" sx={{ mb: 2, px: 4 }}>
                Recommended TV Shows
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
                        overflowX: 'auto',
                        gap: 2,
                        px: 4,
                        pb: 2,
                        '&::-webkit-scrollbar': {
                            display: 'none'
                        },
                        scrollbarWidth: 'none',
                        msOverflowStyle: 'none'
                    }}
                >
                    {recommendations.map((show) => (
                        <Box
                            key={show.id}
                            sx={{
                                flex: '0 0 auto',
                                width: '320px'
                            }}
                        >
                            <MovieCard
                                movie={show}
                                onEdit={handleAdd}
                                onDelete={() => {}}
                                isRecommended={true}
                            />
                        </Box>
                    ))}
                </Box>
            </Box>
        </Box>
    );
};

export default RecommendedTVShows; 