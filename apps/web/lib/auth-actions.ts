import {
  GoogleAuthProvider,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  type UserCredential,
} from "firebase/auth";

import { getFirebaseAuth } from "./firebase";

export function signInWithEmail(
  email: string,
  password: string,
): Promise<UserCredential> {
  return signInWithEmailAndPassword(getFirebaseAuth(), email, password);
}

export function signInWithGoogle(): Promise<UserCredential> {
  return signInWithPopup(getFirebaseAuth(), new GoogleAuthProvider());
}

export function sendResetEmail(email: string): Promise<void> {
  return sendPasswordResetEmail(getFirebaseAuth(), email);
}

export function signOutUser(): Promise<void> {
  return signOut(getFirebaseAuth());
}
