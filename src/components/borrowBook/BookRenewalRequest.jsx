import { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const BookRenewalRequest = () => {
  const [formData, setFormData] = useState({
    email: '',
    borrowerId: '',
    bookTitle: '',
    role: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const storedRole = localStorage.getItem('role');
    if (formData.role !== storedRole) {
      toast.error('Please select your correct role!');
      return; // Prevent form submission
    }
  
    try {
      const accessToken = localStorage.getItem('token');
      const response = await axios.post('https://fubk-lms-backend.onrender.com/api/users/renewalbookrequest', formData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        }
      });
      console.log('Successfully:', response.data);
      
      // Clear form data
      setFormData({
        email: '',
        borrowerId: '',
        bookTitle: '',
        role: ''
      });
  
      // Optionally, show a success message
      toast.success('Renewal request submitted successfully!');
    } catch (error) {
      console.error('There was an error!', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className='bg-blue-300 max-w-md mx-auto mt-8 p-4 border rounded-lg shadow-md'>
      <div className="mb-4">
      <h1 className="text-2xl font-bold text-center mt-5 mb-10">Book Renewal Request</h1>
        <label className="block text-sm font-medium text-gray-700">Book Title:</label>
        <input
          type="text"
          name="bookTitle"
          placeholder='Paste Your Book Title Here.'
          value={formData.bookTitle}
          onChange={handleChange}
          required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Borrower ID:</label>
        <input
          type="text"
          name="borrowerId"
          value={localStorage.getItem('borrowerId')}
          onChange={handleChange}
          required
          disabled
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Email:</label>
        <input
          type="email"
          name="email"
          value={localStorage.getItem('email')}
          onChange={handleChange}
          required
          disabled
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Role:</label>
        <select
          name="role"
          value={localStorage.getItem('role')}
          onChange={handleChange}
          required
          disabled
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        >
          <option value="staff">Staff</option>
          <option value="student">Student</option>
        </select>
      </div>
      <button type="submit" className="w-full py-2 px-4 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500">
        Submit
      </button>
    </form>
  );
};

export default BookRenewalRequest;
