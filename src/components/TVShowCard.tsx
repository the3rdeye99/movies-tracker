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
                    maxWidth: { xs: '280px', sm: '400px' },
                    margin: '0 auto',
                    transition: 'transform 0.2s ease-in-out',
                    cursor: 'pointer',
                    aspectRatio: '3/4',
                    '&:hover': {
                        transform: 'scale(1.02)',
                        boxShadow: 3
                    }
                }}
                onClick={handleCardClick}
            >
                {show.poster_url ? (
                    <Box sx={{ 
                        width: '100%',
                        height: '75%',
                        position: 'relative',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <CardMedia
                            component="img"
                            image={show.poster_url}
                            alt={show.title}
                            sx={{ 
                                width: '100%',
                                height: '100%',
                                objectFit: 'fill'
                            }}
                        />
                    </Box>
                ) : (
                    <Box
                        sx={{
                            width: '100%',
                            height: '75%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            bgcolor: 'grey.200',
                        }}
                    >
                        <Typography variant="h6" color="text.secondary" sx={{ fontSize: { xs: '0.9rem', sm: '1.25rem' } }}>
                            No Image Available
                        </Typography>
                    </Box>
                )}
                <CardContent sx={{ 
                    flexGrow: 1, 
                    position: 'relative', 
                    display: 'flex', 
                    flexDirection: 'column',
                    p: { xs: 0.75, sm: 1.5 },
                    height: '25%'
                }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.5 }}>
                        <Typography variant="subtitle1" component="div" sx={{ 
                            fontSize: { xs: '0.9rem', sm: '1rem' },
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
                                        '&:hover': { bgcolor: 'primary.dark' },
                                        width: { xs: '28px', sm: '24px' },
                                        height: { xs: '28px', sm: '24px' }
                                    }}
                                >
                                    <AddIcon sx={{ fontSize: { xs: '1.1rem', sm: '1rem' } }} />
                                </IconButton>
                            ) : (
                                <>
                                    <IconButton 
                                        size="small" 
                                        onClick={handleEditClick}
                                        sx={{ width: { xs: '28px', sm: '24px' }, height: { xs: '28px', sm: '24px' } }}
                                    >
                                        <EditIcon sx={{ fontSize: { xs: '1.1rem', sm: '1rem' } }} />
                                    </IconButton>
                                    <IconButton 
                                        size="small" 
                                        onClick={handleDeleteClick}
                                        sx={{ width: { xs: '28px', sm: '24px' }, height: { xs: '28px', sm: '24px' } }}
                                    >
                                        <DeleteIcon sx={{ fontSize: { xs: '1.1rem', sm: '1rem' } }} />
                                    </IconButton>
                                </>
                            )}
                        </Box>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Rating value={show.rating || 0} readOnly size="small" sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }} />
                            {show.year && (
                                <Typography variant="body2" color="text.secondary" sx={{ ml: 0.5, fontSize: { xs: '0.8rem', sm: '0.8rem' } }}>
                                    ({show.year})
                                </Typography>
                            )}
                        </Box>
                        {show.status && !isRecommended && (
                            <Chip 
                                label={show.status} 
                                size="small" 
                                color={getStatusColor(show.status)}
                                sx={{ 
                                    height: { xs: '20px', sm: '20px' },
                                    '& .MuiChip-label': {
                                        fontSize: { xs: '0.7rem', sm: '0.7rem' },
                                        px: 1
                                    }
                                }}
                            />
                        )}
                    </Box>
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