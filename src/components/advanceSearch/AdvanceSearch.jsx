import { useEffect, useState } from 'react';
import axios from 'axios';
import { Card } from 'flowbite-react';
import { FaShoppingCart } from 'react-icons/fa';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { toast } from 'react-toastify';

const AdvanceSearch = () => {
  const [searchQuery, setSearchQuery] = useState({
    searchBy: '',
    value: '',
  });
  const [books, setBooks] = useState([]);
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkout, setCheckout] = useState({
    borrowDate: new Date(),
    returnDate: new Date(),
  });
  const [backendError, setBackendError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSearchQuery(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const accessToken = localStorage.getItem('token');
        if (!accessToken) {
          throw new Error('User not logged in. Please log in to view this page.');
        }
        const response = await axios.get(`https://fubk-lms-backend.onrender.com/api/users/advancesearch`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        });
        setBooks(response.data.data);
        setBackendError('');
      } catch (error) {
        console.error('Error fetching data:', error);
        setBackendError(error.response?.data?.message || 'User not logged in. Please log in to view this books.');
      }
    };
    fetchData();
  }, []);

  const handleSearch = async () => {
    try {
      const accessToken = localStorage.getItem('token');
      const config = {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      };
  
      const response = await axios.get(`https://fubk-lms-backend.onrender.com/api/users/advancesearch?${searchQuery.searchBy}=${searchQuery.value}`, config);
      setBooks(response.data.data);
      setBackendError('');
    } catch (error) {
      console.error('Error searching:', error);
      setBackendError(error.response?.data?.message || 'Error searching for books.');
    }
  };
  
  const addToCart = async (book) => {
    try {
      const accessToken = localStorage.getItem('token');
      const borrower = {
        userId: localStorage.getItem('user_id'),
        fullName: localStorage.getItem('fullName'),
        email: localStorage.getItem('email'),
        phoneNo: localStorage.getItem('phoneNo'),
        role: localStorage.getItem('role'),
      };

      const maxItems = borrower.role === 'staff' ? 5 : 3;
      if (cart.length >= maxItems) {
        toast.error(`You can only add ${maxItems} books to your cart.`);
      } else {
        // Check if the book status is "borrowed"
        const bookStatusJSON = localStorage.getItem('bookStatus');
        const bookStatus = JSON.parse(bookStatusJSON);
        const isBookBorrowed = bookStatus.find(item => item.status === book.status);
        if (isBookBorrowed) {
          toast.error('This book has already been borrowed.');
        } else {
          await axios.put(`https://fubk-lms-backend.onrender.com/api/admin/updatebook/${book._id}`, { status: 'borrowed' }, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
          });
          setCart((prevCart) => [...prevCart, { book, borrower }]);
        }
      }
    } catch (error) {
      console.error('Error updating book status:', error);
    }
  };

  const removeItemFromCart = async (bookId) => {
    try {
      const accessToken = localStorage.getItem('token');
      await axios.put(`https://fubk-lms-backend.onrender.com/api/admin/updatebook/${bookId}`, { status: 'available' }, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });
      setCart((prevCart) => prevCart.filter((item) => item.book._id !== bookId));
    } catch (error) {
      console.error('Error updating book status:', error);
    }
  };

  const toggleCart = () => {
    setCartOpen((prevState) => !prevState);
  };

  const closeCart = () => {
    setCartOpen(false);
  };

  const calculateMaxReturnDate = (borrowDate, role) => {
    const maxReturnDate = new Date(borrowDate);
    maxReturnDate.setDate(maxReturnDate.getDate() + (role === 'staff' ? 10 : 7));
    return maxReturnDate;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const accessToken = localStorage.getItem('token');
      const userId = localStorage.getItem('user_id'); // Get user ID from localStorage

      // Check if the user has already borrowed a book
      const hasAlreadyBorrowed = await checkIfUserHasBorrowed(userId);
      if (hasAlreadyBorrowed) {
        toast.error('You have already borrowed a book. Please return the book before borrowing another one');
        return; // Exit early if the user has already borrowed a book
      }

      const dataToSave = {
        cart: cart.map((item) => ({
          ...item,
          checkoutForm: {
            ...checkout,
            returnDate: calculateMaxReturnDate(checkout.borrowDate, item.borrower.role),
          },
        })),
        userId: userId // Add userId to the data to be saved
      };

      const response = await axios.post('https://fubk-lms-backend.onrender.com/api/users/borrowers', dataToSave, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Data saved successfully:', response.data);
      toast.success('Your borrowing request has been submitted!');
      setCart([]);
      setCheckout({
        borrowDate: new Date(),
        returnDate: new Date(),
      });
      setCartOpen(false);
    } catch (error) {
      if (error.response?.data?.message === 'This book is already borrowed and cannot be borrowed again') {
        toast.error('This book is already borrowed and cannot be borrowed again');
      }
      console.error('Error submitting data:', error);
    }
  };

  const checkIfUserHasBorrowed = async (userId) => {
    try {
      const accessToken = localStorage.getItem('token');
      const response = await axios.get(`https://fubk-lms-backend.onrender.com/api/user/allborrowers?userId=${userId}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data.length > 0; // If the length is greater than 0, user has borrowed a book
    } catch (error) {
      console.error('Error checking if user has borrowed:', error);
      return false; // Return false in case of any error
    }
  };

  return (
     <div className="mt-28 px-4 lg:px-24 relative">
      {backendError && <div className="text-red-500 font-bold mb-5">{backendError}</div>}
      <h2 className="text-5xl sm:mt-10 font-bold text-center">Advance Search Section</h2>

      <div className="search-options mt-5 flex flex-col sm:flex-row items-center">
  <select 
    name="searchBy" 
    value={searchQuery.searchBy} 
    onChange={handleInputChange} 
    className="mr-2 p-2 mb-2 sm:mb-0 w-full sm:w-auto">
    <option value="">Search By</option>
       <option value="bookTitle">Book Title</option>
       <option value="bookBarcode">Book Barcode</option>
      <option value="placeOfPub">Place Of Pub</option>
      <option value="yearPublished">Year Published</option>
  </select>
  <input
    type="text"
    name="value"
    value={searchQuery.value}
    onChange={handleInputChange}
    className="mr-2 p-2 mb-2 sm:mb-0 w-full sm:w-auto"
    placeholder="Enter search value"
  />
  <button 
    onClick={handleSearch} 
    className="bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-700 w-full sm:w-auto">
    Search
  </button>
</div>
      <div className="cart-icon fixed top-16 right-6 cursor-pointer flex items-center" onClick={toggleCart}>
        <FaShoppingCart className="text-blue-600 text-2xl" />
        <span className="cart-count bg-red-500 text-white text-xs px-2 py-1 rounded-full ml-1">{cart.length}</span>
      </div>

      {cartOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75 z-50">
          <div className="bg-white p-4 rounded-lg max-w-md w-full relative">
            <button className="absolute top-2 right-2 text-gray-600 hover:text-gray-800" onClick={closeCart}>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <h3 className="text-lg font-semibold mb-4">Books in Cart:</h3>
            <ul>
              {cart.map((item, index) => (
                <li key={item.book._id} className="mb-2">
                  <div className="flex justify-between items-center">
                    <span>{index + 1}. {item.book.bookTitle}</span>
                    <p className="mr-4"> {item.book.authorName}</p>
                    <button className="text-red-500" onClick={() => removeItemFromCart(item.book._id)}>Remove</button>
                  </div>
                </li>
              ))}
            </ul>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Borrow Date:</label>
                <DatePicker
                  selected={checkout.borrowDate}
                  onChange={(date) => setCheckout({ ...checkout, borrowDate: date })}
                  selectsStart
                  startDate={checkout.borrowDate}
                  endDate={checkout.returnDate}
                  dateFormat="yyyy-MM-dd"
                  className="w-full border p-2 rounded"
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Return Date:</label>
                <DatePicker
                  selected={checkout.returnDate}
                  onChange={(date) => setCheckout({ ...checkout, returnDate: date })}
                  selectsEnd
                  startDate={checkout.borrowDate}
                  endDate={calculateMaxReturnDate(checkout.borrowDate, localStorage.getItem('role'))}
                  minDate={checkout.borrowDate}
                  maxDate={calculateMaxReturnDate(checkout.borrowDate, localStorage.getItem('role'))} // Add maxDate attribute
                  dateFormat="yyyy-MM-dd"
                  className="w-full border p-2 rounded"
                />
              </div>
              <button type="submit" className="block w-full mt-4 text-center bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600">Checkout</button>
            </form>
          </div>
        </div>
      )}

      {books && books.length > 0 && (
        <div className="search-result">
          {books.map((book) => (
            <div className="result-item" key={book._id}>
              <Card>
                <img src={book.bookImageUrl} alt="" />
                <h5 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                  <p className="font-normal text-black">{book.bookTitle}</p>
                </h5>
                <p className="font-normal text-gray-700 dark:text-gray-400">{book.category}</p>
                <p className="font-normal text-black">{book.bookDescription}</p>
                <button className="text-base bg-green-500 rounded-sm mt-2 font-bold">{book.status}</button>

                <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold mt-4 py-2 px-4 rounded" onClick={() => addToCart(book)}>Borrow Me</button>
              </Card>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdvanceSearch;
