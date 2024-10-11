import React, { useState, useEffect } from "react";
import { useRecoilState } from "recoil";
import axios from "axios";
import userAtom from "../state/userAtom";
import toast from "react-hot-toast";
import Spinner from "../components/Spinner.jsx";
import { useNavigate } from "react-router-dom";

const HomePage = () => {
  const [userData, setUserData] = useRecoilState(userAtom);
  const [loading, setLoading] = useState(true);
  const [batch, setBatch] = useState("R20");
  const [searchBy, setSearchBy] = useState("ID");
  const [inputValue, setInputValue] = useState("");
  const [users, setUsers] = useState([]);
  const [ids, setIds] = useState([]);
  const [names, setNames] = useState([]);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [filtered, setFiltered] = useState([]);
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
        setLoading(false);
      }
    } else {
      toast.error("Please login to continue");
      setLoading(false);
      navigate("/login");
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`/${batch}/`);
      console.log(res);
      setUsers(res.data.data);
    } catch (err) {
      console.log(err.message);
    }
  };

  const fetchUserData = async () => {
    try {
      const res = await axios.get(`/${batch}/?${searchBy}=${inputValue}`);
      console.log(res);
    } catch (err) {
      console.log(err.message);
    }
  };

  useEffect(() => {
    verify();
    fetchUsers();
  }, []);

  useEffect(() => {
    console.log(users);
    if (users.length) {
      const userIds = users.map((user) => user.ID);
      setIds(userIds);

      const userNames = users.map((user) => user?.NAME);
      setNames(userNames);
    }

    console.log(ids);
    console.log(names);
  }, [users]);

  useEffect(() => {
    if (inputValue) {
      let filtered;
      if (searchBy == "ID")
        filtered = ids.filter((id) => id.startsWith(inputValue));
      else
        filtered = names.filter((name) =>
          name.toLowerCase().includes(inputValue.toLowerCase())
        );

      setFiltered(filtered);
      setDropdownVisible(filtered.length > 0);
    } else {
      setDropdownVisible(false);
    }
  }, [inputValue, ids, names]);

  const handleSelectValue = (value) => {
    setInputValue(value);
    setDropdownVisible(false);
    fetchUserData();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center min-h-screen p-4">
      <div className="mb-6 flex space-x-8">
        <div className="flex items-center">
          <p className="font-semibold text-lg mr-2 md:text-lg">Batch:</p>
          <select
            value={batch}
            onChange={(e) => setBatch(e.target.value)}
            className="border border-gray-300 rounded p-2 bg-white shadow-md transition duration-200 ease-in-out focus:ring-2 focus:ring-blue-400 focus:outline-none"
          >
            <option value="R20">R20</option>
            <option value="N20">N20</option>
          </select>
        </div>
        <div className="flex items-center">
          <p className="font-semibold text-lg mr-2 md:text-lg">Search:</p>
          <select
            value={searchBy}
            onChange={(e) => setSearchBy(e.target.value)}
            className="border border-gray-300 rounded p-2 bg-white shadow-md transition duration-200 ease-in-out focus:ring-2 focus:ring-blue-400 focus:outline-none"
          >
            <option value="ID">ID</option>
            <option value="NAME">NAME</option>
          </select>
        </div>
      </div>
      <div className="relative w-full max-w-md">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onFocus={() => setDropdownVisible(true)}
          placeholder={`Enter ${searchBy} of ${batch}`}
          className="border border-gray-300 rounded p-3 w-full bg-white shadow-md transition duration-200 ease-in-out focus:ring-2 focus:ring-blue-400 focus:outline-none"
        />
        {dropdownVisible && (
          <ul className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg">
            {filtered.map((value) => (
              <li
                key={value}
                onClick={() => handleSelectValue(value)}
                className="cursor-pointer p-2 hover:bg-blue-100"
              >
                {value}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default HomePage;
