import axios from 'axios';
import { Movie, MovieFormData, TMDBMovie } from '../types';

// Use localhost for development, production URL for production
const API_URL = process.env.NODE_ENV === 'development' 
    ? 'http://localhost:5000'
    : 'https://movietracker-backend.vercel.app';

console.log('Current API URL:', API_URL);

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true
});

// Add request interceptor for debugging
api.interceptors.request.use(request => {
    console.log('Starting Request:', request);
    return request;
});

// Add response interceptor for debugging
api.interceptors.response.use(
    response => {
        console.log('Response:', response);
        return response;
    },
    error => {
        console.error('Response Error:', error);
        return Promise.reject(error);
    }
);

export const searchTMDB = async (query: string): Promise<TMDBMovie> => {
    const response = await api.get(`/api/tmdb/search?query=${encodeURIComponent(query)}`);
    return response.data;
};

export const getMovies = async (): Promise<Movie[]> => {
    console.log('Fetching movies from:', `${API_URL}/api/movies`);
    try {
        const response = await api.get('/api/movies');
        console.log('Movies fetched successfully:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error fetching movies:', error);
        throw error;
    }
};

export const addMovie = async (movieData: MovieFormData): Promise<Movie> => {
    console.log('Adding movie:', movieData);
    try {
        const response = await api.post('/api/movies', movieData);
        console.log('Movie added successfully:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error adding movie:', error);
        throw error;
    }
};

export const updateMovie = async (id: number, movieData: Partial<MovieFormData>): Promise<Movie> => {
    const response = await api.put(`/api/movies/${id}`, movieData);
    return response.data;
};

export const deleteMovie = async (id: number): Promise<void> => {
    await api.delete(`/api/movies/${id}`);
};

export const getRecommendedMovies = async (): Promise<Movie[]> => {
    try {
        const response = await api.get('/api/tmdb/recommendations');
        return response.data;
    } catch (error) {
        console.error('Error fetching recommended movies:', error);
        throw error;
    }
};

export const searchTMDBTV = async (query: string): Promise<TMDBMovie> => {
    const response = await api.get(`/api/tmdb/search/tv?query=${encodeURIComponent(query)}`);
    return response.data;
};

export const getTVShows = async (): Promise<Movie[]> => {
    console.log('Fetching TV shows from:', `${API_URL}/api/tvshows`);
    try {
        const response = await api.get('/api/tvshows');
        console.log('TV shows fetched successfully:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error fetching TV shows:', error);
        throw error;
    }
};

export const addTVShow = async (tvshowData: MovieFormData): Promise<Movie> => {
    try {
        const response = await api.post('/api/tvshows', tvshowData);
        return response.data;
    } catch (error) {
        console.error('Error adding TV show:', error);
        throw error;
    }
};

export const updateTVShow = async (id: number, tvshowData: MovieFormData): Promise<Movie> => {
    try {
        const response = await api.put(`/api/tvshows/${id}`, tvshowData);
        return response.data;
    } catch (error) {
        console.error('Error updating TV show:', error);
        throw error;
    }
};

export const deleteTVShow = async (id: number): Promise<void> => {
    try {
        await api.delete(`/api/tvshows/${id}`);
    } catch (error) {
        console.error('Error deleting TV show:', error);
        throw error;
    }
};

export const getRecommendedTVShows = async (): Promise<Movie[]> => {
    try {
        const response = await axios.get(`${API_URL}/api/tmdb/tv/recommendations`);
        return response.data;
    } catch (error) {
        console.error('Error fetching recommended TV shows:', error);
        return [];
    }
}; 