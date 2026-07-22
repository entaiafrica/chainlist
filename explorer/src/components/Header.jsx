import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <AppBar 
      position="static" 
      elevation={0}
      sx={{ 
        background: 'linear-gradient(135deg, #9D4EDD 0%, #FF8C42 100%)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Typography 
          variant="h6" 
          component="div" 
          sx={{ 
            flexGrow: 1,
            fontFamily: "'Cairo Play', sans-serif",
            fontWeight: 700,
            fontSize: '1.5rem',
            background: 'linear-gradient(to right, #ffffff, #f0f0f0)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            textShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}
        >
          FirstBrick Explorer
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button 
            color="inherit" 
            component={Link} 
            to="/"
            sx={{
              color: '#fff',
              fontWeight: 600,
              textTransform: 'none',
              '&:hover': {
                background: 'rgba(255, 255, 255, 0.1)',
                transform: 'scale(1.05)'
              }
            }}
          >
            Home
          </Button>
          <Button 
            color="inherit" 
            component={Link} 
            to="/blocks"
            sx={{
              color: '#fff',
              fontWeight: 600,
              textTransform: 'none',
              '&:hover': {
                background: 'rgba(255, 255, 255, 0.1)',
                transform: 'scale(1.05)'
              }
            }}
          >
            Blocks
          </Button>
          <Button 
            color="inherit" 
            component={Link} 
            to="/transactions"
            sx={{
              color: '#fff',
              fontWeight: 600,
              textTransform: 'none',
              '&:hover': {
                background: 'rgba(255, 255, 255, 0.1)',
                transform: 'scale(1.05)'
              }
            }}
          >
            Transactions
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;