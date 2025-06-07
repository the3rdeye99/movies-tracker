import React, { useState, useEffect } from 'react';
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
import { getTVShowTrailer, searchTMDBTV } from '../services/api';

interface TVShowDetailsProps {
    show: Movie;
    open: boolean;
    onClose: () => void;
}

const TVShowDetails: React.FC<TVShowDetailsProps> = ({ show, open, onClose }) => {
    const [trailerUrl, setTrailerUrl] = useState<string | null>(null);
    const [isTrailerOpen, setIsTrailerOpen] = useState(false);
    const [isLoadingTrailer, setIsLoadingTrailer] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Reset states when dialog closes
    useEffect(() => {
        if (!open) {
            setTrailerUrl(null);
            setIsTrailerOpen(false);
            setIsLoadingTrailer(false);
            setError(null);
        }
    }, [open]);

    const handleTrailerClick = async () => {
        setIsLoadingTrailer(true);
        setError(null);
        try {
            let tmdbId: string;
            
            // If we already have the TMDB ID stored, use it
            if (show.tmdb_id) {
                tmdbId = show.tmdb_id.toString();
            } else {
                // Otherwise, search for the TV show in TMDB to get its ID
                const searchResponse = await searchTMDBTV(show.title);
                
                if (!searchResponse || !searchResponse.id) {
                    throw new Error('TV show not found in TMDB');
                }
                tmdbId = searchResponse.id.toString();
            }

            // Fetch the trailer using the TMDB ID
            const trailerResponse = await getTVShowTrailer(tmdbId, 'tv');

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

    const handleClose = () => {
        onClose();
    };

    return (
        <>
            <Dialog 
                open={open} 
                onClose={handleClose}
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
                            {show.title}
                        </Typography>
                        {show.year && (
                            <Typography variant="subtitle1" color="text.secondary">
                                ({show.year})
                            </Typography>
                        )}
                    </Box>
                </DialogTitle>
                <DialogContent sx={{ p: 1.5 }}>
                    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 1.5 }}>
                        <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 33%' }, position: 'relative' }}>
                            {show.poster_url ? (
                                <Box sx={{ position: 'relative' }}>
                                    <Box
                                        component="img"
                                        src={show.poster_url}
                                        alt={show.title}
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
                                    <Rating value={show.rating || 0} readOnly size="small" />
                                    {show.rating && (
                                        <Typography variant="body2" sx={{ ml: 0.5 }}>
                                            ({show.rating}/5)
                                        </Typography>
                                    )}
                                </Box>
                                {show.status && (
                                    <Chip 
                                        label={show.status} 
                                        color={
                                            show.status === 'Watched' ? 'success' :
                                            show.status === 'Watching' ? 'primary' :
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
                                {show.overview}
                            </Typography>
                            {show.recommendation && (
                                <>
                                    <Typography variant="subtitle1" component="h2" gutterBottom>
                                        Recommendation
                                    </Typography>
                                    <Typography variant="body2" paragraph>
                                        {show.recommendation}
                                    </Typography>
                                </>
                            )}
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ px: 1.5, py: 0.5 }}>
                    <Button onClick={handleClose} size="small">Close</Button>
                </DialogActions>
            </Dialog>

            {/* Trailer Modal */}
            <Dialog
                open={isTrailerOpen || isLoadingTrailer}
                onClose={handleTrailerClose}
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
                        onClick={handleTrailerClose}
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
                            bgcolor: 'black'
                        }}>
                            <CircularProgress color="primary" />
                        </Box>
                    ) : trailerUrl ? (
                        <Box sx={{ 
                            flex: 1,
                            position: 'relative',
                            paddingTop: '56.25%', // 16:9 aspect ratio
                            height: 0,
                            overflow: 'hidden'
                        }}>
                            <iframe
                                src={trailerUrl}
                                style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    width: '100%',
                                    height: '100%',
                                    border: 0
                                }}
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            />
                        </Box>
                    ) : error ? (
                        <Box sx={{ 
                            display: 'flex', 
                            justifyContent: 'center', 
                            alignItems: 'center',
                            height: '100%',
                            bgcolor: 'black',
                            color: 'white'
                        }}>
                            <Typography>{error}</Typography>
                        </Box>
                    ) : null}
                </DialogContent>
            </Dialog>
        </>
    );
};

export default TVShowDetails; 