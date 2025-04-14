import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const endpoint = isLogin
      ? "https://lossless-learning-cloudsql-fastapi-kbhge3in6a-uc.a.run.app/login"
      : "https://lossless-learning-cloudsql-fastapi-kbhge3in6a-uc.a.run.app/register";

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Something went wrong.");
      }

      localStorage.setItem("user_id", data.user_id);
      navigate("/");
    } catch (err) {
      setError(err.message || "Request failed.");
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-8 bg-gray-100"
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 48 48'%3E%3Cpath fill='none' stroke='%23e5e7eb' stroke-width='1' d='M0 0h48v48H0z M24 0v48 M0 24h48'/%3E%3C/svg%3E\")",
        backgroundSize: "48px 48px",
      }}
    >
      <div className="w-full max-w-5xl bg-white bg-opacity-90 backdrop-blur-sm shadow-xl rounded-2xl p-10">
        <div className="flex flex-col md:flex-row gap-12">
          {/* Info Side */}
          <div className="flex-1">
            <h1 className="text-4xl font-extrabold text-emerald-500 mb-4">
              Lossless Learning
            </h1>
            <p className="text-gray-700 text-lg mb-6">
              Empowering learners with distilled, high-quality Machine Learning
              educational content from across the internet.
            </p>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Why use Lossless Learning?
            </h2>
            <ul className="list-disc pl-5 text-gray-600 space-y-2 text-sm md:text-base">
              <li>
                Curated resources covering mathematics, programming, deep
                learning and more
              </li>
              <li>
                Explore GitHub repositories, YouTube videos, and relevant
                articles all in one place
              </li>
              <li>Finetuned summaries for faster understanding</li>
              <li>Favorite resources to revisit anytime</li>
            </ul>
          </div>

          {/* Form Side */}
          <div className="flex-1 border-t md:border-t-0 md:border-l border-gray-200 pt-8 md:pt-0 md:pl-12">
            <h2 className="text-2xl font-bold text-emerald-500 mb-2 text-center md:text-left">
              {isLogin ? "Welcome Back" : "Create an Account"}
            </h2>
            <p className="text-gray-500 mb-8 text-center md:text-left">
              {isLogin ? "Log in to your account" : "Sign up to get started"}
            </p>

            <form className="space-y-5" onSubmit={handleSubmit}>
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-emerald-400 focus:border-emerald-400"
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700"
                >
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-emerald-400 focus:border-emerald-400"
                  placeholder="Enter your password"
                />
              </div>

              {error && (
                <p className="text-red-500 text-sm text-center">{error}</p>
              )}

              <button
                type="submit"
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-2 rounded-md transition"
              >
                {isLogin ? "Log In" : "Sign Up"}
              </button>
            </form>

            <div className="mt-6 text-sm text-center text-gray-600">
              {isLogin ? (
                <>
                  Don't have an account?{" "}
                  <button
                    onClick={() => setIsLogin(false)}
                    className="text-emerald-500 hover:underline font-medium"
                  >
                    Sign up
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <button
                    onClick={() => setIsLogin(true)}
                    className="text-emerald-500 hover:underline font-medium"
                  >
                    Back to login
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
