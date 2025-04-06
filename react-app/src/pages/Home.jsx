import SearchBar from "../components/SearchBar"
import Navbar from "../components/Navbar"

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
        <section className="mt-8 flex justify-center">
            <div className="bg-gray-200 rounded-2xl p-6 shadow-lg w-full sm:max-w-3xl md:max-w-4xl lg:max-w-6xl">
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

export default function Home() {
    return(
        <div className= "flex">
            <Navbar />
            <main className = "ml-64 p-8 w-full">
                <div className= "flex gap-6 w-full max-w-full overflow-hidden">
                    <div className = "flex-1 min-w-0">
                        <SearchBar />
                        <h1 className="text-3xl font-serif mb-4">Welcome to Lossless Learning</h1>
                        <p className="text-lg">The place to learn about machine learning, coding, mathematics, and more.</p>
                        <button className="mt-4 px-4 py-2 bg-emerald-300 text-white rounded hover:bg-emerald-500">Start Learning</button>
                        <div>
                        <ArticleSection />
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
