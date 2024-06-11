import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

function UserBorrowHistory() {
  const [data, setData] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const storedUserId = localStorage.getItem('user_id');
    console.log("StoredUserId:", storedUserId);
    fetchData(storedUserId);
  }, []); // Use an empty dependency array to ensure this runs only once on mount

  const fetchData = async (userId) => {
    console.log(userId);
    if (!userId) {
      setError('No User found with this ID.');
      toast.error('No User found with this ID.');
      return;
    }

    try {
      const accessToken = localStorage.getItem('token');
      const response = await axios.get(`https://fubk-lms-backend.onrender.com/api/users/borrowersHistory/${userId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Accept': 'application/json'
        }
      });

      const borrowerData = response.data;
      // Check if borrowerData contains the expected data
      if (!borrowerData || !borrowerData.cart || borrowerData.cart.length === 0) {
        setError('No data found for this Id.');
        toast.error('No data found for this Id.');
        return;
      }

      // Update the email in localStorage if it has changed
      if (borrowerData.userId !== userId) {
        localStorage.setItem('borrowerId', borrowerData.userId);
      }

      const borrowerId = borrowerData._id;
      localStorage.setItem('borrowerId', borrowerId);
      console.log(borrowerId);

      const formattedData = borrowerData.cart.map((item, index) => ({
        id: index,
        email: item.borrower.email,
        phoneNo: item.borrower.phoneNo,
        role: item.borrower.role,
        bookTitle: item.book.bookTitle,
        authorName: item.book.authorName,
        bookId: item.book._id,
        borrowDate: item.checkoutForm.borrowDate,
        returnDate: item.checkoutForm.returnDate,
        status: item.status // assuming there's a status field in your data
      }));

      setData(formattedData);
      setError('');
    } catch (error) {
      if (error.response) {
        if (error.response.status === 404) {
          setError('No Users Record Found.');
          toast.error('No Users Record Found.');
        } else if (error.response.status === 500) {
          setError('Server error occurred. Please try again later.');
          toast.error('Server error occurred. Please try again later.');
        } else {
          setError('An error occurred while fetching data.');
          toast.error('An error occurred while fetching data.');
        }
      } else {
        console.error('Error fetching data:', error);
        setError('An error occurred while fetching data.');
        toast.error('An error occurred while fetching data.');
      }
    }
  };

  return (
    <div className="px-4 py-10">
      <h2 className="text-lg text-blue-500 text-center font-bold mb-2">User Books Borrow History:</h2>
      {error && (
        <div className="text-red-500">{error}</div>
      )}
      {data.length > 0 && (
        <div>
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr>
                  <th className="px-2 py-2">Serial Number</th>
                  <th className="px-2 py-2">Email</th>
                  <th className="px-2 py-2">Phone Number</th>
                  <th className="px-2 py-2">Role</th>
                  <th className="px-2 py-2">Book Title</th>
                  <th className="px-2 py-2">Author Name</th>
                  <th className="px-2 py-2">Status</th>
                  <th className="px-2 py-2">Borrow Date</th>
                  <th className="px-2 py-2">Return Date</th>
                  <th className="px-2 py-2">Action</th>
                  <th className="px-2 py-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {data.map((item, index) => (
                  <tr key={item.id} className="text-xs sm:text-sm">
                    <td className="border px-2 py-2">{index + 1}</td>
                    <td className="border px-2 py-2">{item.email}</td>
                    <td className="border px-2 py-2">{item.phoneNo}</td>
                    <td className="border px-2 py-2">
                      <button className="text-xs sm:text-sm bg-blue-500 text-white rounded-sm py-1 px-2 font-bold" disabled>
                        {item.role.toUpperCase()}
                      </button>
                    </td>
                    <td className="border px-2 py-2">{item.bookTitle}</td>
                    <td className="border px-2 py-2">{item.authorName}</td>
                    <td className="border px-2 py-2">
                      <button disabled className={`text-xs sm:text-sm text-white rounded-sm py-1 px-2 font-bold ${item.status === 'pending' ? 'bg-yellow-500' : 'bg-green-500'}`}>
                        {item.status.toUpperCase()}
                      </button>
                    </td>
                    <td className="border px-2 py-2">{item.borrowDate.slice(0, 10)}</td>
                    <td className="border px-2 py-2">{item.returnDate.slice(0, 10)}</td>
                    <td className="border px-4 py-2">
                    <a className="text-xs sm:text-sm bg-green-600 hover:bg-green-700 text-white rounded-md py-1 px-3 font-bold transition duration-300 ease-in-out" href='/user/returnbookrequest'>
                    Return Book
                    </a>
                    </td>
                    <td className="border px-4 py-2">
                    <a className="text-xs sm:text-sm bg-green-600 hover:bg-green-700 text-white rounded-md py-1 px-3 font-bold transition duration-300 ease-in-out" href='/user/bookrenewalrequest'>
                    Book Renewal
                    </a>
                    </td>
                    {localStorage.setItem("bookId", item.bookId)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserBorrowHistory;
