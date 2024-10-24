import React, { useState, useEffect } from "react";
import { useRecoilState } from "recoil";
import axios from "axios";
import userAtom from "../state/userAtom";
import toast from "react-hot-toast";
import Spinner from "../components/Spinner.jsx";
import { useNavigate } from "react-router-dom";
import { ImFilter } from "react-icons/im";
import { CiCircleRemove } from "react-icons/ci";

const ExplorePage = () => {
  const [userData, setUserData] = useRecoilState(userAtom);
  const [loading, setLoading] = useState(true);
  const [batch, setBatch] = useState("r20");
  const [searchBy, setSearchBy] = useState("NAME");
  const [inputValue, setInputValue] = useState("");
  const [debouncedInput, setDebouncedInput] = useState(inputValue);
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();

  const verify = async () => {
    const token = localStorage.getItem("token");
    if (token) {
      setLoading(true);
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
        navigate("/login");
      } finally {
        setTimeout(() => {
          setLoading(false);
        }, 2000);
      }
    } else {
      toast.error("Please login to continue");
      setLoading(false);
      navigate("/login");
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.get(`/${batch}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data.data);
    } catch (err) {
      console.log(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    verify();
    fetchUsers();
  }, [batch]);

  const fetchSearchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.get(`/${batch}/?${searchBy}=${inputValue}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data.data);
    } catch (err) {
      console.log(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSearchUsers();
  }, [batch, searchBy, debouncedInput]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedInput(inputValue);
    }, 1000);

    return () => {
      clearTimeout(handler);
    };
  }, [inputValue]);

  // if (loading) {
  //   return (
  //     <div className="flex items-center justify-center h-screen">
  //       <Spinner />
  //     </div>
  //   );
  // }

  return (
    <div className="min-h-screen p-4">
      {loading && (
        <div className="flex justify-center items-center mt-4 mb-8">
          <Spinner className="h-8 w-8 animate-spin mb-4" />{" "}
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-center items-center mb-6 space-y-4 sm:space-y-0 sm:space-x-4">
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={`Enter ${searchBy} in ${batch.toUpperCase()}`}
            className="border border-gray-300 rounded p-2 pr-10 bg-white shadow-md
      transition duration-200 ease-in-out focus:ring-2 focus:ring-blue-400
      focus:outline-none w-full"
          />

          {inputValue && (
            <CiCircleRemove
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 cursor-pointer"
              size={20} // Adjust size as needed
              onClick={() => setInputValue("")}
            />
          )}
        </div>

        <div className="flex space-x-4 w-full sm:w-auto">
          <select
            value={searchBy}
            onChange={(e) => setSearchBy(e.target.value)}
            className="border border-gray-300 rounded p-2 bg-white shadow-md transition duration-200 ease-in-out focus:ring-2 focus:ring-blue-400 focus:outline-none w-full sm:w-32"
          >
            <option value="NAME">NAME</option>
            <option value="ID">ID</option>
          </select>

          <select
            value={batch}
            onChange={(e) => setBatch(e.target.value)}
            className="border border-gray-300 rounded p-2 bg-white shadow-md transition duration-200 ease-in-out focus:ring-2 focus:ring-blue-400 focus:outline-none w-full sm:w-32"
          >
            <option value="r20">R20</option>
            {/* <option value="n20">N20</option> */}
          </select>

          <button className="rounded p-2 flex items-center justify-center transition duration-200">
            <ImFilter className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 justify-items-center">
        {users.map((user, index) => (
          <div
            key={index}
            className="bg-white p-4 rounded-lg shadow-lg w-64 h-auto flex flex-col justify-between"
          >
            <div className="h-40 bg-gray-100 rounded-lg mb-2 flex items-center justify-center">
              {batch == "n20" && <span className="text-black">Coming Soon</span>}
              {batch == "r20" && <img
                src={`https://raw.githubusercontent.com/pythonista69/r20/main/images/${user.ID}.jpg`}
                alt={user.NAME}
                className="w-full h-full object-contain max-h-60"
              />}
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-1">
                {user.NAME || "Unknown User"}
              </h3>
              <p className="text-gray-700 mb-1 font-semibold">ID: {user.ID}</p>
              <p className="text-gray-600 mb-1">
                Gender: {user.GENDER || "Not specified"}
              </p>
              <p className="text-gray-600 mb-1">
                DOB:{" "}
                {user.DOB
                  ? new Date(
                      user.DOB.split("-").reverse().join("/")
                    ).toLocaleDateString()
                  : "Not available"}
              </p>
              <p className="text-gray-600">
                Branch: {user.BRANCH || "Not specified"}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExplorePage;
