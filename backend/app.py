from flask import Flask, request, jsonify
from flask_mongoengine import MongoEngine
from flask_cors import CORS
from datetime import datetime
import os
import requests
from dotenv import load_dotenv
import logging
import random

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

app = Flask(__name__)
# Set Flask debug mode based on environment
app.config['DEBUG'] = os.getenv('FLASK_DEBUG', 'False').lower() == 'true'

# Enable CORS for all routes with more permissive settings
CORS(app, 
     resources={r"/*": {
         "origins": ["http://localhost:3000", "https://movies-observers.vercel.app"],
         "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
         "allow_headers": ["Content-Type", "Authorization"],
         "supports_credentials": True
     }})

# MongoDB configuration
app.config['MONGODB_SETTINGS'] = {
    'host': os.getenv('MONGODB_URI', 'mongodb+srv://oluwatobi0112:W3bD3v3lop3r_99*@movie-tracker.l9rhnfa.mongodb.net/?retryWrites=true&w=majority&appName=movie-tracker'),
    'db': 'movie-tracker',
    'alias': 'default',
    'connect': False  # Add this to prevent connection on startup
}

try:
    db = MongoEngine(app)
    logger.info("MongoDB connection initialized successfully")
except Exception as e:
    logger.error(f"Failed to initialize MongoDB connection: {str(e)}")
    raise

# TMDB API configuration
TMDB_API_KEY = os.getenv('TMDB_API_KEY')
TMDB_BASE_URL = 'https://api.themoviedb.org/3'

