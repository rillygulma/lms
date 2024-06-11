import logo from "./fubk-logo.jpg";

const MyFooter = () => {
  return (
    <footer className="bg-white rounded-lg shadow dark:bg-gray-900 mx-4 my-6">
      <div className="w-full max-w-screen-xl mx-auto p-4 md:py-8">
        <div className="sm:flex sm:items-center sm:justify-between">
          <a href="https://flowbite.com/" className="flex items-center mb-4 sm:mb-0 space-x-3 rtl:space-x-reverse">
            <img src={logo} className="h-20 rounded" alt="Fubk Logo" />
            <span className="self-center text-2xl font-MyFont font-semibold whitespace-nowrap dark:text-white">FUBK LMS</span>
          </a>
          <ul className="flex flex-wrap items-center mb-6 text-sm font-medium text-gray-500 sm:mb-0 dark:text-gray-400">
            <li>
              <a href="#" className="hover:underline mr-4 md:mr-6">About</a>
            </li>
            <li>
              <a href="#" className="hover:underline mr-4 md:mr-6">Privacy Policy</a>
            </li>
            <li>
              <a href="#" className="hover:underline mr-4 md:mr-6">Licensing</a>
            </li>
            <li>
              <a href="#" className="hover:underline">Contact</a>
            </li>
          </ul>
        </div>
        <hr className="my-6 border-gray-200 sm:mx-auto dark:border-gray-700 lg:my-8" />
        <span className="block text-sm text-gray-500 sm:text-center dark:text-gray-400">© 2023 <a href="" className="hover:underline">Rilwanu Idris™</a>. All Rights Reserved.</span>
      </div>
    </footer>
  );
}

export default MyFooter;
