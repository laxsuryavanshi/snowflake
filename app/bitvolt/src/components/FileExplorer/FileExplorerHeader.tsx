import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import IconButton from '@mui/material/IconButton';
import Toolbar from '@mui/material/Toolbar';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

import { FSRecord } from '@/features/fs';

const FileExplorerHeader: React.FC<
  React.PropsWithChildren<{ currentFS: FSRecord; parent: FSRecord | null; goBack: () => void }>
> = ({ currentFS, parent, goBack }) => {
  return (
    <Toolbar disableGutters>
      {parent ? (
        <Tooltip title="Go Back" placement="right">
          <IconButton onClick={goBack}>
            <KeyboardArrowLeftIcon />
          </IconButton>
        </Tooltip>
      ) : (
        <IconButton disabled>
          <KeyboardArrowLeftIcon />
        </IconButton>
      )}
      <Typography>{currentFS.name || 'All Files'}</Typography>
    </Toolbar>
  );
};

export default FileExplorerHeader;
