import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';

import CreateFolder from '@/components/CreateFolder';
import FileExplorer from '@/components/FileExplorer';
import { fetchFiles } from '@/features/fs';
import { AppDispatch, AppState } from '@/store';

const IndexPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { status, error } = useSelector((state: AppState) => state.fs);

  useEffect(() => {
    if (status === 'idle') {
      void dispatch(fetchFiles());
    }
  }, [dispatch, status]);

  if (status === 'loading' || status === 'idle') {
    return <LinearProgress />;
  }

  if (status === 'fail') {
    return (
      <Alert sx={{ alignItems: 'center', mx: 2 }} severity="error">
        {error}
      </Alert>
    );
  }

  return (
    <>
      <Box display="flex" justifyContent="flex-end" gap={2}>
        <CreateFolder />
      </Box>
      <FileExplorer />
    </>
  );
};

export default IndexPage;
