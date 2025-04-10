import Navbar from "../components/Navbar";
import SearchBar from "../components/SearchBar"
import SearchFilter from "../components/SearchFilter"
import SearchResults from "../components/SearchResults"
import { useParams } from "react-router-dom"

export default function Summary() {

    const { count } = useParams();

    return (
        <div className= "flex bg-gray-100">
            <Navbar />

            <main className = "ml-64 p-8 w-full bg-gray-100">

                <div className= "flex gap-6 w-full max-w-full overflow-hidden">
                    <div className = "flex-1 min-w-0">
                    <SearchBar />
                    <SearchResults count = {count} />
                    </div>
                    <SearchFilter />
                </div>

            </main>

        </div>
    );
  }