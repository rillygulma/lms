import { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const AllBorrowBookRequest = () => {
  const [borrowers, setBorrowers] = useState([]);
  const [editStatusId, setEditStatusId] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [borrowersId, setBorrowersId] = useState(localStorage.getItem('borrowerId') || '');

  useEffect(() => {
    const handleStorageChange = () => {
      setBorrowersId(localStorage.getItem('borrowerId'));
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  useEffect(() => {
    fetchBorrowers();
  }, [borrowersId]);

  const fetchBorrowers = async () => {
    try {
      const accessToken = localStorage.getItem('token');
      const response = await axios.get('https://fubk-lms-backend.onrender.com/api/user/allborrowers', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });
      const allBorrowers = response.data.flatMap(item => item.cart);
      console.log(allBorrowers);
      setBorrowers(allBorrowers);
    } catch (error) {
      console.error('Error fetching borrowers:', error);
    }
  };

  const updateStatus = async (borrowerId, bookId, status) => {
    try {
      const accessToken = localStorage.getItem('token');
      await axios.put(
        `https://fubk-lms-backend.onrender.com/api/admin/acceptborrowRequest/${borrowerId}/${bookId}`,
        { status },
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );
      fetchBorrowers();
      toast.success("Status updated successfully");
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error("Failed to update status");
    }
  };

  const sendMessage = async (borrowerId, messageContent) => {
    try {
      const accessToken = localStorage.getItem('token');
      await axios.post(
        `https://fubk-lms-backend.onrender.com/api/messages/send`,
        { borrowerId, message: messageContent },
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );
      toast.success("Message sent successfully");
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error("Failed to send message");
    }
  };

  const handleStatusChange = (e) => {
    setSelectedStatus(e.target.value);
  };

  const handleEditClick = (borrower) => {
    setEditStatusId(borrower._id);
    setSelectedStatus(borrower.status);
  };

  const handleSaveClick = (borrower) => {
    updateStatus(borrowersId, borrower.book._id, selectedStatus);
    setEditStatusId(null);
  };

  const handleSendMessageClick = (borrower) => {
    const userMessage = prompt("Enter your message:");
    if (userMessage) {
      sendMessage(borrower.borrower._id, userMessage);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-xl font-bold text-white text-center bg-slate-600 mb-4 uppercase">Borrowers Requests</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-blue-300 font-MyFont border border-gray-300">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b">#</th>
              <th className="py-2 px-4 border-b">Name</th>
              <th className="py-2 px-4 border-b">Email</th>
              <th className="py-2 px-4 border-b">Phone No</th>
              <th className="py-2 px-4 border-b">Role</th>
              <th className="py-2 px-4 border-b">Book Title</th>
              <th className="py-2 px-4 border-b">Return Date</th>
              <th className="py-2 px-4 border-b">Status</th>
              <th className="py-2 px-4 border-b">Action</th>
              <th className="py-2 px-4 border-b">Message</th>
            </tr>
          </thead>
          <tbody>
            {borrowers.map((borrower, index) => (
              <tr key={borrower._id}>
                <td className="py-2 px-4 border-b">{index + 1}</td>
                <td className="py-2 px-4 border-b">{borrower.borrower.fullName}</td>
                <td className="py-2 px-4 border-b">{borrower.borrower.email}</td>
                <td className="py-2 px-4 border-b">{borrower.borrower.phoneNo}</td>
                <td className="py-2 px-4 border-b uppercase">{borrower.borrower.role}</td>
                <td className="py-2 px-4 border-b">{borrower.book.bookTitle}</td>
                <td className="py-2 px-4 border-b">{borrower.checkoutForm.returnDate.slice(0, 10)}</td>
                <td className="py-2 px-4 border-b">
                  {editStatusId === borrower._id ? (
                    <select
                      value={selectedStatus}
                      onChange={handleStatusChange}
                      className="p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm"
                    >
                      <option value="pending">Pending</option>
                      <option value="accepted">Accepted</option>
                      <option value="overdue">Overdue</option>
                    </select>
                  ) : (
                    borrower.status
                  )}
                </td>
                <td className="py-2 px-4 border-b">
                  {editStatusId === borrower._id ? (
                    <button
                      onClick={() => handleSaveClick(borrower)}
                      className="bg-green-500 text-white px-4 py-2 rounded"
                    >
                      Save
                    </button>
                  ) : (
                    <button
                      onClick={() => handleEditClick(borrower)}
                      className={`px-4 py-2 rounded ${borrower.status === 'accepted' ? 'bg-gray-500 cursor-not-allowed' : 'bg-blue-500'}`}
                      disabled={borrower.status === 'accepted'}
                    >
                      {borrower.status === 'accepted' ? 'Edited' : 'Edit'}
                    </button>
                  )}
                </td>
                <td className="py-2 px-4 border-b">
                  <button
                    onClick={() => handleSendMessageClick(borrower)}
                    className="bg-yellow-500 text-white px-4 py-2 rounded"
                  >
                    Message
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AllBorrowBookRequest;
