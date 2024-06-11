import { useEffect, useState } from 'react';
import { Card } from 'flowbite-react';
import axios from 'axios';
import { FaShoppingCart } from 'react-icons/fa';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { toast } from 'react-hot-toast';

const AllBooks = () => {
  const [books, setBooks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkout, setCheckout] = useState({
    borrowDate: new Date(),
    returnDate: new Date(),
  });
  const [userHasBorrowed, setUserHasBorrowed] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const accessToken = localStorage.getItem('token');
        if (!accessToken) {
          throw new Error('User not logged in. Please log in to view this page.');
        }
        const response = await axios.get('https://fubk-lms-backend.onrender.com/api/users/allbooks', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        });
        const bookStatus = response.data.data.filter(book => book.status === 'borrowed');
        const bookStatusJSON = JSON.stringify(bookStatus);
        localStorage.setItem('bookStatus', bookStatusJSON);

        setBooks(response.data.data);
        console.log(response.data.data);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error(error.response?.data?.message || 'User not logged in. Please log in to view these books.');
      }
    };

    const checkUserBorrowStatus = async () => {
      const userId = localStorage.getItem('user_id');
      const hasBorrowed = await checkIfUserHasBorrowed(userId);
      setUserHasBorrowed(hasBorrowed);
    };

    fetchData();
    checkUserBorrowStatus();
  }, []);

  const handleTyping = (event) => {
    setSearchTerm(event.target.value.toLowerCase());
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
        return;
      }

      // Check if the book status is "borrowed"
      const bookStatusJSON = localStorage.getItem('bookStatus');
      const bookStatus = JSON.parse(bookStatusJSON);
      const isBookBorrowed = bookStatus.some(item => item._id === book._id && item.status === 'borrowed');
      if (isBookBorrowed) {
        toast.error('This book has already been borrowed.');
        return;
      }

      await axios.put(`https://fubk-lms-backend.onrender.com/api/admin/updatebook/${book._id}`, { status: 'pending' }, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });
      setCart((prevCart) => [...prevCart, { book, borrower }]);
    } catch (error) {
      console.error('Error updating book status:', error.response?.data?.message || error.message);
      toast.error('Error updating book status. Please try again.');
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
      console.error('Error updating book status:', error.response?.data?.message || error.message);
      toast.error('Error updating book status. Please try again.');
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
      const userId = localStorage.getItem('user_id');

      const hasAlreadyBorrowed = await checkIfUserHasBorrowed(userId);
      if (hasAlreadyBorrowed) {
        toast.error('You have already borrowed a book. Please return the book before borrowing another one');
        return;
      }

      const dataToSave = {
        cart: cart.map((item) => ({
          ...item,
          checkoutForm: {
            ...checkout,
            returnDate: calculateMaxReturnDate(checkout.borrowDate, item.borrower.role),
          },
        })),
        userId,
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
      console.error('Error submitting data:', error.response?.data?.message || error.message);
      toast.error('Error submitting borrowing request. Please try again.');
    }
  };

  const checkIfUserHasBorrowed = async (userId) => {
    try {
      const accessToken = localStorage.getItem('token');
      const response = await axios.get(`https://fubk-lms-backend.onrender.com/api/users/borrowersHistory/${userId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });
      console.log(response.data);
      return response.data.length > 0;
    } catch (error) {
      console.error('Error checking if user has borrowed:', error.response?.data?.message || error.message);
      return false;
    }
  };

  const filteredBooks = books.filter(book =>
    book.bookTitle.toLowerCase().includes(searchTerm) ||
    book.authorName.toLowerCase().includes(searchTerm) ||
    book.category.toLowerCase().includes(searchTerm)
  );

  return (
    <div className="mt-28 px-4 lg:px-24 relative">
      <button disabled className="bg-blue-500 hover:bg-blue-700 text-white font-bold mr-3 py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition ease-in-out duration-300">
        Dynamic Search Here ?
      </button>

      <input
        id="search"
        type="text"
        className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
        placeholder="Search your books here"
        value={searchTerm}
        onChange={handleTyping}
      />

      <h2 className="text-5xl sm:mt-10 mb-10 font-bold text-center">All Books are here</h2>

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
                    <p className="mr-4">{item.book.authorName}</p>
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
                  maxDate={calculateMaxReturnDate(checkout.borrowDate, localStorage.getItem('role'))}
                  dateFormat="yyyy-MM-dd"
                  className="w-full border p-2 rounded"
                />
              </div>
              <button type="submit" className="block w-full mt-4 text-center bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600">Checkout</button>
            </form>
          </div>
        </div>
      )}

      {filteredBooks && filteredBooks.length > 0 && (
        <div className="search-result grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBooks.map((book) => (
            <div className="result-item" key={book._id}>
              <Card>
                <img
                  src={book.bookImageUrl}
                  alt={book.bookTitle}
                  className="w-full lg:w-1/2 mx-auto"
                />
                <h5 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                  {book.bookTitle}
                </h5>
                <p className="font-normal text-gray-700 dark:text-gray-400">{book.category}</p>
                <p className="font-normal text-black">{book.bookDescription}</p>
                <button className={`text-base rounded-sm mt-2 font-bold uppercase ${book.status === 'available' ? 'bg-green-500' : 'bg-yellow-500'}`}>
                  {book.status}
                </button>

                {book.status !== 'borrowed' && book.status !== 'pending' && !userHasBorrowed && (
                  <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold mt-4 py-2 px-4 rounded" onClick={() => addToCart(book)}>
                    GET IT
                  </button>
                )}
              </Card>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AllBooks;
