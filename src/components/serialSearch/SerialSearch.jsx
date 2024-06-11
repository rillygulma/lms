import { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Card } from 'flowbite-react';
import Cart from '../AdminComponent/booksData/Cart';

const SerialSearch = () => {
  const [searchQuery, setSearchQuery] = useState({ isbn: '', bookTitle: '', authorName: '' });
  const [searchResults, setSearchResults] = useState(null);
  const [cart, setCart] = useState([]);

  const handleSearch = async () => {
    try {
      const accessToken = localStorage.getItem('token');
      const response = await axios.get('https://fubk-lms-backend.onrender.com/api/users/serialsearch', {
        params: searchQuery,
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });
      setSearchResults(response.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const filterResults = (results) => {
    if (!results) return [];
    let filteredResults = [...results];

    if (searchQuery.isbn) {
      filteredResults = filteredResults.filter(result => result.isbn === searchQuery.isbn);
    }
    if (searchQuery.bookTitle) {
      filteredResults = filteredResults.filter(result => result.title === searchQuery.bookTitle);
    }
    if (searchQuery.authorName) {
      filteredResults = filteredResults.filter(result => result.author === searchQuery.authorName);
    }

    return filteredResults;
  };

  const addToCart = (book) => {
    setCart(prevCart => [...prevCart, book]);
  };


  return (
    <div className='bg-blue-300 max-w-md mx-auto mt-8 p-4 border rounded-lg shadow-md'>
      <form className="flex flex-col space-y-4 mt-10">
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center text-gray-900 mt-8 mb-4">
      Serial Section
      </h1>
      <h2 className="text-xl sm:text-2xl font-semibold text-center text-gray-800 mt-6 mb-4">
      Search With Any Of the Following Below
      </h2>
      
        <input
          className="border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring focus:border-blue-500"
          type="text"
          placeholder="ISBN"
          value={searchQuery.isbn}
          onChange={(e) => setSearchQuery({ ...searchQuery, isbn: e.target.value })}
        />
        <input
          className="border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring focus:border-blue-500"
          type="text"
          placeholder="Book Title"
          value={searchQuery.bookTitle}
          onChange={(e) => setSearchQuery({ ...searchQuery, bookTitle: e.target.value })}
        />
        <input
          className="border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring focus:border-blue-500"
          type="text"
          placeholder="Author Name"
          value={searchQuery.authorName}
          onChange={(e) => setSearchQuery({ ...searchQuery, authorName: e.target.value })}
        />
        <button
          className="bg-blue-500 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-blue-600 focus:outline-none focus:ring focus:ring-blue-200"
          onClick={handleSearch}
          type="button"
        >
          Search
        </button>
      </form>

      {searchResults && searchResults.length > 0 && (
        <div>
          <h2>Search Results:</h2>
          {searchResults.map((book) => (
            <div className='result-item' key={book._id}>
              <Cart count={cart.filter(item => item._id === book._id).length} />
              <Card>
                <Link to={`/borrowbook/${book.bookTitle}`}>
                  <img src={book.bookImageUrl} alt="" />
                  <h5 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                    <p className="font-normal text-black">{book.bookTitle}</p>
                  </h5>
                  <p className="font-normal text-gray-700 dark:text-gray-400">{book.category}</p>
                  <p className="font-normal text-black">{book.bookDescription}</p>
                  <button className="text-base bg-green-500 rounded-sm mt-2 font-bold">{book.status}</button>
                </Link>
                  <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold mt-4 py-2 px-4 rounded" onClick={() => addToCart(book)}>Borrow Me</button>
              </Card>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default SerialSearch;
