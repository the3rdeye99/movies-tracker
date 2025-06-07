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
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import { Movie } from '../types';
import TVShowDetails from './TVShowDetails';

interface TVShowCardProps {
    show: Movie;
    onEdit: (show: Movie) => void;
    onDelete: (id: number) => void;
    isRecommended?: boolean;
    onShowClick?: (show: Movie) => void;
}

const TVShowCard: React.FC<TVShowCardProps> = ({ 
    show, 
    onEdit, 
    onDelete, 
    isRecommended = false,
    onShowClick 
}) => {
    const [showDetails, setShowDetails] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

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
        // Prevent opening details when clicking action buttons or their children
        if ((e.target as HTMLElement).closest('.action-buttons') || 
            (e.target as HTMLElement).closest('.MuiIconButton-root')) {
            return;
        }
        if (onShowClick) {
            onShowClick(show);
        } else {
            setShowDetails(true);
        }
    };

    const handleDeleteClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setShowDeleteConfirm(true);
    };

    const handleEditClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        onEdit(show);
    };

    const handleConfirmDelete = () => {
        onDelete(show.id);
        setShowDeleteConfirm(false);
    };

    const handleCancelDelete = () => {
        setShowDeleteConfirm(false);
    };

    const handleDetailsClose = () => {
        setShowDetails(false);
    };

    return (
        <>
            <Card 
                sx={{ 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column',
                    width: '100%',
                    maxWidth: { xs: '100%', sm: '400px' },
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
                {show.poster_url ? (
                    <Box sx={{ 
                        height: { xs: 'auto', sm: 500 },
                        aspectRatio: { xs: '2/3', sm: 'auto' }
                    }}>
                        <CardMedia
                            component="img"
                            height="100%"
                            image={show.poster_url}
                            alt={show.title}
                            sx={{ objectFit: 'cover' }}
                        />
                    </Box>
                ) : (
                    <Box
                        sx={{
                            height: { xs: 'auto', sm: 500 },
                            aspectRatio: { xs: '2/3', sm: 'auto' },
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
                    p: { xs: 2, sm: 3 },
                    minHeight: { xs: 'auto', sm: '160px' }
                }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                        <Typography variant="h6" component="div" sx={{ 
                            fontSize: { xs: '1.1rem', sm: '1.4rem' },
                            fontWeight: 'bold',
                            height: { xs: 'auto', sm: '2.4em' },
                            overflow: 'hidden',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            flex: 1,
                            mr: 1,
                            lineHeight: '1.2em'
                        }}>
                            {show.title}
                        </Typography>
                        <Box className="action-buttons" sx={{ display: 'flex', gap: 0.5, flexShrink: 0 }}>
                            {isRecommended ? (
                                <IconButton 
                                    size="small" 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onEdit(show);
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
                                        onClick={handleEditClick}
                                    >
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton 
                                        size="small" 
                                        onClick={handleDeleteClick}
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                </>
                            )}
                        </Box>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Rating value={show.rating || 0} readOnly size="medium" />
                        {show.year && (
                            <Typography variant="body1" color="text.secondary" sx={{ ml: 1 }}>
                                ({show.year})
                            </Typography>
                        )}
                    </Box>

                    {show.status && !isRecommended && (
                        <Chip 
                            label={show.status} 
                            size="small" 
                            color={getStatusColor(show.status)}
                            sx={{ mb: 1 }}
                        />
                    )}
                </CardContent>
            </Card>
            <TVShowDetails
                show={show}
                open={showDetails}
                onClose={handleDetailsClose}
            />
            <Dialog
                open={showDeleteConfirm}
                onClose={handleCancelDelete}
                aria-labelledby="delete-dialog-title"
            >
                <DialogTitle id="delete-dialog-title">
                    Delete TV Show
                </DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to delete "{show.title}"? This action cannot be undone.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCancelDelete} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={handleConfirmDelete} color="error" variant="contained">
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default TVShowCard; 