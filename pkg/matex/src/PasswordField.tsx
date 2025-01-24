import { forwardRef, useState } from 'react';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import TextField, { TextFieldProps } from '@mui/material/TextField';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

const PasswordField = forwardRef<HTMLDivElement | null, Omit<TextFieldProps, 'type'>>(
  (props, ref) => {
    const [showPassword, setShowPassword] = useState(false);

    const handleClickShowPassword = (): void => {
      setShowPassword(showPassword => !showPassword);
    };

    /**
     * When clicked on visibility toggle, the input cursor is moving to the start
     * of input field. Its' mentioned on the MUI site to put this event handler
     * for mousedown event, but it still won't work. Found the workaround here.
     * https://github.com/mui/material-ui/issues/26007#issuecomment-1761406645
     */
    const handleMouseEventPassword = (event: React.MouseEvent<HTMLButtonElement>): void => {
      event.preventDefault();
    };

    return (
      <TextField
        {...props}
        ref={ref}
        type={showPassword ? 'text' : 'password'}
        slotProps={{
          input: {
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  edge="end"
                  onClick={handleClickShowPassword}
                  onMouseDown={handleMouseEventPassword}
                  onMouseUp={handleMouseEventPassword}
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          },
        }}
      />
    );
  }
);

PasswordField.displayName = 'PasswordField';

export default PasswordField;
