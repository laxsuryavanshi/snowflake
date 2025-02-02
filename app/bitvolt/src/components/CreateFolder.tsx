import React, { useState } from 'react';
import CreateNewFolderIcon from '@mui/icons-material/CreateNewFolder';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useDispatch, useSelector } from 'react-redux';

import { createFolder } from '@/features/fs';
import { AppDispatch, AppState } from '@/store';

const CreateFolder: React.FC = () => {
  const [open, setOpen] = useState(false);

  const dispatch = useDispatch<AppDispatch>();
  const { currentFS, upload } = useSelector((state: AppState) => state.fs);

  const handleClose = () => {
    setOpen(false);
  };

  const openDialog = () => {
    setOpen(true);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (upload?.status === 'loading') {
      return;
    }

    const formData = new FormData(event.currentTarget);
    const { folderName } = Object.fromEntries(formData.entries()) as { folderName: string };
    if (!folderName) {
      return;
    }

    const path =
      (currentFS?.path ?? '') + (folderName.endsWith('/') ? folderName : `${folderName}/`);

    await dispatch(createFolder(path));

    handleClose();
  };

  const breadcrumbs = () =>
    currentFS?.path
      .split('/')
      // .filter(path => !!path)
      .map((path, index) => (
        <Typography variant="caption" key={index}>
          {path}
        </Typography>
      ));

  return (
    <>
      <Button
        disableFocusRipple
        variant="outlined"
        startIcon={<CreateNewFolderIcon />}
        onClick={openDialog}
      >
        Create Folder
      </Button>
      <Dialog
        onClose={handleClose}
        open={open}
        PaperProps={{
          component: 'form',
          onSubmit: handleSubmit,
          noValidate: true,
          sx: { width: '560px', maxWidth: '90%' },
        }}
      >
        <DialogTitle>Create new folder</DialogTitle>
        <DialogContent>
          <Breadcrumbs separator="›">{breadcrumbs()}</Breadcrumbs>
          <TextField
            margin="normal"
            name="folderName"
            label="Folder name"
            type="text"
            variant="standard"
            required
            fullWidth
            autoFocus
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button type="button" variant="outlined" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disableElevation>
            {upload?.status === 'loading' && (
              <CircularProgress color="inherit" size={16} sx={{ mr: 1 }} />
            )}
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default CreateFolder;
