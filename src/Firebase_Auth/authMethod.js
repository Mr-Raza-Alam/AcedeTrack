
// src/Firebase_Auth/authMethods.js
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  GithubAuthProvider,
  TwitterAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { auth } from "./firebase";

// Signup with Email
export const signupEmail = (email, password) =>
  createUserWithEmailAndPassword(auth, email, password);

// Login with Email
export const loginEmail = (email, password) =>
  signInWithEmailAndPassword(auth, email, password);

// Logout
export const logout = () => signOut(auth);

// Google Sign-in
export const loginGoogle = () => {
  const provider = new GoogleAuthProvider();
  return signInWithPopup(auth, provider);
};

// GitHub Sign-in
export const loginGithub = () => {
  const provider = new GithubAuthProvider();
  return signInWithPopup(auth, provider);
};

// Twitter Sign-in
export const loginTwitter = () => {
  const provider = new TwitterAuthProvider();
  return signInWithPopup(auth, provider);
};
