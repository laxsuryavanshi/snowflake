import { SessionValidationResult } from './auth';

declare global {
  namespace App {
    // interface Error {}
    interface Locals {
      user: SessionValidationResult['user'];
      session: SessionValidationResult['session'];
    }
    // interface PageData {}
    // interface PageState {}
    // interface Platform {}
  }
}

export {};
