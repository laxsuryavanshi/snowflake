import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Link from '@mui/material/Link';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import { PasswordField } from '@snowflake/matex';
import { useForm } from 'react-hook-form';
import { useSearchParams } from 'react-router';

import googleIcon from '../assets/icons8/google.svg';
import vector from '../assets/undraw/working_late.svg';
import styles from './Login.module.css';

const GoogleLoginButton = styled(Button)({
  height: 48,
  padding: 0,
  fontWeight: '700',
  background: '#4285f4',
  color: '#fff',

  '&:hover': {
    background: '#4285f4',
    boxShadow: '0 0 4px 0 #4285f4',
  },

  '&:disabled': {
    color: '#fff',
  },
});

const Login = () => {
  const [searchParams] = useSearchParams();
  const error = searchParams.get('error');

  const {
    register,
    formState: { errors },
  } = useForm();

  const stopNavigation = event => {
    event.preventDefault();
    event.stopPropagation();
  };

  return (
    <div className={styles.page}>
      <main>
        <div className={styles.boxContainer}>
          <div className={styles.vectorContainer}>
            <img src={vector} width={316} alt="" />
          </div>
          <Box
            className={styles.formContainer}
            sx={theme =>
              theme.applyStyles('dark', {
                backgroundColor: theme.palette.grey[900],
              })
            }
          >
            <Typography
              sx={{ fontWeight: '700' }}
              className={styles.formLegend}
              variant="h5"
              component="h2"
            >
              Login to turtleby
            </Typography>
            <form className={styles.loginForm} noValidate action="/login" method="post">
              <TextField
                variant="outlined"
                type="username"
                // name="username"
                id="username"
                label="Username"
                placeholder="Username"
                autoComplete="username"
                autoFocus
                required
                {...register('username', { required: 'Username is required' })}
                error={!!errors.username}
                helperText={errors.username?.message}
              />
              <PasswordField
                variant="outlined"
                // name="password"
                id="password"
                label="Password"
                placeholder="Password"
                autoComplete="current-password"
                required
                {...register('password', { required: 'Password is required' })}
                error={!!errors.password}
                helperText={errors.password?.message}
              />
              <Typography variant="caption" sx={{ textAlign: 'end' }}>
                <Link href="../recover" onClick={stopNavigation}>
                  Forgot Password?
                </Link>
              </Typography>
              <Button
                disableRipple
                variant="contained"
                type="submit"
                sx={{ fontWeight: '700', height: '48px' }}
                disableElevation
              >
                Login
              </Button>
              {error && (
                <Alert severity="error">Invalid username or password. Please try again.</Alert>
              )}
            </form>
            <div className={styles.divider}>
              <Divider />
              <Typography variant="caption">OR</Typography>
              <Divider />
            </div>
            <GoogleLoginButton type="button" disableRipple>
              <div className={styles.googleIconContainer}>
                <img src={googleIcon} width={24} alt="" />
              </div>
              <span>Continue with Google</span>
            </GoogleLoginButton>
            <Typography variant="caption" sx={{ textAlign: 'center' }}>
              Don&apos;t have an account yet?{' '}
              <Link href="../signup" onClick={stopNavigation}>
                Signup here
              </Link>
            </Typography>
          </Box>
        </div>
        <Typography
          variant="body2"
          sx={{ maxWidth: '728px', textAlign: 'center', mx: 'auto', mt: 4 }}
        >
          Self user signup is disabled, and password recovery can only be done through the
          administrator. If you need an account or have forgotten your password, kindly{' '}
          <Link href="mailto:laxsuryavanshi@gmail.com">contact</Link> the administrator for
          assistance. Thank you for visiting!
        </Typography>
      </main>
    </div>
  );
};

export default Login;
