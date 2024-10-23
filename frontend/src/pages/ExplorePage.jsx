import React, { useState, useEffect, useRef } from "react";
import { useRecoilState } from "recoil";
import axios from "axios";
import userAtom from "../state/userAtom";
import toast from "react-hot-toast";
import Spinner from "../components/Spinner.jsx";
import { useNavigate } from "react-router-dom";

const ExplorePage = () => {
  const [userData, setUserData] = useRecoilState(userAtom);
  const [loading, setLoading] = useState(true);
  const [batch, setBatch] = useState("r20");
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      <div className="flex justify-center items-center mb-6">
        <p className="font-semibold text-lg mr-2">Batch:</p>
        <select
          value={batch}
          onChange={(e) => setBatch(e.target.value)}
          className="border border-gray-300 rounded p-2 bg-white shadow-md transition duration-200 ease-in-out focus:ring-2 focus:ring-blue-400 focus:outline-none"
        >
          <option value="r20">R20</option>
          <option value="n20">N20</option>
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 justify-items-center">
        {users.map((user, index) => (
          <div key={index} className="bg-white p- rounded-lg shadow-lg w-60 mt-6">
            <h3 className="text-lg font-bold text-gray-800 mb-2">
              {user.NAME || "Unknown User"}
            </h3>
            <p className="text-lg font-bold text-gray-700 mb-2">ID: {user.ID}</p>
            <p className="text-gray-600 mb-1">
              Gender: {user.GENDER || "Not specified"}
            </p>
            <p className="text-gray-600 mb-1">
              DOB:{" "}
              {user.DOB
                ? new Date(user.DOB).toLocaleDateString()
                : "Not available"}
            </p>
            <p className="text-gray-600 mb-2">
              Branch: {user.BRANCH || "Not specified"}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExplorePage;
