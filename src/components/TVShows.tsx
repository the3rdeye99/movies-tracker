import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    IconButton,
    Box,
    Typography,
    Button,
    Snackbar,
    Alert,
} from '@mui/material';
import { Close as CloseIcon, Add as AddIcon } from '@mui/icons-material';
import TVShowList from './TVShowList';
import TVShowForm from './TVShowForm';
import TVShowDetails from './TVShowDetails';
import SearchComponent from './SearchComponent';
import { Movie, MovieFormData } from '../types';
import { getTVShows, addTVShow, updateTVShow, deleteTVShow } from '../services/api';
import RecommendedTVShows from './RecommendedTVShows';

const TVShows: React.FC = () => {
    const [shows, setShows] = useState<Movie[]>([]);
    const [filteredShows, setFilteredShows] = useState<Movie[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedShow, setSelectedShow] = useState<Movie | null>(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success' as 'success' | 'error'
    });

    const fetchShows = async () => {
        try {
            setLoading(true);
            const data = await getTVShows();
            setShows(data);
            setFilteredShows(data);
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

    // Add event listener for TV show added
    useEffect(() => {
        const handleTVShowAdded = () => {
            fetchShows();
        };

        window.addEventListener('tvshow-added', handleTVShowAdded);
        return () => {
            window.removeEventListener('tvshow-added', handleTVShowAdded);
        };
    }, []);

    const handleSearch = (query: string) => {
        if (!query.trim()) {
            setFilteredShows(shows);
            return;
        }
        const filtered = shows.filter(show =>
            show.title.toLowerCase().includes(query.toLowerCase())
        );
        setFilteredShows(filtered);
    };

    const handleAdd = () => {
        setSelectedShow(null);
        setIsFormOpen(true);
    };

    const handleEdit = (show: Movie) => {
        setSelectedShow(show);
        setIsFormOpen(true);
    };

    const handleDelete = async (id: number) => {
        try {
            await deleteTVShow(id);
            await fetchShows();
            setSnackbar({
                open: true,
                message: 'TV show deleted successfully!',
                severity: 'success'
            });
        } catch (err) {
            console.error('Error deleting TV show:', err);
            setSnackbar({
                open: true,
                message: 'Failed to delete TV show. Please try again.',
                severity: 'error'
            });
        }
    };

    const handleFormSubmit = async (showData: MovieFormData) => {
        try {
            if (selectedShow) {
                await updateTVShow(selectedShow.id, showData);
                setSnackbar({
                    open: true,
                    message: 'TV show updated successfully!',
                    severity: 'success'
                });
            } else {
                await addTVShow(showData);
                setSnackbar({
                    open: true,
                    message: 'TV show added successfully!',
                    severity: 'success'
                });
            }
            await fetchShows();
            setIsFormOpen(false);
            setSelectedShow(null);
        } catch (err) {
            console.error('Error submitting TV show:', err);
            setSnackbar({
                open: true,
                message: 'Failed to submit TV show. Please try again.',
                severity: 'error'
            });
        }
    };

    const handleShowClick = (show: Movie) => {
        setSelectedShow(show);
        setIsDetailsOpen(true);
    };

    const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, open: false });
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
        <Box sx={{ p: { xs: 0, sm: 3 } }}>
            <SearchComponent onSearch={handleSearch} />
            {filteredShows.length === 0 ? (
                <Typography align="center" color="white" sx={{ mt: 4 }}>
                    No TV shows found. Add your first show!
                </Typography>
            ) : (
                <TVShowList
                    shows={filteredShows}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onShowClick={handleShowClick}
                />
            )}
            <RecommendedTVShows onShowAdded={fetchShows} />

            <Dialog
                open={isFormOpen || selectedShow !== null}
                onClose={() => {
                    setIsFormOpen(false);
                    setSelectedShow(null);
                }}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>
                    {selectedShow ? 'Update TV Show' : 'Add TV Show'}
                    <IconButton
                        aria-label="close"
                        onClick={() => {
                            setIsFormOpen(false);
                            setSelectedShow(null);
                        }}
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
                        open={isFormOpen || selectedShow !== null}
                        onClose={() => {
                            setIsFormOpen(false);
                            setSelectedShow(null);
                        }}
                        onSubmit={handleFormSubmit}
                        initialData={selectedShow || undefined}
                        isEditing={!!selectedShow}
                        onShowAdded={fetchShows}
                    />
                </DialogContent>
            </Dialog>

            {selectedShow && (
                <TVShowDetails
                    show={selectedShow}
                    open={isDetailsOpen}
                    onClose={() => setIsDetailsOpen(false)}
                />
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

export default TVShows; 