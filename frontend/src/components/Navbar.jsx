import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useRecoilState } from "recoil";
import userAtom from "../state/userAtom.js";
import {
  FaBars,
  FaTimes,
  FaChartBar,
  FaUserCircle,
  FaPowerOff,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Spinner from "./Spinner.jsx";
import axios from "axios";
import { FaHome } from "react-icons/fa";

function Navbar() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [userData, setUserData] = useRecoilState(userAtom);
  const [loading, setLoading] = useState(true);
  const [adminBro, setAdminBro] = useState(import.meta.env.VITE_ADMIN);
  const navigate = useNavigate();

  const toggleDrawer = () => setIsDrawerOpen(!isDrawerOpen);

  const handleNavigation = (path) => {
    toggleDrawer();
    navigate(path);
  };

  const verify = async () => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const res = await axios.get("/verify", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUserData(res.data.user);
      } catch (err) {
        console.log(err.message);
        localStorage.removeItem("token");
        setUserData(null);
        toast.error("Session expired. Please login again.");
      } finally {
        setLoading(false);
      }
    } else {
      toast.error("Please login to continue");
      setLoading(false);
      navigate("/login");
    }
  };

  useEffect(() => {
    verify();
  }, []);

  const handleLogout = () => {
    try {
      localStorage.removeItem("token");
      setUserData(null);
      toast.success("Logout successful");
      navigate("/login");
    } catch (error) {
      toast.error("Error while logging out");
      console.error("Logout failed", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {/* Mobile Menu Button */}
      <div className="md:hidden p-4 flex items-center justify-between bg-gray-100 shadow-md">
        <button onClick={toggleDrawer} className="focus:outline-none">
          {isDrawerOpen ? (
            <FaTimes className="h-8 w-8 text-gray-700" />
          ) : (
            <FaBars className="h-8 w-8 text-gray-700" />
          )}
        </button>

        {/* Home Icon */}
        <div className="flex items-center justify-center ">
          <FaHome
            className="h-8 w-8 text-black cursor-pointer"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          />
        </div>
      </div>

      {isDrawerOpen && (
        <div
          className="fixed inset-0 bg-black opacity-50 md:hidden"
          onClick={toggleDrawer}
        ></div>
      )}

      <div
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-gray-800 p-6 transform md:transform-none 
        ${isDrawerOpen ? "translate-x-0" : "-translate-x-full"}
        transition-transform duration-300 ease-in-out md:block`}
      >
        <div className="text-white flex flex-col h-full">
          <div
            className="text-center text-xl font-bold mb-5 tracking-wide font-sans cursor-pointer"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            <FaHome className="h-6 w-6 text-white" />
          </div>

          <ul className="flex-1 space-y-3">
            <li
              className="flex items-center space-x-3 p-3 cursor-pointer hover:bg-gray-700 rounded-lg transition-colors duration-200"
              onClick={() => handleNavigation("/")}
            >
              <FaUserCircle className="h-6 w-6 text-gray-300" />
              <span className="text-sm font-semibold">Search</span>
            </li>

            <li
              className="flex items-center space-x-3 p-3 cursor-pointer hover:bg-gray-700 rounded-lg transition-colors duration-200"
              onClick={() => handleNavigation("/explore")}
            >
              <FaChartBar className="h-6 w-6 text-gray-300" />
              <span className="text-sm font-semibold">Xplore</span>
            </li>

            {adminBro.includes(userData.email) && (
              <li
                className="flex items-center space-x-3 p-3 cursor-pointer hover:bg-gray-700 rounded-lg transition-colors duration-200"
                onClick={() => handleNavigation("/dashboard")}
              >
                <FaChartBar className="h-6 w-6 text-gray-300" />
                <span className="text-sm font-semibold">DashBoard</span>
              </li>
            )}

            <li
              className="flex items-center space-x-3 p-3 cursor-pointer hover:bg-red-600 rounded-lg transition-colors duration-200"
              onClick={handleLogout}
            >
              <FaPowerOff className="h-6 w-6 text-red-400" />
              <span className="text-sm font-semibold">LogOut</span>
            </li>
          </ul>
        </div>
      </div>

      {!isDrawerOpen && (
  <div className="hidden md:block md:ml-64 pt-0 mt-4 mb-4">
    <h1
      className="flex items-center justify-center text-xl font-bold font-sans text-gray-800 cursor-pointer space-x-2"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
    >
      <FaHome className="h-6 w-6 text-black" />
    </h1>
  </div>
)}

    </div>
  );
}

export default Navbar;
