import React from 'react';
import Box from '@mui/material/Box';

import { FileExplorer } from '@/components/Folders';
import { CreateFolder, UploadFile } from '@/components/Storage';

const Files: React.FC = () => {
  return (
    <>
      <Box display="flex" justifyContent="flex-end" gap={2}>
        <UploadFile />
        <CreateFolder />
      </Box>
      <FileExplorer />
    </>
  );
};

export default Files;
