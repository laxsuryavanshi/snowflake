import React, { useState } from 'react';
import Alert from '@mui/material/Alert';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import CreateNewFolderIcon from '@mui/icons-material/CreateNewFolder';
import { useInjected } from '@snowflake/react-utils';

import { createS3Folder, FILESYSTEM_TOKEN, InjectedFileSystem } from '../Folders';

const CreateFolder: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inProgress, setInProgress] = useState(false);
  const { fileSystem, setFileSystem } = useInjected<InjectedFileSystem>(FILESYSTEM_TOKEN);

  const handleClose = () => {
    setOpen(false);
  };

  const openDialog = () => {
    setOpen(true);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (inProgress) {
      return;
    }

    const formData = new FormData(event.currentTarget);
    const { folderName } = Object.fromEntries(formData.entries()) as { folderName: string };
    if (!folderName) {
      setError('Folder name can not be empty.');
      return;
    }

    setInProgress(true);
    try {
      const result = await createS3Folder(`${fileSystem?.path ?? ''}${folderName}`);
      if (fileSystem && result) {
        fileSystem.children.push({
          name: folderName,
          children: [],
          parent: fileSystem,
          path: result.path,
          data: result,
        });
        setFileSystem({ ...fileSystem });
      }
      setError(null);
      handleClose();
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      }
    } finally {
      setInProgress(false);
    }
  };

  const breadcrumbs = () =>
    fileSystem?.path.split('/').map((path, index) => (
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
          {error && <Alert severity="error">{error}</Alert>}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button type="button" variant="outlined" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disableElevation>
            {inProgress && <CircularProgress color="inherit" size={16} sx={{ mr: 1 }} />}
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default CreateFolder;
