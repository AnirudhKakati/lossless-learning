import { Link } from "react-router-dom";
import { FiGrid, FiBookOpen, FiFileText, FiHeart, FiSettings, FiLogOut } from 'react-icons/fi';


export default function Navbar() {
    return (
      <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-300 text-black p-5 flex flex-col justify-between">
      <div>
        <h2 className="text-xl font-serif font-bold mb-20">Lossless Learning</h2>
        <h3 className="text-m font-serif mb-2 text-emerald-700">Overview</h3>
        <nav>
          <ul>
            <li className="mb-2 flex items-center gap-1">
              <FiGrid size={22} className="relative -top-[2px] text-gray-500" />
              <Link to="/" className="underline-hover">Dashboard</Link>
            </li>
            <li className="mb-2 flex items-center gap-1">
              <FiBookOpen size={22} className="relative -top-[2px] text-gray-500" />
              <Link to="/resource" className="underline-hover">Resources</Link>
            </li>
            <li className="mb-2 flex items-center gap-1">
              <FiFileText size={22} className="relative -top-[2px] text-gray-500" />
              <Link to="/summary" className="underline-hover">Summaries</Link>
            </li>
            <li className="mb-2 flex items-center gap-2">
              <FiHeart size={22} className="relative -top-[2px] text-gray-500" />
              <a href="#" className="underline-hover">Favorites</a>
            </li>
          </ul>
        </nav>
      </div>
      <div>
        <h3 className="text-m mb-2 text-emerald-700">Settings</h3>
        <nav>
          <ul>
            <li className="mb-2 flex items-center gap-1">
              <FiSettings size={22} className="relative -top-[2px] text-gray-500" />
              <a href="#" className="underline-hover">Settings</a>
            </li>
            <li className="mb-2 flex items-center gap-1">
              <FiLogOut size={22} className="relative -top-[2px] text-gray-500" />
              <a href="#" className="underline-hover">Logout</a>
            </li>
          </ul>
        </nav>
      </div>
    </aside>
    );
}
