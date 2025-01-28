import { useCallback, useEffect } from 'react';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useAuthenticator } from '@aws-amplify/ui-react-core';
import { SubmitHandler, useForm } from 'react-hook-form';
import { useNavigate, useSearchParams } from 'react-router';
import { PasswordField } from '@snowflake/matex';

import styles from './Login.module.css';

interface ForceNewPasswordFields {
  name: string;
  password: string;
  confirmPassword: string;
}

const ForceNewPassword: React.FC = () => {
  const { authStatus, isPending, submitForm, error, route } = useAuthenticator(context => [
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
    watch,
  } = useForm<ForceNewPasswordFields>();

  const password = watch('password');

  const onSubmit: SubmitHandler<ForceNewPasswordFields> = ({ name, password }) => {
    if (isPending) {
      return;
    }
    submitForm({ name, password });
  };

  useEffect(() => {
    if (route !== 'forceNewPassword') {
      void navigate('/', { replace: true });
    }
  }, [route, navigate]);

  useEffect(() => {
    if (authStatus === 'authenticated') {
      void navigate(next() ?? '/', { replace: true });
    }
  }, [authStatus, navigate, next]);

  if (route !== 'forceNewPassword') {
    return null;
  }

  return (
    <div className={styles.page}>
      <main>
        <div className={styles.forceNewPasswordContainer}>
          <div className={styles.formContainer}>
            <Typography sx={{ fontWeight: '700' }} variant="h5" component="h2">
              Change Password
            </Typography>
            <form
              className={styles.loginForm}
              // eslint-disable-next-line @typescript-eslint/no-misused-promises
              onSubmit={handleSubmit(onSubmit)}
              noValidate
            >
              <TextField
                variant="outlined"
                type="text"
                // name="name"
                id="name"
                label="Name"
                placeholder="Enter your name"
                autoComplete="name"
                autoFocus
                required
                {...register('name', { required: 'Name is required' })}
                error={!!errors.name}
                helperText={errors.name?.message}
              />
              <PasswordField
                variant="outlined"
                // name="new-password"
                id="new-password"
                label="New Password"
                placeholder="Enter new password"
                autoComplete="new-password"
                required
                {...register('password', { required: 'Password is required' })}
                error={!!errors.password}
                helperText={errors.password?.message}
              />
              <PasswordField
                variant="outlined"
                // name="confirm-password"
                id="confirm-password"
                label="Confirm Password"
                placeholder="Confirm your password"
                autoComplete="new-password"
                required
                {...register('confirmPassword', {
                  required: 'Password is required',
                  validate: value => value === password || 'Passwords do not match',
                })}
                error={!!errors.confirmPassword}
                helperText={errors.confirmPassword?.message}
              />
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
                Change Password
              </Button>
              {error && <Alert severity="error">{error}</Alert>}
            </form>
            <div className={styles.divider}>
              <Divider />
              <Typography variant="caption">OR</Typography>
              <Divider />
            </div>
            <Button
              disableRipple
              variant="outlined"
              href="../login"
              sx={{ fontWeight: '700', height: '48px' }}
              disabled={isPending}
            >
              Back to Login
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ForceNewPassword;
