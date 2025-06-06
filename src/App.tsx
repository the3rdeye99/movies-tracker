import React, { useState } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box, AppBar, Toolbar, Typography, Button, Tabs, Tab } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import Movies from './components/Movies';
import TVShows from './components/TVShows';

const darkTheme = createTheme({
    palette: {
        mode: 'dark',
    },
});

function App() {
    const [activeTab, setActiveTab] = useState(0);
    const [isMovieFormOpen, setIsMovieFormOpen] = useState(false);
    const [isShowFormOpen, setIsShowFormOpen] = useState(false);

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setActiveTab(newValue);
    };

    const handleAddMovieClick = () => {
        setIsMovieFormOpen(true);
    };

    const handleAddShowClick = () => {
        setIsShowFormOpen(true);
    };

    return (
        <ThemeProvider theme={darkTheme}>
            <CssBaseline />
            <Box sx={{ flexGrow: 1 }}>
                <AppBar position="static">
                    <Toolbar>
                        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                            Media Tracker
                        </Typography>
                        <Tabs value={activeTab} onChange={handleTabChange} sx={{ mr: 2 }}>
                            <Tab label="Movies" />
                            <Tab label="TV Shows" />
                        </Tabs>
                        {activeTab === 0 ? (
                            <Button
                                variant="contained"
                                color="primary"
                                startIcon={<AddIcon />}
                                onClick={handleAddMovieClick}
                            >
                                Add Movie
                            </Button>
                        ) : (
                            <Button
                                variant="contained"
                                color="primary"
                                startIcon={<AddIcon />}
                                onClick={handleAddShowClick}
                            >
                                Add Show
                            </Button>
                        )}
                    </Toolbar>
                </AppBar>
                <Box sx={{ p: 3 }}>
                    {activeTab === 0 ? (
                        <Movies
                            isFormOpen={isMovieFormOpen}
                            onFormClose={() => setIsMovieFormOpen(false)}
                        />
                    ) : (
                        <TVShows
                            isFormOpen={isShowFormOpen}
                            onFormClose={() => setIsShowFormOpen(false)}
                        />
                    )}
                </Box>
            </Box>
        </ThemeProvider>
    );
}

export default App;
