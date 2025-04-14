import React from "react";

export default function LoginPage() {
  return (
    <div
      className="min-h-screen bg-gray-100 flex items-center justify-center px-4 py-8"
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 48 48'%3E%3Cpath fill='none' stroke='%23e5e7eb' stroke-width='1' d='M0 0h48v48H0z M24 0v48 M0 24h48'/%3E%3C/svg%3E\")",
        backgroundSize: "48px 48px",
      }}
    >
      <div className="w-full max-w-5xl bg-white bg-opacity-90 backdrop-blur-sm shadow-xl rounded-2xl p-10">
        <div className="flex flex-col md:flex-row gap-12">
          
          {/* Left Side: Info & Features */}
          <div className="flex-1">
            <h1 className="text-4xl font-extrabold text-emerald-500 mb-4">
              Lossless Learning
            </h1>
            <p className="text-gray-700 text-lg mb-6">
              Empowering learners with distilled, high-quality Machine Learning educational content from across the internet.
            </p>

            <h2 className="text-xl font-semibold text-gray-800 mb-2">Why use Lossless Learning?</h2>
            <ul className="list-disc list-outside pl-5 text-gray-600 space-y-2 text-sm md:text-base">
                <li>Curated resources covering mathematics, programming, deep learning and more </li>
                <li>Explore GitHub repositories, YouTube videos, and relevant articles all in one place</li>
                <li>Finetined summarizes for faster understanding</li>
                <li>Favorite resources to revisit anytime</li>
            </ul>
          </div>

          {/* Right Side: Login Form */}
          <div className="flex-1 border-t md:border-t-0 md:border-l border-gray-200 pt-8 md:pt-0 md:pl-12">
            <h2 className="text-2xl font-bold text-emerald-500 text-center md:text-left mb-2">
              Welcome Back
            </h2>
            <p className="text-center md:text-left text-gray-500 mb-8">
              Log in to your account
            </p>

            <form className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-emerald-400 focus:border-emerald-400"
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-emerald-400 focus:border-emerald-400"
                  placeholder="Enter your password"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-2 rounded-md transition"
              >
                Log In
              </button>
            </form>

            <div className="mt-6 text-sm text-center text-gray-600">
                <span>Don't have an account? </span>
                <a href="#" className="text-emerald-500 hover:underline font-medium">
                    Sign up
                </a>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
