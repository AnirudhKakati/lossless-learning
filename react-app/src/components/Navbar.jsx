import { Link } from "react-router-dom";

export default function Navbar() {
    return (
        <aside class="fixed left-0 top-0 h-full w-64 bg-gray-100 text-black p-5 flex flex-col justify-between">
        <div>
            <h2 class="text-xl font-serif font-bold mb-20">Lossless Learning</h2>
            <h3 class="text-sm font-serif mb-5 text-gray-500">Overview</h3>
            <nav>
                <ul>
                    <li class="mb-2">
                      <Link to="/" class="underline-hover">Dashboard</Link>
                      </li>
                    <li class="mb-2">
                      <a href="#" class="underline-hover">
                          Lessons
                      </a>
                    </li>
                    <li class="mb-2">
                      <Link to="/summary" class="underline-hover">
                        Summaries
                      </Link>
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
            <h3 class="text-sm mb-5 text-gray-500">Settings</h3>
            <nav>
                <ul>
                    <li class="mb-2"><a href="#" class="underline-hover">Settings</a></li>
                    <li class="mb-2"><a href="#" class="underline-hover">Logout</a></li>
                </ul>
            </nav>
        </div>
    </aside>
    );
}
