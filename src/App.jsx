import MyFooter from "./components/footer/MyFooter";
import Navbar from "./components/navbar/Navbar";
import {  Toaster } from "react-hot-toast";
import MyRoutes from "./components/routes/MyRoutes";
function App() {
  return (
    <>
    <Navbar />
      <Toaster position="top-center" toastOptions={(2000)} />
      <MyRoutes/>
      <div className="mt-40">
      <MyFooter />
      </div>
    </>
  );
}

export default App;