class Movie(db.Document):
    meta = {'collection': 'movies'}
    title = db.StringField(required=True)
    year = db.IntField()
    poster_url = db.StringField()
    overview = db.StringField()
    rating = db.IntField()
    review = db.StringField()
    status = db.StringField(default='Want to Watch')  # 'Watched', 'Watching', 'Want to Watch'
    recommendation = db.StringField()
    tmdb_id = db.IntField()  # Add TMDB ID field
    created_at = db.DateTimeField(default=datetime.utcnow)
    updated_at = db.DateTimeField(default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': str(self.id),
            'title': self.title,
            'year': self.year,
            'poster_url': self.poster_url,
            'overview': self.overview,
            'rating': self.rating,
            'review': self.review,
            'status': self.status,
            'recommendation': self.recommendation,
            'tmdb_id': self.tmdb_id,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

class TVShow(db.Document):
    meta = {'collection': 'tvshows'}
    title = db.StringField(required=True)
    year = db.IntField()
    poster_url = db.StringField()
    overview = db.StringField()
    rating = db.IntField()
    review = db.StringField()
    status = db.StringField(default='Want to Watch')  # 'Watched', 'Watching', 'Want to Watch'
    recommendation = db.StringField()
    tmdb_id = db.IntField()  # Add TMDB ID field
    created_at = db.DateTimeField(default=datetime.utcnow)
    updated_at = db.DateTimeField(default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': str(self.id),
            'title': self.title,
            'year': self.year,
            'poster_url': self.poster_url,
            'overview': self.overview,
            'rating': self.rating,
            'review': self.review,
            'status': self.status,
            'recommendation': self.recommendation,
            'tmdb_id': self.tmdb_id,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

@app.route('/')
def health_check():
    return jsonify({"message": "Movie Tracker API is running"})

@app.route('/api/tmdb/search', methods=['GET'])
def search_tmdb():
    query = request.args.get('query')
    if not query:
        return jsonify({'error': 'Query parameter is required'}), 400

    try:
        response = requests.get(
            f'{TMDB_BASE_URL}/search/movie',
            params={
                'api_key': TMDB_API_KEY,
                'query': query
            }
        )
        data = response.json()
        
        if data.get('results'):
            movie = data['results'][0]  # Get the first result
            return jsonify({
                'id': movie['id'],
                'title': movie['title'],
                'year': movie['release_date'][:4] if movie['release_date'] else None,
                'poster_url': f"https://image.tmdb.org/t/p/w500{movie['poster_path']}" if movie['poster_path'] else None,
                'overview': movie['overview'],
                'tmdb_id': movie['id']  # Add TMDB ID to response
            })
        return jsonify({'error': 'No results found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/movies', methods=['GET'])
def get_movies():
    try:
        logger.info("Fetching all movies from database")
        movies = Movie.objects.all()
        movie_list = [movie.to_dict() for movie in movies]
        logger.info(f"Found {len(movie_list)} movies")
        return jsonify(movie_list)
    except Exception as e:
        logger.error(f"Error fetching movies: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/test-db', methods=['GET'])
def test_db():
    try:
        logger.info("Testing database connection")
        # Try to fetch a document from your collection
        movie = Movie.objects.first()
        if movie:
            logger.info("Database connection successful, found a movie")
            return jsonify({"message": "Database connection successful", "movie": movie.to_dict()})
        else:
            logger.info("Database connected, but no movies found")
            return jsonify({"message": "Database connected, but no movies found"})
    except Exception as e:
        logger.error(f"Database connection error: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/movies', methods=['POST'])
def add_movie():
    data = request.json
    try:
        # Remove profile_id if present
        data.pop('profile_id', None)
        movie = Movie(
            title=data['title'],
            year=data.get('year'),
            poster_url=data.get('poster_url'),
            overview=data.get('overview'),
            rating=data.get('rating'),
            review=data.get('review'),
            status=data.get('status', 'Want to Watch'),
            recommendation=data.get('recommendation'),
            tmdb_id=data.get('tmdb_id')
        )
        movie.save()
        return jsonify(movie.to_dict()), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/movies/<id>', methods=['PUT'])
def update_movie(id):
    logger.info(f"Updating movie with id: {id}")
    movie = Movie.objects(id=id).first()
    if not movie:
        logger.error(f"Movie not found with id: {id}")
        return jsonify({'error': 'Movie not found'}), 404
    
    data = request.json
    # Remove profile_id if present
    data.pop('profile_id', None)
    logger.info(f"Update data received: {data}")
    try:
        # Fields that should not be updated
        protected_fields = {'id', 'created_at', 'updated_at'}
        
        for key, value in data.items():
            if key in protected_fields:
                logger.info(f"Skipping protected field: {key}")
                continue
                
            if hasattr(movie, key):
                logger.info(f"Updating field {key} with value {value}")
                setattr(movie, key, value)
            else:
                logger.warning(f"Ignoring unknown field: {key}")
        
        # Update the updated_at timestamp
        movie.updated_at = datetime.utcnow()
        movie.save()
        logger.info(f"Movie updated successfully: {movie.to_dict()}")
        return jsonify(movie.to_dict())
    except Exception as e:
        logger.error(f"Error updating movie: {str(e)}")
        return jsonify({'error': str(e)}), 400

@app.route('/api/movies/<id>', methods=['DELETE'])
def delete_movie(id):
    movie = Movie.objects(id=id).first()
    if not movie:
        return jsonify({'error': 'Movie not found'}), 404
    try:
        movie.delete()
        return '', 204
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/tmdb/recommendations', methods=['GET'])
def get_recommendations():
    try:
        # Get all movies from the user's watchlist
        movies = Movie.objects.all()
        if not movies:
            return jsonify({'error': 'No movies in watchlist to base recommendations on'}), 404
        
        # Get multiple random movies from the list (up to 3)
        num_movies = min(3, len(movies))
        random_movies = random.sample(list(movies), num_movies)
        
        all_recommendations = []
        seen_titles = set()  # To avoid duplicates
        
        for random_movie in random_movies:
            # Search TMDB for the movie to get its ID
            search_response = requests.get(
                f'{TMDB_BASE_URL}/search/movie',
                params={
                    'api_key': TMDB_API_KEY,
                    'query': random_movie.title
                }
            )
            search_data = search_response.json()
            
            if not search_data.get('results'):
                continue
                
            movie_id = search_data['results'][0]['id']
            
            # Get recommendations based on the movie
            recommendations_response = requests.get(
                f'{TMDB_BASE_URL}/movie/{movie_id}/recommendations',
                params={
                    'api_key': TMDB_API_KEY,
                    'page': random.randint(1, 3)  # Random page for more variety
                }
            )
            recommendations_data = recommendations_response.json()
            
            # Format the recommendations
            for movie in recommendations_data.get('results', []):
                if movie['title'] not in seen_titles:
                    seen_titles.add(movie['title'])
                    all_recommendations.append({
                        'title': movie['title'],
                        'year': movie['release_date'][:4] if movie['release_date'] else None,
                        'poster_url': f"https://image.tmdb.org/t/p/w500{movie['poster_path']}" if movie['poster_path'] else None,
                        'overview': movie['overview'],
                        'rating': round(movie['vote_average'] / 2)  # Convert 10-point scale to 5-point scale
                    })
        
        # Shuffle the recommendations and take top 10
        random.shuffle(all_recommendations)
        return jsonify(all_recommendations[:10])
    except Exception as e:
        logger.error(f"Error fetching recommendations: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/tmdb/search/tv', methods=['GET'])
def search_tmdb_tv():
    query = request.args.get('query')
    if not query:
        return jsonify({'error': 'Query parameter is required'}), 400

    try:
        response = requests.get(
            f'{TMDB_BASE_URL}/search/tv',
            params={
                'api_key': TMDB_API_KEY,
                'query': query
            }
        )
        data = response.json()
        
        if data.get('results'):
            show = data['results'][0]  # Get the first result
            return jsonify({
                'id': show['id'],
                'title': show['name'],
                'year': show['first_air_date'][:4] if show['first_air_date'] else None,
                'poster_url': f"https://image.tmdb.org/t/p/w500{show['poster_path']}" if show['poster_path'] else None,
                'overview': show['overview'],
                'tmdb_id': show['id']  # Add TMDB ID to response
            })
        return jsonify({'error': 'No results found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/tvshows', methods=['GET'])
def get_tvshows():
    try:
        logger.info("Fetching all TV shows from database")
        tvshows = TVShow.objects.all()
        logger.info(f"Query executed successfully, found {tvshows.count()} TV shows")
        
        tvshow_list = []
        for tvshow in tvshows:
            try:
                tvshow_dict = tvshow.to_dict()
                tvshow_list.append(tvshow_dict)
            except Exception as e:
                logger.error(f"Error converting TV show to dict: {str(e)}")
                continue
                
        logger.info(f"Successfully converted {len(tvshow_list)} TV shows to dict")
        return jsonify(tvshow_list)
    except Exception as e:
        logger.error(f"Error fetching TV shows: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/tvshows', methods=['POST'])
def add_tvshow():
    data = request.json
    try:
        # Remove profile_id if present
        data.pop('profile_id', None)
        tvshow = TVShow(
            title=data['title'],
            year=data.get('year'),
            poster_url=data.get('poster_url'),
            overview=data.get('overview'),
            rating=data.get('rating'),
            review=data.get('review'),
            status=data.get('status', 'Want to Watch'),
            recommendation=data.get('recommendation'),
            tmdb_id=data.get('tmdb_id')
        )
        tvshow.save()
        return jsonify(tvshow.to_dict()), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/tvshows/<tvshow_id>', methods=['PUT'])
def update_tvshow(tvshow_id):
    try:
        tvshow = TVShow.objects.get(id=tvshow_id)
        data = request.json
        # Remove profile_id if present
        data.pop('profile_id', None)
        tvshow.title = data.get('title', tvshow.title)
        tvshow.year = data.get('year', tvshow.year)
        tvshow.poster_url = data.get('poster_url', tvshow.poster_url)
        tvshow.overview = data.get('overview', tvshow.overview)
        tvshow.rating = data.get('rating', tvshow.rating)
        tvshow.review = data.get('review', tvshow.review)
        tvshow.status = data.get('status', tvshow.status)
        tvshow.recommendation = data.get('recommendation', tvshow.recommendation)
        tvshow.updated_at = datetime.utcnow()
        tvshow.save()
        return jsonify(tvshow.to_dict())
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/tvshows/<tvshow_id>', methods=['DELETE'])
def delete_tvshow(tvshow_id):
    try:
        tvshow = TVShow.objects.get(id=tvshow_id)
        tvshow.delete()
        return '', 204
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/tmdb/tv/recommendations', methods=['GET'])
def get_tv_recommendations():
    try:
        # Get all TV shows from the user's watchlist
        tvshows = TVShow.objects.all()
        if not tvshows:
            return jsonify({'error': 'No TV shows in watchlist to base recommendations on'}), 404
        
        # Get multiple random shows from the list (up to 3)
        num_shows = min(3, len(tvshows))
        random_shows = random.sample(list(tvshows), num_shows)
        
        all_recommendations = []
        seen_titles = set()  # To avoid duplicates
        
        for random_show in random_shows:
            # Search TMDB for the show to get its ID
            search_response = requests.get(
                f'{TMDB_BASE_URL}/search/tv',
                params={
                    'api_key': TMDB_API_KEY,
                    'query': random_show.title
                }
            )
            search_data = search_response.json()
            
            if not search_data.get('results'):
                continue
                
            show_id = search_data['results'][0]['id']
            
            # Get recommendations based on the show
            recommendations_response = requests.get(
                f'{TMDB_BASE_URL}/tv/{show_id}/recommendations',
                params={
                    'api_key': TMDB_API_KEY,
                    'page': random.randint(1, 3)  # Random page for more variety
                }
            )
            recommendations_data = recommendations_response.json()
            
            # Format the recommendations
            for show in recommendations_data.get('results', []):
                if show['name'] not in seen_titles:
                    seen_titles.add(show['name'])
                    all_recommendations.append({
                        'id': str(show['id']),  # Convert to string to match MongoDB ObjectId format
                        'title': show['name'],
                        'year': show['first_air_date'][:4] if show['first_air_date'] else None,
                        'poster_url': f"https://image.tmdb.org/t/p/w500{show['poster_path']}" if show['poster_path'] else None,
                        'overview': show['overview'],
                        'rating': round(show['vote_average'] / 2)  # Convert 10-point scale to 5-point scale
                    })
        
        # Shuffle the recommendations and take top 10
        random.shuffle(all_recommendations)
        return jsonify(all_recommendations[:10])
    except Exception as e:
        logger.error(f"Error fetching TV recommendations: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/tmdb/<type>/<id>/trailer', methods=['GET'])
def get_trailer(type, id):
    try:
        if type == 'movie':
            response = requests.get(
                f'{TMDB_BASE_URL}/movie/{id}/videos',
                params={
                    'api_key': TMDB_API_KEY
                }
            )
            data = response.json()
            
            if data.get('results'):
                # Find the first trailer
                trailer = next((video for video in data['results'] 
                              if video['type'] == 'Trailer' and video['site'] == 'YouTube'), None)
                if trailer:
                    return jsonify({
                        'key': trailer['key'],
                        'site': trailer['site']
                    })
            return jsonify({'error': 'No trailer found'}), 404

        elif type == 'tv':
            # First try to get the show's videos
            response = requests.get(
                f'{TMDB_BASE_URL}/tv/{id}/videos',
                params={
                    'api_key': TMDB_API_KEY
                }
            )
            data = response.json()
            
            if data.get('results'):
                # Find the first trailer
                trailer = next((video for video in data['results'] 
                              if video['type'] == 'Trailer' and video['site'] == 'YouTube'), None)
                if trailer:
                    return jsonify({
                        'key': trailer['key'],
                        'site': trailer['site']
                    })

            # If no show trailer found, try to get season 1 trailer
            season_response = requests.get(
                f'{TMDB_BASE_URL}/tv/{id}/season/1/videos',
                params={
                    'api_key': TMDB_API_KEY
                }
            )
            season_data = season_response.json()
            
            if season_data.get('results'):
                # Find the first trailer from season 1
                season_trailer = next((video for video in season_data['results'] 
                                    if video['type'] == 'Trailer' and video['site'] == 'YouTube'), None)
                if season_trailer:
                    return jsonify({
                        'key': season_trailer['key'],
                        'site': season_trailer['site']
                    })

            # If still no trailer found, try to get episode 1 trailer
            episode_response = requests.get(
                f'{TMDB_BASE_URL}/tv/{id}/season/1/episode/1/videos',
                params={
                    'api_key': TMDB_API_KEY
                }
            )
            episode_data = episode_response.json()
            
            if episode_data.get('results'):
                # Find the first trailer from episode 1
                episode_trailer = next((video for video in episode_data['results'] 
                                    if video['type'] == 'Trailer' and video['site'] == 'YouTube'), None)
                if episode_trailer:
                    return jsonify({
                        'key': episode_trailer['key'],
                        'site': episode_trailer['site']
                    })

            return jsonify({'error': 'No trailer found'}), 404
        else:
            return jsonify({'error': 'Invalid type. Must be "movie" or "tv"'}), 400

    except Exception as e:
        logger.error(f"Error fetching trailer: {str(e)}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True) 