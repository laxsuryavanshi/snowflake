import { useDispatch, useSelector } from 'react-redux';
import FolderIcon from '@mui/icons-material/Folder';
import LinkIcon from '@mui/icons-material/Link';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import NoteIcon from '@mui/icons-material/Note';
import StarBorderIcon from '@mui/icons-material/StarBorder';
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
import { formatDistanceToNow } from 'date-fns/formatDistanceToNow';

import { FSRecord, isFolder, setCurrentFS } from '@/features/fs';
import { AppDispatch, AppState } from '@/store';
import FileExplorerHeader from './FileExplorerHeader';

const FileExplorer = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { currentFS, parentMap } = useSelector((state: AppState) => state.fs);

  const setCurrentFolder = (fs: FSRecord) => {
    if (isFolder(fs)) {
      dispatch(setCurrentFS(fs));
    }
  };

  const goBack = () => {
    if (!currentFS) {
      return;
    }

    setCurrentFolder(parentMap[currentFS.path]);
  };

  if (!currentFS) {
    return null;
  }

  return (
    <>
      <FileExplorerHeader
        currentFS={currentFS}
        parent={parentMap[currentFS.path]}
        goBack={goBack}
      />

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
            {currentFS.children.map(file => (
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
                      href={'view' + (file.data?.path ? `?key=${file.data.path}` : '')}
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
