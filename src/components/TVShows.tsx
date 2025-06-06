import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    IconButton,
    Box,
    Typography,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import MovieList from './MovieList';
import TVShowForm from './TVShowForm';
import { Movie } from '../types';
import { getTVShows, addTVShow, updateTVShow, deleteTVShow } from '../services/api';
import RecommendedTVShows from './RecommendedTVShows';

interface TVShowsProps {
    isFormOpen: boolean;
    onFormClose: () => void;
}

const TVShows: React.FC<TVShowsProps> = ({ isFormOpen, onFormClose }) => {
    const [shows, setShows] = useState<Movie[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [editingShow, setEditingShow] = useState<Movie | null>(null);

    const fetchShows = async () => {
        try {
            setLoading(true);
            const data = await getTVShows();
            setShows(data);
            setError(null);
        } catch (err) {
            setError('Failed to fetch TV shows');
            console.error('Error fetching TV shows:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchShows();
    }, []);

    const handleAddShow = async (showData: any) => {
        try {
            await addTVShow(showData);
            fetchShows();
            onFormClose();
        } catch (error) {
            console.error('Error adding TV show:', error);
        }
    };

    const handleEditShow = async (showData: any) => {
        if (!editingShow) return;
        try {
            await updateTVShow(editingShow.id, showData);
            setEditingShow(null);
            onFormClose();
            fetchShows();
        } catch (error) {
            console.error('Error updating TV show:', error);
        }
    };

    const handleDeleteShow = async (id: number) => {
        try {
            await deleteTVShow(id);
            fetchShows();
        } catch (error) {
            console.error('Error deleting TV show:', error);
        }
    };

    const handleFormClose = () => {
        setEditingShow(null);
        onFormClose();
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <Typography>Loading TV shows...</Typography>
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

    return (
        <Box>
            {shows.length === 0 ? (
                <Box sx={{ p: 4, textAlign: 'center' }}>
                    <Typography>No TV shows added yet. Add your first show!</Typography>
                </Box>
            ) : (
                <MovieList
                    movies={shows}
                    onEdit={(show) => {
                        setEditingShow(show);
                        onFormClose();
                    }}
                    onDelete={handleDeleteShow}
                />
            )}
            <RecommendedTVShows onShowAdded={fetchShows} />
            <Dialog
                open={isFormOpen || editingShow !== null}
                onClose={handleFormClose}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>
                    {editingShow ? 'Edit TV Show' : 'Add New TV Show'}
                    <IconButton
                        aria-label="close"
                        onClick={handleFormClose}
                        sx={{
                            position: 'absolute',
                            right: 8,
                            top: 8,
                        }}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    <TVShowForm
                        onSubmit={editingShow ? handleEditShow : handleAddShow}
                        initialData={editingShow || undefined}
                        isEditing={!!editingShow}
                    />
                </DialogContent>
            </Dialog>
        </Box>
    );
};

export default TVShows; 