export interface Movie {
    id: number;
    title: string;
    year: number | null;
    poster_url: string | null;
    overview: string | null;
    rating: number | null;
    status: 'Watched' | 'Watching' | 'Want to Watch';
    recommendation: string | null;
    created_at: string;
    updated_at: string;
    type: 'movie' | 'tv';
    tmdb_id?: number;
}

export interface TMDBMovie {
    id: number;
    title: string;
    year: string | null;
    poster_url: string | null;
    overview: string | null;
}

export interface MovieFormData {
    title: string;
    year: number | null;
    poster_url: string | null;
    overview: string | null;
    rating: number | null;
    status: 'Watched' | 'Watching' | 'Want to Watch';
    recommendation: string | null;
    type: 'movie' | 'tv';
    tmdb_id?: number;
} 