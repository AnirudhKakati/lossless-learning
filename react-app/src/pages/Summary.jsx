import Navbar from "../components/Navbar";
import SearchBar from "../components/SearchBar"
export default function Summary() {

    return (
        <div className= "flex">
            <Navbar />

            <main className = "ml-64 p-8 w-full">

                <div className= "flex gap-6 w-full max-w-full overflow-hidden">
                    <div className = "flex-1 min-w-0">
                    <SearchBar />

                    </div>
                </div>

            </main>

        </div>
    );
  }