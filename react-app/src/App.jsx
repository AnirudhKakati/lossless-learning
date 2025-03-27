import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'


function ArticleSection() {
  const articles = [
    {
      title: "The Future of AI in Education",
      img: "#",
    },
    {
      title: "How Data Science is Changing Research",
      img: "#",
    },
    {
      title: "Building Scalable Web Applications",
      img: "#",
    },
  ];

  return (
<section className="ml-64 p-8 flex justify-center">
  <div className="bg-gray-200 rounded-2xl p-6 shadow-lg w-full max-w-6xl">
    <h2 className="text-3xl font-semibold mb-6">Latest Articles</h2>
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {articles.map((article, index) => (
        <div key={index} className="bg-white shadow-lg rounded-lg overflow-hidden hover:scale-105 transition-transform">
          <img src={article.img} alt={article.title} className="w-full h-40 object-cover" />
          <div className="p-4">
            <h3 className="text-lg font-semibold">{article.title}</h3>
          </div>
        </div>
      ))}
    </div>
  </div>
</section>




  );
}


export default function App() {
  return (

  <div class="flex">
    <aside class="fixed left-0 top-0 h-full w-64 bg-gray-100 text-black p-5 flex flex-col justify-between">
        <div>
            <h2 class="text-xl font-serif font-bold mb-20">Lossless Learning</h2>
            <h3 class="text-base font-serif mb-5">Overview</h3>
            <nav>
                <ul>
                    <li class="mb-2">
                      <a href="#" class="underline-hover">Dashboard</a>
                      </li>
                    <li class="mb-2">
                      <a href="#" class="underline-hover">
                          Lessons
                      </a>
                    </li>
                    <li class="mb-2">
                      <a href="#" class="underline-hover">
                        Summaries
                      </a>
                    </li>
                    <li class="mb-2">
                      <a href="#" class="underline-hover">
                          Favorites
                      </a>
                    </li>
                </ul>
            </nav>
        </div>

        <div>
            <h3 class="text-base mb-5">Settings</h3>
            <nav>
                <ul>
                    <li class="mb-2"><a href="#" class="underline-hover">Settings</a></li>
                    <li class="mb-2"><a href="#" class="underline-hover">Logout</a></li>
                </ul>
            </nav>
        </div>
    </aside>

    <div>
      <div className="ml-64 p-8 w-full overflow-auto">

      <div className="relative w-full max-w-md mb-6">
    <input 
      type="text" 
      placeholder="Search lessons..." 
      className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
    />
    <svg 
      className="absolute left-3 top-3 w-5 h-5 text-gray-500" 
      xmlns="http://www.w3.org/2000/svg" 
      fill="none" 
      viewBox="0 0 24 24" 
      stroke="currentColor"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-4.35-4.35M17 10.5a6.5 6.5 0 1 1-13 0 6.5 6.5 0 0 1 13 0z" />
    </svg>
  </div>

        <h1 className="text-3xl font-serif mb-4">Welcome to Lossless Learning</h1>
        <p className="text-lg">This is your main content area where you can display your educational materials.</p>
        <button className="mt-4 px-4 py-2 bg-emerald-300 text-white rounded hover:bg-emerald-500">Start Learning</button>
    </div>

      <ArticleSection />
    </div>
  </div>
)
}
