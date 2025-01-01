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
  const [showFilter, setShowFilter] = useState(false);
  const [filters, setFilters] = useState({
    minDate: "",
    maxDate: "",
    caste: [],
    puc: "",
    engg: ""
  });
  const [hideBro, setHideBro] = useState(import.meta.env.VITE_U1);
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

  const handleFilterChange = () => {

  };

  return (
    <div className="min-h-screen p-4 relative">
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
              size={20}
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
            <option value="n20">N20</option>
          </select>

          <button className="rounded p-2 flex items-center justify-center transition duration-200">
            <ImFilter className="h-5 w-5" onClick={() => setShowFilter(true)} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 justify-items-center">
        {users.map((user, index) =>
          !hideBro.includes(user.ID) ? (
            <div
              key={index}
              className="bg-white p-4 rounded-lg shadow-lg w-64 h-auto flex flex-col justify-between"
            >
              <div className="h-40 bg-gray-100 rounded-lg mb-2 flex items-center justify-center">
                {batch == "n20" && (
                  <span className="text-black">Coming Soon</span>
                )}
                {batch == "r20" && (
                  <img
                    src={`https://raw.githubusercontent.com/pythonista69/r20/main/images/${user.ID}.jpg`}
                    alt={user.NAME}
                    className="w-full h-full object-contain max-h-60"
                  />
                )}
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-1">
                  {user.NAME || "Unknown User"}
                </h3>
                <p className="text-gray-700 mb-1 font-semibold">
                  ID: {user.ID}
                </p>
                <p className="text-gray-600 mb-1">
                  Gender: {user.GENDER || "Not specified"}
                </p>
                <p className="text-gray-600 mb-1">
                  DOB:{" "}
                  {user.DOB
                    ? user.DOB.includes("-")
                      ? new Date(
                          user.DOB.split("-").reverse().join("/")
                        ).toLocaleDateString()
                      : new Date(
                          user.DOB.split("/").reverse().join("/")
                        ).toLocaleDateString()
                    : "Not available"}
                </p>
                <p className="text-gray-600">
                  Branch: {user.BRANCH || "Not specified"}
                </p>
              </div>
            </div>
          ) : null
        )}
      </div>

      {/* Filter Modal */}
      {showFilter && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowFilter(false)}
        >
          <div
            className="bg-white rounded-lg shadow-lg p-6 w-full max-w-xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-semibold mb-4 border-b pb-2">
              Filter
            </h2>

            <div className="space-y-4">
              
              <div className="mb-4">
                <label className="text-gray-700 font-semibold">
                  DOB
                </label>
                <div className="flex items-center space-x-2 mt-2">
                  <input
                    type="date"
                    placeholder="Min"
                    className="border p-2 w-25"
                    onChange={(e) =>
                      handleFilterChange("minDate", e.target.value)
                    }
                  />
                  <span>-</span>
                  <input
                    type="date"
                    placeholder="Max"
                    className="border p-2 w-25"
                    onChange={(e) =>
                      handleFilterChange("maxDate", e.target.value)
                    }
                  />
                </div>
              </div>

              {/* Brand Filter */}
              <div className="mb-4">
                <label className="text-gray-700 font-semibold">Caste</label>
                <div className="flex flex-wrap mt-2">
                  {["OC", "EWS", "BC-A", "BC-B", "BC-C", "BC-D", "BC-E", "SC", "ST"].map((caste) => (
                    <label
                      key={caste}
                      className="flex items-center space-x-1 mr-4"
                    >
                      <input
                        type="checkbox"
                        onChange={(e) => handleFilterChange("caste", caste)}
                        className="form-checkbox"
                      />
                      <span>{caste}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <label className="text-gray-700 font-semibold">Bramch</label>
                <div className="flex flex-wrap mt-2">
                  {["CSE", "ECE", "EEE", "CIVIL", "MECH", "CHE", "MME"].map((branch) => (
                    <label
                      key={branch}
                      className="flex items-center space-x-1 mr-4"
                    >
                      <input
                        type="checkbox"
                        onChange={(e) => handleFilterChange("branch", branch)}
                        className="form-checkbox"
                      />
                      <span>{branch}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Ratings Filter */}
              <div className="mb-4">
                <label className="text-gray-700 font-semibold">Ratings</label>
                <div className="flex flex-wrap mt-2">
                  {[4, 3, 2, 1].map((rating) => (
                    <label
                      key={rating}
                      className="flex items-center space-x-1 mr-4"
                    >
                      <input
                        type="checkbox"
                        onChange={(e) => handleFilterChange("rating", rating)}
                        className="form-checkbox"
                      />
                      <span>{rating} & Up</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <label className="text-gray-700 font-semibold">
                  Gender
                </label>
                <select
                  className="border p-2 w-full rounded"
                  onChange={(e) =>
                    handleFilterChange("gender", e.target.value)
                  }
                >
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">FeMale</option>
                </select>
              </div>
            </div>

            <div className="mt-4 flex justify-between">
              <button
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition duration-200"
                onClick={() => setShowFilter(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition duration-200"
                onClick={() => {
                  setShowFilter(false);
                  // Apply Filters
                }}
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExplorePage;
