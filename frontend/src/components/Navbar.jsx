import React, { useState } from "react";
import toast from "react-hot-toast";
import { useRecoilState } from "recoil";
import userAtom from "../state/userAtom.js";
import { FaBars, FaTimes, FaChartBar, FaUserCircle, FaPowerOff } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

function Navbar() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [userData, setUserData] = useRecoilState(userAtom);
  const navigate = useNavigate();

  const toggleDrawer = () => setIsDrawerOpen(!isDrawerOpen);

  const handleNavigation = (path) => {
    toggleDrawer();
    navigate(path);
  };

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

  return (
    <div className="flex">
      <div className="md:hidden p-4">
        <button onClick={toggleDrawer} className="focus:outline-none">
          {isDrawerOpen ? (
            <FaTimes className="h-8 w-8 text-gray-700" />
          ) : (
            <FaBars className="h-8 w-8 text-gray-700" />
          )}
        </button>
      </div>

      {isDrawerOpen && (
        <div
          className="fixed inset-0 bg-black opacity-50 md:hidden"
          onClick={toggleDrawer}
        ></div>
      )}

      <div
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-gray-800 p-4 transform md:transform-none 
        ${isDrawerOpen ? "translate-x-0" : "-translate-x-full"} transition-transform duration-300 ease-in-out md:block`}
      >
        <div className="text-white flex flex-col h-full">
          <div className="text-center text-xl font-bold mb-8">20</div>
          <ul className="flex-1 space-y-4">
            <li className="flex items-center space-x-4 cursor-pointer" onClick={() => handleNavigation("/")}>
              <FaUserCircle className="h-6 w-6 text-gray-300" />
              <span>Search</span>
            </li>
            <li className="flex items-center space-x-4 cursor-pointer" onClick={() => handleNavigation("/explore")}>
              <FaChartBar className="h-6 w-6 text-gray-300" />
              <span>Xplore</span>
            </li>
            <li className="flex items-center space-x-4 cursor-pointer" onClick={handleLogout}>
              <FaPowerOff className="h-6 w-6 text-gray-300" />
              <span>LogOut</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="flex-1 p-4 md:ml-64">
        <h1 className="flex items-center justify-center text-2xl font-bold">20</h1>
      </div>
    </div>
  );
}

export default Navbar;
