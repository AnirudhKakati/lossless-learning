import SearchBar from "../components/SearchBar";
import Navbar from "../components/Navbar";


export default function Resource() {
  return (
  <div className= "flex bg-gray-100">
            <Navbar />

            <main className = "ml-64 p-8 w-full bg-gray-100">

                <div className= "flex gap-6 w-full max-w-full overflow-hidden">
                    <div className = "flex-1 min-w-0">
                    <SearchBar />
                   
                    </div>
                    
                </div>

            </main>

      </div>
  );
}
