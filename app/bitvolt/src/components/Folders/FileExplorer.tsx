import React from 'react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Toolbar from '@mui/material/Toolbar';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import FolderIcon from '@mui/icons-material/Folder';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import LinkIcon from '@mui/icons-material/Link';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import NoteIcon from '@mui/icons-material/Note';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import { formatDistanceToNow } from 'date-fns/formatDistanceToNow';
import { useInjected } from '@snowflake/react-utils';

import { FileSystemEntity, InjectedFileSystem } from './types';
import { FILESYSTEM_TOKEN, isFolder } from './utils';

const FileExplorer: React.FC = () => {
  const { fileSystem, setFileSystem } = useInjected<InjectedFileSystem>(FILESYSTEM_TOKEN);

  const setCurrentFolder = (fileSystem: FileSystemEntity) => {
    if (isFolder(fileSystem)) {
      setFileSystem(fileSystem);
    }
  };

  return (
    <>
      <Toolbar disableGutters>
        {fileSystem?.parent ? (
          <Tooltip title="Go Back" placement="right">
            <IconButton
              onClick={() => {
                setFileSystem(fileSystem.parent ?? null);
              }}
            >
              <KeyboardArrowLeftIcon />
            </IconButton>
          </Tooltip>
        ) : (
          <IconButton disabled>
            <KeyboardArrowLeftIcon />
          </IconButton>
        )}
        {/* eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing */}
        <Typography>{fileSystem?.name || 'All Files'}</Typography>
      </Toolbar>
      <TableContainer component={Paper} elevation={0}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Last Modified</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {fileSystem?.children.map(file => (
              <TableRow hover key={file.path}>
                {isFolder(file) ? (
                  <TableCell
                    sx={{ cursor: 'pointer' }}
                    onClick={() => {
                      setCurrentFolder(file);
                    }}
                  >
                    <Box display="flex" alignItems="center" gap="4px">
                      <FolderIcon />
                      {file.name}
                    </Box>
                  </TableCell>
                ) : (
                  <TableCell>
                    <Link
                      display="flex"
                      alignItems="center"
                      gap="4px"
                      href={'view' + (file.data?.path ? `?path=${file.data.path}` : '')}
                      sx={{ color: 'inherit', textDecoration: 'none' }}
                    >
                      <NoteIcon />
                      {file.name}
                    </Link>
                  </TableCell>
                )}
                <TableCell>
                  {file.data?.lastModified &&
                    formatDistanceToNow(file.data.lastModified, { addSuffix: true })}
                </TableCell>
                <TableCell align="center" className="MuiTableCell-actions">
                  <IconButton disableRipple sx={{ py: 0 }}>
                    <StarBorderIcon fontSize="small" />
                  </IconButton>
                  <IconButton disableRipple sx={{ py: 0 }}>
                    <LinkIcon fontSize="small" />
                  </IconButton>
                  <IconButton disableRipple sx={{ py: 0 }}>
                    <MoreHorizIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
};

export default FileExplorer;
