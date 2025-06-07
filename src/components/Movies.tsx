import React, { useState, useEffect } from 'react';
import { Box, Typography, Dialog, DialogTitle, DialogContent, IconButton } from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import MovieList from './MovieList';
import MovieForm from './MovieForm';
import SearchComponent from './SearchComponent';
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
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [editingMovie, setEditingMovie] = useState<Movie | null>(null);

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

    const handleSearch = (query: string) => {
        if (!query.trim()) {
            setFilteredMovies(movies);
            return;
        }
        const searchTerm = query.toLowerCase();
        const filtered = movies.filter(movie => 
            movie.title.toLowerCase().includes(searchTerm)
        );
        setFilteredMovies(filtered);
    };

    const handleAddMovie = async (movieData: MovieFormData) => {
        try {
            await addMovie(movieData);
            fetchMovies();
            onFormClose();
            if (onMovieAdded) {
                onMovieAdded();
            }
        } catch (error) {
            console.error('Error adding movie:', error);
        }
    };

    const handleEditMovie = async (movieData: MovieFormData) => {
        if (!editingMovie) return;
        try {
            await updateMovie(editingMovie.id, movieData);
            fetchMovies();
            setEditingMovie(null);
            onFormClose();
            if (onMovieAdded) {
                onMovieAdded();
            }
        } catch (error) {
            console.error('Error updating movie:', error);
        }
    };

    const handleDeleteMovie = async (id: number) => {
        try {
            await deleteMovie(id);
            fetchMovies();
            if (onMovieAdded) {
                onMovieAdded();
            }
        } catch (error) {
            console.error('Error deleting movie:', error);
        }
    };

    const handleFormClose = () => {
        onFormClose();
        setEditingMovie(null);
    };

    if (loading) {
        return (
            <Box sx={{ p: 4, textAlign: 'center' }}>
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
        <Box sx={{ p: 3 }}>
            <SearchComponent onSearch={handleSearch} />
            {filteredMovies.length === 0 ? (
                <Box sx={{ p: 4, textAlign: 'center' }}>
                    <Typography>No movies found. Add your first movie!</Typography>
                </Box>
            ) : (
                <MovieList
                    movies={filteredMovies}
                    onEdit={(movie) => {
                        setEditingMovie(movie);
                        onFormClose();
                    }}
                    onDelete={handleDeleteMovie}
                />
            )}
            <RecommendedMovies onMovieAdded={fetchMovies} />
            <Dialog 
                open={isFormOpen || editingMovie !== null} 
                onClose={handleFormClose}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>
                    {editingMovie ? 'Update Movie' : 'Add Movie'}
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
                    <MovieForm
                        open={isFormOpen || editingMovie !== null}
                        onClose={handleFormClose}
                        onSubmit={editingMovie ? handleEditMovie : handleAddMovie}
                        initialData={editingMovie || undefined}
                        isEditing={!!editingMovie}
                        onMovieAdded={fetchMovies}
                    />
                </DialogContent>
            </Dialog>
        </Box>
    );
};

export default Movies; 