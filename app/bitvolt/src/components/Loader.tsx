import React from 'react';
import Box from '@mui/material/Box';
import { Blocks } from 'react-loader-spinner';

const Loader: React.FC = () => {
  return (
    <Box
      sx={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        display: 'grid',
        placeContent: 'center',
      }}
    >
      <Blocks />
    </Box>
  );
};

export default Loader;
