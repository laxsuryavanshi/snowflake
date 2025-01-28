import { useCallback, useEffect } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import Link from '@mui/material/Link';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import { useAuthenticator } from '@aws-amplify/ui-react-core';
import { SubmitHandler, useForm } from 'react-hook-form';
import { useNavigate, useSearchParams } from 'react-router';
import { PasswordField } from '@snowflake/matex';

import vector from '@/assets/undraw/working_late.svg';
import googleIcon from '@/assets/icons8/google.svg';
import styles from './Login.module.css';

interface LoginFormFields {
  email: string;
  password: string;
}

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

const Login: React.FC = () => {
  const { authStatus, isPending, submitForm, error, route } = useAuthenticator(context => [
    context.authStatus,
    context.isPending,
    context.submitForm,
    context.error,
    context.route,
  ]);
  const [searchParams] = useSearchParams();

  const navigate = useNavigate();

  const next = useCallback(() => searchParams.get('next'), [searchParams]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormFields>();

  const onSubmit: SubmitHandler<LoginFormFields> = ({ email, password }) => {
    if (isPending) {
      return;
    }
    submitForm({ username: email, password });
  };

  const stopNavigation: React.MouseEventHandler<HTMLAnchorElement> = event => {
    event.preventDefault();
    event.stopPropagation();
  };

  useEffect(() => {
    if (authStatus === 'authenticated') {
      void navigate(next() ?? '/', { replace: true });
    }
  }, [authStatus, navigate, next]);

  useEffect(() => {
    if (route === 'forceNewPassword') {
      void navigate('../new-password' + (searchParams.size ? `?${searchParams.toString()}` : ''), {
        replace: true,
      });
    }
  }, [route, navigate, searchParams]);

  if (authStatus === 'authenticated' || authStatus === 'configuring') {
    return null;
  }

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
              Login to bitvolt
            </Typography>
            <form
              className={styles.loginForm}
              // eslint-disable-next-line @typescript-eslint/no-misused-promises
              onSubmit={handleSubmit(onSubmit)}
              noValidate
            >
              <TextField
                variant="outlined"
                type="email"
                // name="email"
                id="email"
                label="Email"
                placeholder="Enter your email"
                autoComplete="username"
                autoFocus
                required
                {...register('email', { required: 'Email is required' })}
                error={!!errors.email}
                helperText={errors.email?.message}
              />
              <PasswordField
                variant="outlined"
                // name="password"
                id="password"
                label="Password"
                placeholder="Enter your password"
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
                disabled={isPending}
              >
                {isPending && (
                  <CircularProgress
                    color="inherit"
                    size={24}
                    sx={{ position: 'absolute', left: '96px' }}
                  />
                )}
                Login
              </Button>
              {error && <Alert severity="error">{error}</Alert>}
            </form>
            <div className={styles.divider}>
              <Divider />
              <Typography variant="caption">OR</Typography>
              <Divider />
            </div>
            <GoogleLoginButton type="button" disableRipple disabled={isPending}>
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
