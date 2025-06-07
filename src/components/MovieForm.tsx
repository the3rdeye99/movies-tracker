import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Box,
    Typography,
    CircularProgress,
    Rating,
    SelectChangeEvent,
    InputAdornment,
    IconButton,
} from '@mui/material';
import { Movie, MovieFormData } from '../types';
import { searchTMDB, addMovie } from '../services/api';
import SearchIcon from '@mui/icons-material/Search';

interface MovieFormProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (movieData: MovieFormData) => Promise<void>;
    initialData?: Movie;
    isEditing?: boolean;
    onMovieAdded: () => void;
}

const MovieForm: React.FC<MovieFormProps> = ({ 
    open, 
    onClose, 
    onSubmit, 
    initialData, 
    isEditing = false,
    onMovieAdded 
}) => {
    const [formData, setFormData] = useState<MovieFormData>({
        title: '',
        year: null,
        poster_url: null,
        overview: null,
        rating: null,
        status: 'Want to Watch',
        recommendation: '',
        type: 'movie',
        ...initialData,
    });

    const [isSearching, setIsSearching] = useState(false);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (e: SelectChangeEvent) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSearch = async () => {
        if (!formData.title || isEditing) return;

        setIsSearching(true);
        try {
            const tmdbData = await searchTMDB(formData.title);
            setFormData(prev => ({
                ...prev,
                title: tmdbData.title || prev.title,
                year: tmdbData.year ? parseInt(tmdbData.year) : null,
                poster_url: tmdbData.poster_url,
                overview: tmdbData.overview,
            }));
        } catch (error) {
            console.error('Error fetching TMDB data:', error);
        } finally {
            setIsSearching(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const movieData: MovieFormData = {
                title: formData.title,
                year: formData.year,
                rating: formData.rating,
                status: formData.status,
                overview: formData.overview,
                recommendation: formData.recommendation,
                poster_url: formData.poster_url,
                type: 'movie',
                tmdb_id: formData.tmdb_id
            };
            await onSubmit(movieData);
            onMovieAdded();
            onClose();
        } catch (error) {
            console.error('Error adding movie:', error);
        }
    };

    return (
        <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 600, mx: 'auto', p: 2 }}>
            <TextField
                fullWidth
                label="Movie Title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                margin="normal"
                disabled={isSearching || isEditing}
                InputProps={{
                    endAdornment: !isEditing && (
                        <InputAdornment position="end">
                            <IconButton
                                onClick={handleSearch}
                                disabled={isSearching || !formData.title}
                                edge="end"
                            >
                                {isSearching ? <CircularProgress size={20} /> : <SearchIcon />}
                            </IconButton>
                        </InputAdornment>
                    ),
                }}
            />

            {formData.poster_url && (
                <Box sx={{ mb: 2, textAlign: 'center' }}>
                    <img
                        src={formData.poster_url}
                        alt={formData.title}
                        style={{ maxWidth: '200px', maxHeight: '300px' }}
                    />
                </Box>
            )}

            <TextField
                fullWidth
                label="Year"
                name="year"
                type="number"
                value={formData.year || ''}
                onChange={handleInputChange}
                margin="normal"
            />

            <TextField
                fullWidth
                label="Overview"
                name="overview"
                multiline
                rows={4}
                value={formData.overview || ''}
                onChange={handleInputChange}
                margin="normal"
            />

            <Box sx={{ my: 2 }}>
                <Typography component="legend">Rating</Typography>
                <Rating
                    name="rating"
                    value={formData.rating || 0}
                    onChange={(_, value) => setFormData(prev => ({ ...prev, rating: value }))}
                />
            </Box>

            <TextField
                fullWidth
                label="Recommendation"
                name="recommendation"
                value={formData.recommendation || ''}
                onChange={handleInputChange}
                margin="normal"
            />

            <FormControl fullWidth margin="normal">
                <InputLabel>Status</InputLabel>
                <Select
                    name="status"
                    value={formData.status}
                    onChange={handleSelectChange}
                    label="Status"
                >
                    <MenuItem value="Want to Watch">Want to Watch</MenuItem>
                    <MenuItem value="Watching">Watching</MenuItem>
                    <MenuItem value="Watched">Watched</MenuItem>
                </Select>
            </FormControl>

            <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                sx={{ mt: 2 }}
            >
                {isEditing ? 'Update Movie' : 'Add Movie'}
            </Button>
        </Box>
    );
};

export default MovieForm; 