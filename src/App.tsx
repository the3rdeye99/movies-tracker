import React, { useState, useEffect } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { 
    Box, 
    AppBar, 
    Toolbar, 
    Typography, 
    Button, 
    Tabs, 
    Tab,
    IconButton,
    Menu,
    MenuItem,
    useMediaQuery,
    useTheme,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions
} from '@mui/material';
import { Add as AddIcon, Close as CloseIcon } from '@mui/icons-material';
import MenuIcon from '@mui/icons-material/Menu';
import Movies from './components/Movies';
import TVShows from './components/TVShows';
import MovieForm from './components/MovieForm';
import TVShowForm from './components/TVShowForm';
import { Movie, MovieFormData } from './types';
import { addMovie, addTVShow } from './services/api';

const darkTheme = createTheme({
    palette: {
        mode: 'dark',
    },
});

function App() {
    const [activeTab, setActiveTab] = useState(() => {
        const savedTab = localStorage.getItem('activeTab');
        return savedTab ? savedTab : 'movies';
    });
    const [isMovieFormOpen, setIsMovieFormOpen] = useState(false);
    const [isShowFormOpen, setIsShowFormOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    useEffect(() => {
        localStorage.setItem('activeTab', activeTab);
    }, [activeTab]);

    const handleTabChange = (_: React.SyntheticEvent, newValue: string) => {
        setActiveTab(newValue);
    };

    const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleMenuItemClick = (index: string) => {
        setActiveTab(index);
        handleMenuClose();
    };

    const handleAddMovie = async (movieData: MovieFormData) => {
        try {
            await addMovie(movieData);
            setIsMovieFormOpen(false);
        } catch (error) {
            console.error('Error adding movie:', error);
        }
    };

    const handleAddShow = async (showData: MovieFormData) => {
        try {
            await addTVShow(showData);
            setIsShowFormOpen(false);
        } catch (error) {
            console.error('Error adding TV show:', error);
        }
    };

    return (
        <ThemeProvider theme={darkTheme}>
            <CssBaseline />
            <Box sx={{ flexGrow: 1 }}>
                <AppBar position="static" sx={{ bgcolor: 'background.paper', color: 'text.primary' }}>
                    <Toolbar>
                        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                            Movies Tracker
                        </Typography>
                        
                        {isMobile ? (
                            <>
                                <IconButton
                                    size="large"
                                    edge="end"
                                    color="inherit"
                                    aria-label="menu"
                                    onClick={handleMenuClick}
                                    sx={{ mr: 1 }}
                                >
                                    <MenuIcon />
                                </IconButton>
                                <Menu
                                    anchorEl={anchorEl}
                                    open={Boolean(anchorEl)}
                                    onClose={handleMenuClose}
                                >
                                    <MenuItem 
                                        onClick={() => handleMenuItemClick('movies')}
                                        selected={activeTab === 'movies'}
                                    >
                                        Movies
                                    </MenuItem>
                                    <MenuItem 
                                        onClick={() => handleMenuItemClick('tvshows')}
                                        selected={activeTab === 'tvshows'}
                                    >
                                        TV Shows
                                    </MenuItem>
                                </Menu>
                            </>
                        ) : (
                            <Tabs value={activeTab} onChange={handleTabChange} sx={{ mr: 2 }}>
                                <Tab label="Movies" value="movies" />
                                <Tab label="TV Shows" value="tvshows" />
                            </Tabs>
                        )}

                        {activeTab === 'movies' ? (
                            isMobile ? (
                                <IconButton
                                    color="primary"
                                    onClick={() => setIsMovieFormOpen(true)}
                                    sx={{ 
                                        bgcolor: 'primary.main',
                                        color: 'white',
                                        '&:hover': { bgcolor: 'primary.dark' }
                                    }}
                                >
                                    <AddIcon />
                                </IconButton>
                            ) : (
                                <Button
                                    variant="contained"
                                    color="primary"
                                    startIcon={<AddIcon />}
                                    onClick={() => setIsMovieFormOpen(true)}
                                >
                                    Add Movie
                                </Button>
                            )
                        ) : (
                            isMobile ? (
                                <IconButton
                                    color="primary"
                                    onClick={() => setIsShowFormOpen(true)}
                                    sx={{ 
                                        bgcolor: 'primary.main',
                                        color: 'white',
                                        '&:hover': { bgcolor: 'primary.dark' }
                                    }}
                                >
                                    <AddIcon />
                                </IconButton>
                            ) : (
                                <Button
                                    variant="contained"
                                    startIcon={<AddIcon />}
                                    onClick={() => setIsShowFormOpen(true)}
                                    sx={{ ml: 2 }}
                                >
                                    Add TV Show
                                </Button>
                            )
                        )}
                    </Toolbar>
                </AppBar>
                <Box sx={{ p: 3 }}>
                    {activeTab === 'movies' ? (
                        <Movies
                            isFormOpen={isMovieFormOpen}
                            onFormClose={() => setIsMovieFormOpen(false)}
                        />
                    ) : (
                        <TVShows />
                    )}
                </Box>
            </Box>

            <Dialog
                open={isMovieFormOpen}
                onClose={() => setIsMovieFormOpen(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>
                    Add Movie
                    <IconButton
                        aria-label="close"
                        onClick={() => setIsMovieFormOpen(false)}
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
                        open={isMovieFormOpen}
                        onClose={() => setIsMovieFormOpen(false)}
                        onSubmit={handleAddMovie}
                        onMovieAdded={() => setIsMovieFormOpen(false)}
                    />
                </DialogContent>
            </Dialog>

            <Dialog
                open={isShowFormOpen}
                onClose={() => setIsShowFormOpen(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>
                    Add TV Show
                    <IconButton
                        aria-label="close"
                        onClick={() => setIsShowFormOpen(false)}
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
                        open={isShowFormOpen}
                        onClose={() => setIsShowFormOpen(false)}
                        onSubmit={handleAddShow}
                        onShowAdded={() => setIsShowFormOpen(false)}
                    />
                </DialogContent>
            </Dialog>
        </ThemeProvider>
    );
}

export default App;
