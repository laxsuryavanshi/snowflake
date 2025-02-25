import React, { useState } from 'react';
import { StorageImage } from '@aws-amplify/ui-react-storage';
import { useSearchParams } from 'react-router';
import Backdrop from '@mui/material/Backdrop';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Loader from '@/components/Loader';

const View: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();

  const path = searchParams.get('path');

  const stopLoading = (): void => {
    setLoading(false);
  };

  if (!path) {
    return null;
  }

  return (
    <Backdrop open sx={{ zIndex: theme => theme.zIndex.drawer + 1, background: '#000' }}>
      <Tooltip title="Go Back" placement="right">
        <IconButton
          href=".."
          sx={{ color: '#fff', position: 'absolute', left: 0, top: 0, ml: 1, mt: 1 }}
        >
          <ArrowBackIcon />
        </IconButton>
      </Tooltip>
      {loading && <Loader />}
      <StorageImage maxWidth={'100%'} maxHeight={'100%'} alt="" onLoad={stopLoading} path={path} />
    </Backdrop>
  );
};

export default View;
