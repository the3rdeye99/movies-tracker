import React from 'react';
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
    Divider,
} from '@mui/material';
import { Movie } from '../types';

interface MovieDetailsProps {
    movie: Movie;
    open: boolean;
    onClose: () => void;
}

const MovieDetails: React.FC<MovieDetailsProps> = ({ movie, open, onClose }) => {
    return (
        <Dialog 
            open={open} 
            onClose={onClose}
            maxWidth="md"
            fullWidth
            PaperProps={{
                sx: {
                    bgcolor: 'background.paper',
                    backgroundImage: 'none',
                }
            }}
        >
            <DialogTitle>
                <Typography variant="h4" component="h1" gutterBottom>
                    {movie.title}
                </Typography>
                {movie.year && (
                    <Typography variant="subtitle1" color="text.secondary">
                        ({movie.year})
                    </Typography>
                )}
            </DialogTitle>
            <DialogContent dividers>
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
                    <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 33%' } }}>
                        {movie.poster_url ? (
                            <Box
                                component="img"
                                src={movie.poster_url}
                                alt={movie.title}
                                sx={{
                                    width: '100%',
                                    height: 'auto',
                                    borderRadius: 1,
                                    boxShadow: 3
                                }}
                            />
                        ) : (
                            <Box
                                sx={{
                                    width: '100%',
                                    height: 400,
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
                        <Box sx={{ mb: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <Rating value={movie.rating || 0} readOnly size="large" />
                                {movie.rating && (
                                    <Typography variant="body1" sx={{ ml: 1 }}>
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
                                    sx={{ mb: 2 }}
                                />
                            )}
                        </Box>
                        <Typography variant="h5" component="h2" gutterBottom>
                            Overview
                        </Typography>
                        <Typography variant="body1" paragraph>
                            {movie.overview}
                        </Typography>
                        {movie.recommendation && (
                            <>
                                <Typography variant="h5" component="h2" gutterBottom>
                                    Recommendation
                                </Typography>
                                <Typography variant="body1" paragraph>
                                    {movie.recommendation}
                                </Typography>
                            </>
                        )}
                    </Box>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Close</Button>
            </DialogActions>
        </Dialog>
    );
};

export default MovieDetails; 