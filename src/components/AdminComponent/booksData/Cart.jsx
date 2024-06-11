import { FaShoppingCart } from 'react-icons/fa';

const Cart = ({ count }) => {
  return (
    <div className="fixed bottom-0 mb-20 right-3 p-4 bg-blue-500 rounded-t-lg shadow-lg">
        <FaShoppingCart className="text-gray-600 text-2xl" />
      {count > 0 && (
        <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs absolute -top-1 -right-1 transform -translate-y-full">
          {count}
        </span>
      )}
    </div>
  );
};

export default Cart;
