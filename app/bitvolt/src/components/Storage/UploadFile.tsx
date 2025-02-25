import React, { useState } from 'react';
import { StorageManager } from '@aws-amplify/ui-react-storage';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import Typography from '@mui/material/Typography';
import FileUploadIcon from '@mui/icons-material/FileUpload';

import '@aws-amplify/ui-react/styles.css';
import './amplify-overrides.css';

import { useInjected } from '@snowflake/react-utils';
import { FILESYSTEM_TOKEN, InjectedFileSystem } from '../Folders';

const UploadFile: React.FC = () => {
  const [open, setOpen] = useState(false);
  const { fileSystem, setFileSystem } = useInjected<InjectedFileSystem>(FILESYSTEM_TOKEN);

  const handleClose = () => {
    setOpen(false);
  };

  const openDialog = () => {
    setOpen(true);
  };

  const cancelUpload = () => {
    if (typeof clearAll === 'function') {
      clearAll();
    }
    handleClose();
  };

  const upload = () => {
    if (typeof uploadAll === 'function') {
      uploadAll();
    }
  };

  let clearAll: (() => void) | undefined;
  let uploadAll: (() => void) | undefined;

  const FileListFooter: React.FC<{ onClearAll: () => void; onUploadAll: () => void }> = ({
    onClearAll,
    onUploadAll,
  }) => {
    clearAll = onClearAll;
    uploadAll = onUploadAll;

    return null;
  };

  const breadcrumbs = () =>
    fileSystem?.path
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
        disableElevation
        variant="contained"
        startIcon={<FileUploadIcon />}
        onClick={openDialog}
      >
        Upload Files
      </Button>
      <Dialog
        onClose={handleClose}
        open={open}
        PaperProps={{
          sx: { width: '640px', maxWidth: '90%' },
        }}
      >
        <DialogContent>
          <Breadcrumbs separator="›" sx={{ mb: 2 }}>
            {breadcrumbs()}
          </Breadcrumbs>
          <StorageManager
            autoUpload={false}
            maxFileCount={20}
            path={({ identityId }) =>
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              `private/${identityId!}/${fileSystem?.path ?? ''}`
            }
            components={{ FileListFooter }}
            onUploadSuccess={event => {
              const fragments = event.key?.split('/');
              if (fileSystem && fragments?.length) {
                const name = fragments[fragments.length - 1];
                if (name) {
                  const children = fileSystem.children.filter(child => child.name !== name);
                  children.push({
                    name,
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    path: event.key!,
                    parent: fileSystem,
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    data: { path: event.key!, lastModified: new Date() },
                    children: [],
                  });
                  setFileSystem({ ...{ ...fileSystem, children } });
                }
              }
            }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button type="button" variant="outlined" onClick={cancelUpload}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disableElevation onClick={upload}>
            Upload
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default UploadFile;
