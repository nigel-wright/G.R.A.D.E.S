import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './SearchBar.css';

function SearchBar({ onSearch }) {
    const [search, setSearch] = useState("")
    const [noOfResults, setNoResults] = useState(10);

    const handleSearch = () => {
        // Pass both search and noOfResults to the parent component
        onSearch({ noOfResults, search });
      };

  return (
    <div className='searchbar-container'>
        <div className="back-button">
            <Link to="/home">
                <button>Back to Home</button>
            </Link>
        </div>
        <select onChange={(e) => setNoResults(e.target.value)}
            className='n-search'>
            <option value={10}>10</option>
            <option value={15}>15</option>
            <option value={20}>20</option>
            <option value={50}>25</option>  
        </select>

        <input
            type="text"
            placeholder="Search..."
            value={search} // Correctly bind to `search` state
            onChange={(e) => setSearch(e.target.value)} // Update state on input
            className="search-input"
        />

        <button onClick={handleSearch} className="search-button">Search</button>
    </div>
  )
}

export default SearchBar