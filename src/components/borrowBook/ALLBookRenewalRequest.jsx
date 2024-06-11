import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const AllBookRenewalRequest = () => {
    const [bookRenewals, setBookRenewals] = useState([]);
    const [selectedIds, setSelectedIds] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const accessToken = localStorage.getItem('token');
                const response = await axios.get('https://fubk-lms-backend.onrender.com/api/admin/allrenewalbookrequest', {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json'
                    }
                });
                console.log(response.data);
                setBookRenewals(response.data);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, []);

    const handleCheckboxChange = (id) => {
        console.log('Request ID:', id); // Log the request ID to the console
        setSelectedIds((prevSelectedIds) =>
            prevSelectedIds.includes(id)
                ? prevSelectedIds.filter((item) => item !== id)
                : [...prevSelectedIds, id]
        );
    };

    const handleDelete = async () => {
        if (selectedIds.length === 0) {
            alert('Please select at least one request to delete.');
            return;
        }

        try {
            const accessToken = localStorage.getItem('token');
            await Promise.all(selectedIds.map(id => 
                axios.delete(`https://fubk-lms-backend.onrender.com/api/admin/acceptrenewalbookrequest/${id}`, {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json'
                    }
                })
            ));
            setBookRenewals((prevBookRenewals) =>
                prevBookRenewals.filter((bookRenewal) => !selectedIds.includes(bookRenewal._id))
            );
            setSelectedIds([]);
            toast.success('Successfully deleted the selected requests!');
        } catch (error) {
            console.error('Error deleting book renewals:', error);
        }
    };

    return (
        <div className="overflow-x-auto">
            <h1 className="text-2xl font-bold bg-slate-600 text-white text-center uppercase mt-5 mb-10">Book Renewal Request</h1>
            <div className="shadow-md overflow-hidden bg-blue-300 border-b border-gray-200 sm:rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-2 sm:px-6 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">Serial Number</th>
                            <th className="px-2 sm:px-6 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">Email</th>
                            <th className="px-2 sm:px-6 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">Borrower ID</th>
                            <th className="px-2 sm:px-6 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">Book Title</th>
                            <th className="px-2 sm:px-6 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">Role</th>
                            <th className="px-2 sm:px-6 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">Accept</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {bookRenewals.map((item, index) => (
                            <tr key={item._id} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                                <td className="px-2 sm:px-6 py-4 whitespace-nowrap">{index + 1}</td>
                                <td className="px-2 sm:px-6 py-4 whitespace-nowrap">{item.email}</td>
                                <td className="px-2 sm:px-6 py-4 whitespace-nowrap">{item.borrowerId}</td>
                                <td className="px-2 sm:px-6 py-4 whitespace-nowrap">{item.bookTitle}</td>
                                <td className="px-2 sm:px-6 py-4 whitespace-nowrap">{item.role}</td>
                                <td className="px-2 sm:px-6 py-4 whitespace-nowrap">
                                    <label>
                                        <input
                                            type="checkbox"
                                            onChange={() => handleCheckboxChange(item._id)}
                                            className="form-checkbox"
                                            checked={selectedIds.includes(item._id)}
                                        />
                                    </label>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div className="text-center my-4">
                    <button onClick={handleDelete} className="bg-red-500 text-white px-4 py-2 rounded">Delete Selected</button>
                </div>
            </div>
        </div>
    );
};

export default AllBookRenewalRequest;
