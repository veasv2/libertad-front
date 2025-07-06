'use client';

import { endpoints } from 'src/http';
import axios from 'src/http/client';

import { setSession } from './utils';
import { JWT_STORAGE_KEY } from './constant';

// ----------------------------------------------------------------------

export type SignInParams = {
  email: string;
  password: string;
};

export type SignUpParams = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
};

/** **************************************
 * Sign in
 *************************************** */
export const signInWithPassword = async ({ email, password }: SignInParams): Promise<void> => {
  const validEmail = 'demo@minimals.cc';
  const validPassword = '@2Minimal';

  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (email === validEmail && password === validPassword) {
        const fakeToken = 'fake-jwt-token';
        setSession(fakeToken); // Guarda el token en sessionStorage y configura axios si quieres
        resolve();
      } else {
        reject(new Error('Correo o contraseña incorrectos'));
      }
    }, 500); // Simula una latencia de red
  });
}

/** **************************************
 * Sign up
 *************************************** */
export const signUp = async ({
  email,
  password,
  firstName,
  lastName,
}: SignUpParams): Promise<void> => {
  const params = {
    email,
    password,
    firstName,
    lastName,
  };

  try {
    const res = await axios.post(endpoints.auth.signUp, params);

    const { accessToken } = res.data;

    if (!accessToken) {
      throw new Error('Access token not found in response');
    }

    sessionStorage.setItem(JWT_STORAGE_KEY, accessToken);
  } catch (error) {
    console.error('Error during sign up:', error);
    throw error;
  }
};

/** **************************************
 * Sign out
 *************************************** */
export const signOut = async (): Promise<void> => {
  try {
    await setSession(null);
  } catch (error) {
    console.error('Error during sign out:', error);
    throw error;
  }
};
