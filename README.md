# Movies & TV Shows Tracker

A modern web application for tracking and managing your favorite movies and TV shows. Built with React, TypeScript, and Material-UI, this application provides a seamless experience for discovering, tracking, and managing your entertainment content.

## Features

### Movies & TV Shows Management
- Add and track your favorite movies and TV shows
- Search and add content from TMDB (The Movie Database)
- Edit and delete entries
- View detailed information including ratings, status, and recommendations
- Responsive design for all devices

### Smart Recommendations
- Get personalized recommendations based on your watchlist
- Add recommended content directly to your list
- Real-time updates with optimistic UI
- Infinite scroll for browsing recommendations

### User Experience
- Modern Material-UI design
- Responsive layout for all screen sizes
- Immediate updates without page refresh
- Intuitive navigation between movies and TV shows
- Search functionality for quick access

## Tech Stack

- **Frontend**: React, TypeScript, Material-UI
- **Backend**: Python, Flask
- **Database**: SQLite
- **API Integration**: TMDB (The Movie Database)
- **State Management**: React Hooks
- **Styling**: Material-UI, CSS-in-JS

## Setup Instructions

1. Clone the repository:
   ```bash
   git clone https://github.com/the3rdeye99/movies-tracker.git
   cd movies-tracker
   ```

2. Install frontend dependencies:
   ```bash
   npm install
   ```

3. Install backend dependencies:
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

4. Set up environment variables:
   - Create a `.env` file in the root directory
   - Add your TMDB API key:
     ```
     REACT_APP_TMDB_API_KEY=your_api_key_here
     ```

5. Start the development servers:
   - Frontend (in the root directory):
     ```bash
     npm start
     ```
   - Backend (in the backend directory):
     ```bash
     python app.py
     ```

## Usage

1. **Adding Content**
   - Click the "Add Movie" or "Add TV Show" button
   - Search for content using the TMDB search
   - Fill in additional details
   - Save to add to your list

2. **Managing Content**
   - View your list of movies and TV shows
   - Edit details by clicking the edit icon
   - Delete entries using the delete icon
   - Mark items as watched/unwatched

3. **Getting Recommendations**
   - Navigate to the recommendations section
   - Browse through personalized suggestions
   - Add recommended content directly to your list
   - Infinite scroll for more recommendations

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [The Movie Database (TMDB)](https://www.themoviedb.org/) for providing the movie and TV show data
- [Material-UI](https://mui.com/) for the beautiful UI components
- [React](https://reactjs.org/) for the amazing frontend framework
