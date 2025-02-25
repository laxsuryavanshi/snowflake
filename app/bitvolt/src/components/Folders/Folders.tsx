import React, { useEffect, useState } from 'react';
import Alert from '@mui/material/Alert';
import Collapse from '@mui/material/Collapse';
import LinearProgress from '@mui/material/LinearProgress';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import ListSubheader from '@mui/material/ListSubheader';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FolderIcon from '@mui/icons-material/Folder';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';

import { useInjected } from '@snowflake/react-utils';
import { FileSystemEntity, InjectedFileSystem } from './types';
import { fetchS3Files, FILESYSTEM_TOKEN, isFolder } from './utils';

const Folders: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean | null>(null);
  const [fileSystemHierarchy, setFileSystemHierarchy] = useState<FileSystemEntity | null>(null);
  const { setFileSystem } = useInjected<InjectedFileSystem>(FILESYSTEM_TOKEN);

  useEffect(() => {
    setLoading(true);
    fetchS3Files()
      .then(fileSystem => {
        setFileSystemHierarchy(fileSystem);
        setFileSystem(fileSystem);
        setError(null);
      })
      .catch((err: unknown) => {
        setError((err as { toString: () => string }).toString());
        setFileSystemHierarchy(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [setFileSystem]);

  return (
    <List
      sx={{ maxWidth: '100%', overflowX: 'auto' }}
      subheader={<ListSubheader component="div">Folders</ListSubheader>}
      dense
    >
      {loading && <LinearProgress sx={{ mx: 2 }} />}
      {error && (
        <Alert sx={{ alignItems: 'center', mx: 2 }} severity="error">
          {error}
        </Alert>
      )}
      {/* eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing */}
      {!(error || loading || fileSystemHierarchy?.children.length) && (
        <ListItem>
          <ListItemText
            primary="No Folders Found"
            slotProps={{ primary: { variant: 'caption' } }}
          />
        </ListItem>
      )}
      {fileSystemHierarchy && <FolderList fileSystem={fileSystemHierarchy.children} depth={0} />}
    </List>
  );
};

const Folder: React.FC<{ fileSystem: FileSystemEntity; depth: number }> = ({
  fileSystem,
  depth,
}) => {
  const [expanded, setExpanded] = useState(false);
  const { setFileSystem } = useInjected<InjectedFileSystem>(FILESYSTEM_TOKEN);

  const toggle = () => {
    setFileSystem(fileSystem);
    setExpanded(expand => !expand);
  };

  return (
    <>
      <ListItem disableGutters>
        <ListItemButton
          onClick={toggle}
          sx={{ pl: depth * 2 + 2, whiteSpace: 'nowrap', minWidth: 'fit-content' }}
        >
          {expanded ? (
            <ExpandMoreIcon fontSize="small" />
          ) : (
            <KeyboardArrowRightIcon fontSize="small" />
          )}
          <ListItemIcon sx={{ minWidth: '24px' }}>
            {expanded ? <FolderOpenIcon fontSize="small" /> : <FolderIcon fontSize="small" />}
          </ListItemIcon>
          <ListItemText primary={fileSystem.name} />
        </ListItemButton>
      </ListItem>
      <Collapse in={expanded} timeout="auto" unmountOnExit={false}>
        <FolderList fileSystem={fileSystem.children} depth={depth + 1} />
      </Collapse>
    </>
  );
};

const FolderList: React.FC<{ fileSystem: FileSystemEntity[]; depth: number }> = ({
  fileSystem,
  depth,
}) => {
  return (
    <>
      {fileSystem
        .filter(child => isFolder(child))
        .map(child => (
          <Folder key={child.path} fileSystem={child} depth={depth} />
        ))}
    </>
  );
};

export default Folders;
