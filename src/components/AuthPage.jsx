
// src/components/AuthPage.jsx
import React, { useState } from "react";
import {
  signupEmail,
  loginEmail,
  logout,
  loginGoogle,
  loginGithub,
  loginTwitter,
} from "../Firebase_Auth/authMethod";

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Email signup
  const handleSignup = async () => {
    try {
      const user = await signupEmail(email, password);
      console.log("Signed up:", user.user.email);
    } catch (err) {
      console.error(err.message);
    }
  };

  // Email login
  const handleLogin = async () => {
    try {
      const user = await loginEmail(email, password);
      console.log("Logged in:", user.user.email);
    } catch (err) {
      console.error(err.message);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-6 rounded-2xl shadow-lg w-96">
        <h2 className="text-xl font-bold mb-4 text-center">Login / Signup</h2>

        {/* Email/Password Form */}
        <input
          type="email"
          placeholder="Email"
          className="w-full border p-2 mb-2 rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full border p-2 mb-4 rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleSignup}
          className="w-full bg-green-500 text-white py-2 rounded mb-2"
        >
          Sign Up (Email)
        </button>

        <button
          onClick={handleLogin}
          className="w-full bg-blue-500 text-white py-2 rounded mb-2"
        >
          Login (Email)
        </button>

        {/* OAuth Buttons */}
        <button
          onClick={loginGoogle}
          className="w-full bg-red-500 text-white py-2 rounded mb-2"
        >
          Sign in with Google
        </button>

        <button
          onClick={loginGithub}
          className="w-full bg-gray-800 text-white py-2 rounded mb-2"
        >
          Sign in with GitHub
        </button>

        <button
          onClick={loginTwitter}
          className="w-full bg-sky-500 text-white py-2 rounded mb-2"
        >
          Sign in with Twitter
        </button>

        <button
          onClick={logout}
          className="w-full bg-black text-white py-2 rounded mt-4"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
