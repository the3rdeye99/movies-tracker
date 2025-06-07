import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Box,
    Rating,
    Chip,
    IconButton,
    CircularProgress
} from '@mui/material';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import CloseIcon from '@mui/icons-material/Close';
import { Movie } from '../types';
import { getMovieTrailer, getTVShowTrailer, searchTMDB, searchTMDBTV } from '../services/api';

interface MovieDetailsProps {
    movie: Movie;
    open: boolean;
    onClose: () => void;
}

const MovieDetails: React.FC<MovieDetailsProps> = ({ movie, open, onClose }) => {
    const [trailerUrl, setTrailerUrl] = useState<string | null>(null);
    const [isTrailerOpen, setIsTrailerOpen] = useState(false);
    const [isLoadingTrailer, setIsLoadingTrailer] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleTrailerClick = async () => {
        setIsLoadingTrailer(true);
        setError(null);
        try {
            let tmdbId: string;
            
            // If we already have the TMDB ID stored, use it
            if (movie.tmdb_id) {
                tmdbId = movie.tmdb_id.toString();
            } else {
                // Otherwise, search for the movie/TV show in TMDB to get its ID
                const searchResponse = movie.type === 'tv' 
                    ? await searchTMDBTV(movie.title)
                    : await searchTMDB(movie.title);
                
                if (!searchResponse || !searchResponse.id) {
                    throw new Error('Movie/TV show not found in TMDB');
                }
                tmdbId = searchResponse.id.toString();
            }

            // Fetch the trailer using the TMDB ID and type
            const type = movie.type || 'movie'; // Default to 'movie' if type is not set
            const trailerResponse = await getMovieTrailer(tmdbId, type);

            if (trailerResponse && trailerResponse.key) {
                setTrailerUrl(`https://www.youtube.com/embed/${trailerResponse.key}`);
                setIsTrailerOpen(true);
            } else {
                throw new Error('No trailer found');
            }
        } catch (error) {
            console.error('Error fetching trailer:', error);
            setError('Failed to load trailer. Please try again later.');
        } finally {
            setIsLoadingTrailer(false);
        }
    };

    const handleTrailerClose = () => {
        setIsTrailerOpen(false);
        setTrailerUrl(null);
    };

    return (
        <>
        <Dialog 
            open={open} 
            onClose={onClose}
            maxWidth="md"
            fullWidth
            PaperProps={{
                sx: {
                    bgcolor: 'background.paper',
                    backgroundImage: 'none',
                        maxHeight: '90vh',
                }
            }}
        >
                <DialogTitle sx={{ py: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
                        <Typography variant="h5" component="h1">
                    {movie.title}
                </Typography>
                {movie.year && (
                    <Typography variant="subtitle1" color="text.secondary">
                        ({movie.year})
                    </Typography>
                )}
                    </Box>
            </DialogTitle>
                <DialogContent sx={{ p: 1.5 }}>
                    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 1.5 }}>
                        <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 33%' }, position: 'relative' }}>
                        {movie.poster_url ? (
                                <Box sx={{ position: 'relative' }}>
                            <Box
                                component="img"
                                src={movie.poster_url}
                                alt={movie.title}
                                sx={{
                                    width: '100%',
                                    height: 'auto',
                                    borderRadius: 1,
                                            boxShadow: 3,
                                            maxHeight: '50vh'
                                }}
                            />
                                    <IconButton
                                        onClick={handleTrailerClick}
                                        disabled={isLoadingTrailer}
                                        sx={{
                                            position: 'absolute',
                                            bottom: 8,
                                            right: 8,
                                            backgroundColor: 'rgba(0, 0, 0, 0.7)',
                                            color: 'white',
                                            '&:hover': {
                                                backgroundColor: 'rgba(0, 0, 0, 0.9)',
                                                transform: 'scale(1.1)',
                                            },
                                            transition: 'all 0.2s ease-in-out',
                                        }}
                                    >
                                        <PlayCircleOutlineIcon sx={{ fontSize: 32 }} />
                                    </IconButton>
                                </Box>
                        ) : (
                            <Box
                                sx={{
                                    width: '100%',
                                        height: 250,
                                    bgcolor: 'grey.200',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    borderRadius: 1
                                }}
                            >
                                <Typography color="text.secondary">
                                    No Image Available
                                </Typography>
                            </Box>
                        )}
                    </Box>
                    <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 67%' } }}>
                            <Box sx={{ mb: 0.5 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                                    <Rating value={movie.rating || 0} readOnly size="small" />
                                {movie.rating && (
                                        <Typography variant="body2" sx={{ ml: 0.5 }}>
                                        ({movie.rating}/5)
                                    </Typography>
                                )}
                            </Box>
                            {movie.status && (
                                <Chip 
                                    label={movie.status} 
                                    color={
                                        movie.status === 'Watched' ? 'success' :
                                        movie.status === 'Watching' ? 'primary' :
                                        'default'
                                    }
                                        size="small"
                                        sx={{ mb: 0.5 }}
                                />
                            )}
                        </Box>
                            <Typography variant="subtitle1" component="h2" gutterBottom>
                            Overview
                        </Typography>
                            <Typography variant="body2" paragraph sx={{ mb: 1 }}>
                            {movie.overview}
                        </Typography>
                        {movie.recommendation && (
                            <>
                                    <Typography variant="subtitle1" component="h2" gutterBottom>
                                    Recommendation
                                </Typography>
                                    <Typography variant="body2" paragraph>
                                    {movie.recommendation}
                                </Typography>
                            </>
                        )}
                    </Box>
                </Box>
            </DialogContent>
                <DialogActions sx={{ px: 1.5, py: 0.5 }}>
                    <Button onClick={onClose} size="small">Close</Button>
            </DialogActions>
        </Dialog>

            {/* Trailer Modal */}
            <Dialog
                open={isTrailerOpen || isLoadingTrailer}
                onClose={() => {
                    setIsTrailerOpen(false);
                    setIsLoadingTrailer(false);
                }}
                maxWidth="lg"
                fullWidth
                PaperProps={{
                    sx: {
                        bgcolor: 'background.paper',
                        boxShadow: 24,
                        height: '90vh',
                        maxHeight: '90vh',
                        margin: '5vh auto',
                        width: '90vw',
                        maxWidth: '90vw',
                        position: 'relative',
                        overflow: 'hidden'
                    }
                }}
            >
                <DialogContent sx={{ p: 0, height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <IconButton
                        onClick={() => {
                            setIsTrailerOpen(false);
                            setIsLoadingTrailer(false);
                        }}
                        sx={{
                            position: 'absolute',
                            right: 8,
                            top: 8,
                            color: 'white',
                            bgcolor: 'rgba(0, 0, 0, 0.5)',
                            '&:hover': {
                                bgcolor: 'rgba(0, 0, 0, 0.7)'
                            },
                            zIndex: 1
                        }}
                    >
                        <CloseIcon />
                    </IconButton>
                    {isLoadingTrailer ? (
                        <Box sx={{ 
                            display: 'flex', 
                            justifyContent: 'center', 
                            alignItems: 'center',
                            height: '100%',
                            width: '100%',
                            bgcolor: 'black',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            zIndex: 0
                        }}>
                            <CircularProgress 
                                size={100} 
                                thickness={4}
                                sx={{ 
                                    color: 'white',
                                    '& .MuiCircularProgress-circle': {
                                        strokeLinecap: 'round',
                                    }
                                }}
                            />
                        </Box>
                    ) : trailerUrl && (
                        <Box sx={{ 
                            width: '100%', 
                            height: '100%',
                            position: 'relative',
                            '& iframe': {
                                width: '100%',
                                height: '100%',
                                border: 'none'
                            }
                        }}>
                            <iframe
                                src={trailerUrl}
                                title="Movie Trailer"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            />
                        </Box>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
};

export default MovieDetails; 