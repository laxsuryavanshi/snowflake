import { CredentialsSignin } from '@auth/sveltekit';

export class InvalidCredentialsError extends CredentialsSignin {
  override message: string = 'Invalid email or password';
}

export class MissingCredentialsError extends CredentialsSignin {
  override message: string = 'Email and password are required';
}
