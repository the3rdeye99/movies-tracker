import React, { useState, useEffect } from 'react';
import { Box, Typography, Dialog, DialogTitle, DialogContent, IconButton } from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import MovieList from './MovieList';
import MovieForm from './MovieForm';
import SearchComponent from './SearchComponent';
import CategoryFilter from './CategoryFilter';
import { Movie, MovieFormData } from '../types';
import { getMovies, addMovie, updateMovie, deleteMovie } from '../services/api';
import RecommendedMovies from './RecommendedMovies';

interface MoviesProps {
    isFormOpen: boolean;
    onFormClose: () => void;
    onMovieAdded?: () => void;
}

const Movies: React.FC<MoviesProps> = ({ isFormOpen, onFormClose, onMovieAdded }) => {
    const [movies, setMovies] = useState<Movie[]>([]);
    const [filteredMovies, setFilteredMovies] = useState<Movie[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [isEditFormOpen, setIsEditFormOpen] = useState(false);
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success' as 'success' | 'error'
    });

    const fetchMovies = async () => {
        try {
            setLoading(true);
            const data = await getMovies();
            setMovies(data);
            setFilteredMovies(data);
            setError(null);
        } catch (err) {
            setError('Failed to fetch movies');
            console.error('Error fetching movies:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMovies();
    }, []);

    // Add event listener for movie added
    useEffect(() => {
        const handleMovieAdded = () => {
            fetchMovies();
        };

        window.addEventListener('movie-added', handleMovieAdded);
        return () => {
            window.removeEventListener('movie-added', handleMovieAdded);
        };
    }, []);

    const handleSearch = (query: string) => {
        setSearchQuery(query);
        filterMovies(query, selectedCategory);
    };

    const handleCategoryChange = (category: string) => {
        setSelectedCategory(category);
        filterMovies(searchQuery, category);
    };

    const filterMovies = (query: string, category: string) => {
        let filtered = movies;

        // Apply search filter
        if (query.trim()) {
            filtered = filtered.filter(movie =>
            movie.title.toLowerCase().includes(query.toLowerCase())
        );
        }

        // Apply category filter
        if (category !== 'all') {
            filtered = filtered.filter(movie => movie.status === category);
        }

        setFilteredMovies(filtered);
    };

    const handleEdit = (movie: Movie) => {
        setSelectedMovie(movie);
        setIsEditFormOpen(true);
    };

    const handleEditFormClose = () => {
        setIsEditFormOpen(false);
        setSelectedMovie(null);
    };

    const handleDelete = async (id: number) => {
        try {
            await deleteMovie(id);
            await fetchMovies();
            setSnackbar({
                open: true,
                message: 'Movie deleted successfully!',
                severity: 'success'
            });
        } catch (err) {
            console.error('Error deleting movie:', err);
            setSnackbar({
                open: true,
                message: 'Failed to delete movie. Please try again.',
                severity: 'error'
            });
        }
    };

    const handleFormSubmit = async (movieData: MovieFormData) => {
        try {
            if (selectedMovie) {
                await updateMovie(selectedMovie.id, movieData);
                setSnackbar({
                    open: true,
                    message: 'Movie updated successfully!',
                    severity: 'success'
                });
            } else {
                await addMovie(movieData);
                setSnackbar({
                    open: true,
                    message: 'Movie added successfully!',
                    severity: 'success'
                });
            }
            await fetchMovies();
            onFormClose();
            setSelectedMovie(null);
            if (onMovieAdded) {
                onMovieAdded();
            }
        } catch (err) {
            console.error('Error submitting movie:', err);
            setSnackbar({
                open: true,
                message: 'Failed to submit movie. Please try again.',
                severity: 'error'
            });
        }
    };

    const handleMovieClick = (movie: Movie) => {
        setSelectedMovie(movie);
        setIsDetailsOpen(true);
    };

    const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <Typography>Loading movies...</Typography>
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
            <Box sx={{ position: 'sticky', top: 0, zIndex: 10, bgcolor: 'background.paper', pb: 2 }}>
            <SearchComponent onSearch={handleSearch} />
                <CategoryFilter
                    selectedCategory={selectedCategory}
                    onCategoryChange={handleCategoryChange}
                />
            </Box>
            <MovieList
                movies={filteredMovies}
                onEdit={handleEdit}
                onDelete={handleDelete}
            />
            <RecommendedMovies onMovieAdded={() => {
                fetchMovies();
                if (onMovieAdded) {
                    onMovieAdded();
                }
            }} />
            <Dialog
                open={isFormOpen}
                onClose={onFormClose}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>
                    {selectedMovie ? 'Edit Movie' : 'Add Movie'}
                    <IconButton
                        onClick={onFormClose}
                        sx={{ position: 'absolute', right: 8, top: 8 }}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    <MovieForm
                        open={isFormOpen}
                        onClose={onFormClose}
                        onSubmit={handleFormSubmit}
                        initialData={selectedMovie || undefined}
                        isEditing={!!selectedMovie}
                        onMovieAdded={() => {
                            fetchMovies();
                            if (onMovieAdded) {
                                onMovieAdded();
                            }
                        }}
                    />
                </DialogContent>
            </Dialog>

            <Dialog
                open={isEditFormOpen}
                onClose={handleEditFormClose}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>
                    Edit Movie
                    <IconButton
                        onClick={handleEditFormClose}
                        sx={{ position: 'absolute', right: 8, top: 8 }}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    <MovieForm
                        open={isEditFormOpen}
                        onClose={handleEditFormClose}
                        onSubmit={handleFormSubmit}
                        initialData={selectedMovie || undefined}
                        isEditing={true}
                        onMovieAdded={() => {
                            fetchMovies();
                            handleEditFormClose();
                            if (onMovieAdded) {
                                onMovieAdded();
                            }
                        }}
                    />
                </DialogContent>
            </Dialog>
        </Box>
    );
};

export default Movies; 