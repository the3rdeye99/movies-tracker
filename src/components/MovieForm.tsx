import React, { useState, useEffect } from 'react';
import {
    Box,
    TextField,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Rating,
    Typography,
    CircularProgress,
    SelectChangeEvent,
} from '@mui/material';
import { MovieFormData, TMDBMovie } from '../types';
import { searchTMDB } from '../services/api';

interface MovieFormProps {
    onSubmit: (data: MovieFormData) => void;
    initialData?: MovieFormData;
    isEditing?: boolean;
}

const MovieForm: React.FC<MovieFormProps> = ({ onSubmit, initialData, isEditing = false }) => {
    const [formData, setFormData] = useState<MovieFormData>({
        title: '',
        year: null,
        poster_url: null,
        overview: null,
        rating: null,
        review: null,
        status: 'Want to Watch',
        recommendation: '',
        ...initialData,
    });

    const [isSearching, setIsSearching] = useState(false);
    const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

    useEffect(() => {
        return () => {
            if (searchTimeout) {
                clearTimeout(searchTimeout);
            }
        };
    }, [searchTimeout]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        if (name === 'title' && !isEditing) {
            if (searchTimeout) {
                clearTimeout(searchTimeout);
            }

            const timeout = setTimeout(async () => {
                if (value) {
                    setIsSearching(true);
                    try {
                        const tmdbData = await searchTMDB(value);
                        setFormData(prev => ({
                            ...prev,
                            year: tmdbData.year ? parseInt(tmdbData.year) : null,
                            poster_url: tmdbData.poster_url,
                            overview: tmdbData.overview,
                        }));
                    } catch (error) {
                        console.error('Error fetching TMDB data:', error);
                    } finally {
                        setIsSearching(false);
                    }
                }
            }, 500);

            setSearchTimeout(timeout);
        }
    };

    const handleSelectChange = (e: SelectChangeEvent) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
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
                disabled={isSearching}
            />

            {isSearching && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <CircularProgress size={20} />
                    <Typography>Searching TMDB...</Typography>
                </Box>
            )}

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
                label="Review"
                name="review"
                multiline
                rows={4}
                value={formData.review || ''}
                onChange={handleInputChange}
                margin="normal"
            />

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