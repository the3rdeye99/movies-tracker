import React, { useState } from 'react';
import {
    Card,
    CardContent,
    CardMedia,
    Typography,
    Rating,
    IconButton,
    Box,
    Chip,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import { Movie } from '../types';
import MovieDetails from './MovieDetails';

interface MovieCardProps {
    movie: Movie;
    onEdit: (movie: Movie) => void;
    onDelete: (id: number) => void;
    isRecommended?: boolean;
}

const MovieCard: React.FC<MovieCardProps> = ({ movie, onEdit, onDelete, isRecommended = false }) => {
    const [showDetails, setShowDetails] = useState(false);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Watched':
                return 'success';
            case 'Watching':
                return 'primary';
            case 'Want to Watch':
                return 'default';
            default:
                return 'default';
        }
    };

    const handleCardClick = (e: React.MouseEvent) => {
        // Prevent opening details when clicking action buttons
        if ((e.target as HTMLElement).closest('.action-buttons')) {
            return;
        }
        setShowDetails(true);
    };

    return (
        <>
            <Card 
                sx={{ 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column',
                    maxWidth: '320px',
                    margin: '0 auto',
                    transition: 'transform 0.2s ease-in-out',
                    cursor: 'pointer',
                    '&:hover': {
                        transform: 'scale(1.02)',
                        boxShadow: 3
                    }
                }}
                onClick={handleCardClick}
            >
                {movie.poster_url ? (
                    <CardMedia
                        component="img"
                        height="400"
                        image={movie.poster_url}
                        alt={movie.title}
                        sx={{ objectFit: 'cover' }}
                    />
                ) : (
                    <Box
                        sx={{
                            height: 400,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            bgcolor: 'grey.200',
                        }}
                    >
                        <Typography variant="h6" color="text.secondary">
                            No Image Available
                        </Typography>
                    </Box>
                )}
                <CardContent sx={{ 
                    flexGrow: 1, 
                    position: 'relative', 
                    display: 'flex', 
                    flexDirection: 'column',
                    p: 2,
                    minHeight: '300px'
                }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                        <Typography variant="h6" component="div" sx={{ 
                            fontSize: '1.2rem',
                            fontWeight: 'bold',
                            height: '2.4em',
                            overflow: 'hidden',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            flex: 1,
                            mr: 1,
                            lineHeight: '1.2em'
                        }}>
                            {movie.title}
                        </Typography>
                        <Box className="action-buttons" sx={{ display: 'flex', gap: 0.5, flexShrink: 0 }}>
                            {isRecommended ? (
                                <IconButton 
                                    size="small" 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onEdit(movie);
                                    }}
                                    sx={{ 
                                        bgcolor: 'primary.main',
                                        color: 'white',
                                        '&:hover': { bgcolor: 'primary.dark' }
                                    }}
                                >
                                    <AddIcon />
                                </IconButton>
                            ) : (
                                <>
                                    <IconButton 
                                        size="small" 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onEdit(movie);
                                        }}
                                    >
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton 
                                        size="small" 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onDelete(movie.id);
                                        }}
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                </>
                            )}
                        </Box>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Rating value={movie.rating || 0} readOnly size="medium" />
                        {movie.year && (
                            <Typography variant="body1" color="text.secondary" sx={{ ml: 1 }}>
                                ({movie.year})
                            </Typography>
                        )}
                    </Box>

                    {movie.status && !isRecommended && (
                        <Chip 
                            label={movie.status} 
                            size="small" 
                            color={getStatusColor(movie.status)}
                            sx={{ mb: 1 }}
                        />
                    )}

                    {movie.overview && (
                        <Typography variant="body1" color="text.secondary" sx={{
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 8,
                            WebkitBoxOrient: 'vertical',
                            mb: 1,
                            flex: 1,
                            minHeight: '12em',
                            lineHeight: '1.5em'
                        }}>
                            {movie.overview}
                        </Typography>
                    )}
                </CardContent>
            </Card>
            <MovieDetails
                movie={movie}
                open={showDetails}
                onClose={() => setShowDetails(false)}
            />
        </>
    );
};

export default MovieCard; 