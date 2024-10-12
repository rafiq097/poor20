import React, { useState, useEffect, useRef } from "react";
import { useRecoilState } from "recoil";
import axios from "axios";
import userAtom from "../state/userAtom";
import toast from "react-hot-toast";
import Spinner from "../components/Spinner.jsx";
import { useNavigate } from "react-router-dom";

const HomePage = () => {
  const [userData, setUserData] = useRecoilState(userAtom);
  const [loading, setLoading] = useState(true);
  const [batch, setBatch] = useState("r20");
  const [searchBy, setSearchBy] = useState("ID");
  const [inputValue, setInputValue] = useState("");
  const [users, setUsers] = useState([]);
  const [ids, setIds] = useState([]);
  const [names, setNames] = useState([]);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [filtered, setFiltered] = useState([]);
  const [data, setData] = useState([]);
  const [showData, setShowData] = useState(false);
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const [hideBro, setHideBro] = useState(import.meta.env.VITE_U1);
  console.log(hideBro);

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
      const token = localStorage.getItem("token");
      // if (batch === "") return;
      const res = await axios.get(`/${batch}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data.data);
    } catch (err) {
      console.log(err.message);
    }
  };

  const fetchSearchUserData = async (value) => {
    try {
      // inputRef.current.blur();
      const token = localStorage.getItem("token");
      const res = await axios.get(`/${batch}/?${searchBy}=${value}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setData(res.data.data[0]);
      setShowData(true);
      setDropdownVisible(false);
    } catch (err) {
      console.log(err.message);
    }
  };

  useEffect(() => {
    verify();
    fetchUsers();
  }, [batch, searchBy]);

  useEffect(() => {
    if (users.length) {
      const userIds = users.map((user) => user.ID);
      setIds(userIds);

      const userNames = users.map((user) => user?.NAME);
      setNames(userNames);
    }
  }, [users]);

  useEffect(() => {
    if (inputValue) {
      let filtered;
      if (searchBy === "ID")
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
    fetchSearchUserData(value);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center min-h-screen p-4 space-y-6">
      <div className="flex flex-row justify-center space-x-4 items-center mb-6 w-full">
        <div className="flex items-center">
          <p className="font-semibold text-lg mr-2">Batch:</p>
          <select
            value={batch}
            onChange={(e) => setBatch(e.target.value)}
            className="border border-gray-300 rounded p-2 bg-white shadow-md transition duration-200 ease-in-out focus:ring-2 focus:ring-blue-400 focus:outline-none"
          >
            {/* <option value="">Select</option> */}
            <option value="r20">R20</option>
            <option value="n20">N20</option>
          </select>
        </div>
        <div className="flex items-center">
          <p className="font-semibold text-lg mr-2">Search:</p>
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
          // ref={inputRef}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          // onFocus={() => setDropdownVisible(true)}
          placeholder={`Enter ${searchBy} in ${batch.toUpperCase()}`}
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

      {console.log(showData, data)}
      {showData &&
        (hideBro.includes(data.ID) ? (
          <p className="text-2xl font-bold mb-4 text-center">
            Why vro &#x1F614;
          </p>
        ) : (
          <div className="container mx-auto p-4 flex justify-center">
            <div className="overflow-x-auto max-w-lg">
              <h2 className="text-2xl font-bold mb-4 text-center">{data.ID}</h2>
              <table className="min-w-full bg-white border rounded-lg">
                <tbody>
                  {Object.entries(data || {}).map(([key, value]) => {
                    if (
                      key === "#" ||
                      key === "_id" ||
                      key === "__v" ||
                      key === "createdAt" ||
                      key === "updatedAt" ||
                      key === "Image" ||
                      key === "CET_NO" ||
                      key === "SSC_NO" ||
                      !value
                    )
                      return null;
                    return (
                      <tr key={key} className="border-b">
                        <td className="px-4 py-2 text-sm font-medium text-gray-600 uppercase bg-gray-100">
                          {key.replace(/_/g, " ")}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-900">
                          {value ?? "N/A"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ))}
    </div>
  );
};

export default HomePage;
