import { Link, useNavigate} from "react-router-dom";
import { FiGrid, FiBookOpen, FiFileText, FiHeart, FiSettings, FiLogOut } from 'react-icons/fi';

// Navbar for switching pages
export default function Navbar() {
      const navigate = useNavigate();

      const handleLogout = () => {
        localStorage.removeItem("user_id");
        navigate("/login");
      };
  
      return (
      <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-300 text-black p-5 flex flex-col justify-between">
      <div>
        <h2 className="text-xl font-bold mt-8">Lossless Learning</h2>
        <nav className="mt-10">
        <h3 className="text-m font-serif mb-2 text-emerald-700">Overview</h3>
          <ul>
            <li className="mb-2 flex items-center gap-1">
              <FiGrid size={22} className="relative -top-[2px] text-gray-500" />
              <Link to="/" className="underline-hover">Dashboard</Link>
            </li>
            <li className="mb-2 flex items-center gap-1">
              <FiBookOpen size={22} className="relative -top-[2px] text-gray-500" />
              <Link to="/summary" className="underline-hover">Resources</Link>
            </li>
            <li className="mb-2 flex items-center gap-2">
              <FiHeart size={22} className="relative -top-[2px] text-gray-500" />
              <Link to="/favorites" className="underline-hover">Favorites</Link>
            </li>
          </ul>
        </nav>
      </div>
      <div>
        <h3 className="text-m mb-2 text-emerald-700">Settings</h3>
        <nav>
          <ul>
            <li className="flex items-center gap-1 mb-2 ">
              <FiSettings size={22} className="relative -top-[2px] text-gray-500" />
              <a href="#" className="underline-hover">Settings</a>
            </li>
            <li className="mb-8 flex items-center gap-1">
              <FiLogOut size={22} className="relative -top-[2px] text-gray-500" />
              <button
                onClick={() => {
                  localStorage.removeItem("user_id");
                  window.location.href = "/login";
                }}
                className="underline-hover text-left"
              >
                Logout
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </aside>
    );
}
