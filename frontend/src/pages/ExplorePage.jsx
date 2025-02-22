/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import { useRecoilState } from "recoil";
import axios from "axios";
import userAtom from "../state/userAtom";
import toast from "react-hot-toast";
import Spinner from "../components/Spinner.jsx";
import { useNavigate } from "react-router-dom";
import { ImFilter } from "react-icons/im";
import { CiCircleRemove } from "react-icons/ci";
import { FaTimes } from "react-icons/fa";

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
    sortBy: "",
    sortOrder: "",
    gender: "",
    caste: [],
    branch: [],
    pucMin: "",
    pucMax: "",
    enggMin: "",
    enggMax: "",
  });
  const [hideBro, setHideBro] = useState(import.meta.env.VITE_U1);
  const [admins, setAdmins] = useState(import.meta.env.VITE_ADMIN);
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
        // localStorage.removeItem("token");
        // setUserData(null);
        // toast.error("Session expired. Please login again.");
        // navigate("/login");
        toast.error("Please try again.");
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

    return () => clearTimeout(handler);
  }, [inputValue]);

  const fetchFilteredData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      let url = new URLSearchParams();
      Object.keys(filters).forEach((key) => {
        if (key == "sortBy" || key == "sortOrder") return;

        const value = filters[key];
        if (Array.isArray(value) && value.length > 0) {
          if (batch == "r20" || batch == "R20")
            url.append(key.toUpperCase(), value.join(","));
          else {
            let vals = value.map((v) => v.replace("-", ""));
            url.append(key.toUpperCase(), vals.join(","));
          }
        } else if (
          (key == "pucMin" ||
            key == "pucMax" ||
            key == "enggMin" ||
            key == "enggMax") &&
          value
        ) {
          const prefix = key.substring(0, key.length - 3).toUpperCase();
          const field = prefix == "PUC" ? "PUC_GPA" : "ENGG_AVG";
          const operator = key.endsWith("Min") ? ">=" : "<=";

          // url.append(`${field}${operator}`, value);
          const existingFilters = url.get("numericFilters") || "";
          const newFilter = `${field}${operator}${value}`;

          url.set(
            "numericFilters",
            existingFilters ? `${existingFilters},${newFilter}` : newFilter
          );
        } else if (value !== undefined && value !== null && value !== "") {
          url.append(key.toUpperCase(), value);
        }
      });

      if (filters.sortBy) {
        const sortPrefix = filters.sortOrder === "desc" ? "-" : "";
        url.append("sort", `${sortPrefix}${filters.sortBy}`);
      }

      url = url.toString();
      console.log(url);

      const res = await axios.get(`/${batch}/?${url}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // console.log(res);
      setUsers(res.data.data);
    } catch (err) {
      console.log(err.message);
    } finally {
      setLoading(false);
    }
  };

  // useEffect(() => {
  //   fetchFilteredData();
  // }, [filters]);

  const handleFilterChange = (filterName, value) => {
    if (filterName === "caste" || filterName === "branch") {
      setFilters((prevFilters) => {
        const currentValues = prevFilters[filterName];
        const updatedValues = currentValues.includes(value)
          ? currentValues.filter((item) => item !== value)
          : [...currentValues, value];
        return { ...prevFilters, [filterName]: updatedValues };
      });
    } else {
      setFilters((prevFilters) => ({
        ...prevFilters,
        [filterName]: value,
      }));
    }
  };

  const applyFilters = () => {
    console.log("Applied Filters:", filters);
    setShowFilter(false);
    fetchFilteredData();
  };

  return (
    <div className="min-h-screen p-4 relative">
      {loading && (
        <div className="flex justify-center items-center mt-4 mb-8">
          <Spinner className="h-8 w-8 animate-spin mb-4" />{" "}
        </div>
      )}

      <h3 className="flex items-center justify-center mb-2">
        Found {users.length} results
      </h3>

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
            {admins.includes(userData?.email) && (
              <option value="n20">N20</option>
            )}
          </select>

          <button className="rounded p-2 flex items-center justify-center transition duration-200">
            <ImFilter className="h-5 w-5" onClick={() => setShowFilter(true)} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 justify-items-center">
        {users?.map((user, index) =>
          !hideBro.includes(user.ID) || admins.includes(userData?.email) ? (
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
                  {user.num}) {user.NAME || "Unknown User"}
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
                <p className="text-gray-600 mb-1">
                  Branch: {user.BRANCH || "Not specified"}
                </p>
                <p className="text-gray-600 mb-1">
                  PUC: {user.PUC_GPA || "N/A"}
                </p>
                <p className="text-gray-600">ENGG: {user.ENGG_AVG || "N/A"}</p>

                {/* //delete this bro */}
                {admins.includes(userData?.email) && (
                  <p className="text-gray-600">SSC: {user.SSC_NO || "N/A"}</p>
                )}
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
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold mb-2 border-b pb-2">
                Filter
              </h2>
              <FaTimes
                className="h-8 w-8 text-black cursor-pointer"
                onClick={() => setShowFilter(false)}
              />
            </div>

            <div className="space-y-4">
              <div className="mb-2">
                <label className="text-gray-700 font-semibold">Sort By</label>
                <div className="flex items-center space-x-2">
                  <select
                    className="border p-2 w-40"
                    value={filters.sortBy || ""}
                    onChange={(e) =>
                      handleFilterChange("sortBy", e.target.value)
                    }
                  >
                    <option value="">Select Field</option>
                    <option value="ID">ID</option>
                    <option value="NAME">Name</option>
                    {batch == "r20" && <option value="PUC_GPA">PUC_GPA</option>}
                    {batch == "r20" && (
                      <option value="ENGG_AVG">ENGG_AVG</option>
                    )}
                  </select>
                  <select
                    className="border p-2 w-40"
                    value={filters.sortOrder || ""}
                    onChange={(e) =>
                      handleFilterChange("sortOrder", e.target.value)
                    }
                  >
                    <option value="">Select Order</option>
                    <option value="asc">Ascending</option>
                    <option value="desc">Descending</option>
                  </select>
                </div>
              </div>

              {/* // Gender */}
              <div className="mb-2">
                <label className="text-gray-700 font-semibold">Gender</label>
                <div className="flex items-center space-x-2">
                  <select
                    className="border p-2 w-40"
                    value={filters.gender || ""}
                    onChange={(e) =>
                      handleFilterChange("gender", e.target.value)
                    }
                  >
                    <option value="">Select</option>
                    <option value="MALE">MALE</option>
                    <option value="FEMALE">FEMALE</option>
                  </select>
                </div>
              </div>

              {/* Caste Filter */}
              <div className="mb-2">
                <label className="text-gray-700 font-semibold">Caste</label>
                <div className="flex flex-wrap">
                  {[
                    "OC",
                    "EWS",
                    "BC-A",
                    "BC-B",
                    "BC-C",
                    "BC-D",
                    "BC-E",
                    "SC",
                    "ST",
                  ].map((caste) => (
                    <label
                      key={caste}
                      className="flex items-center space-x-1 mr-4"
                    >
                      <input
                        type="checkbox"
                        checked={filters.caste?.includes(caste) || false}
                        onChange={() => handleFilterChange("caste", caste)}
                        className="form-checkbox"
                      />
                      <span>{caste}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Branch Filter */}
              <div className="mb-2">
                <label className="text-gray-700 font-semibold">Branch</label>
                <div className="flex flex-wrap">
                  {["CSE", "ECE", "EEE", "CIVIL", "MECH", "CHE", "MME"].map(
                    (branch) => (
                      <label
                        key={branch}
                        className="flex items-center space-x-1 mr-4"
                      >
                        <input
                          type="checkbox"
                          checked={filters.branch?.includes(branch) || false}
                          onChange={() => handleFilterChange("branch", branch)}
                          className="form-checkbox"
                        />
                        <span>{branch}</span>
                      </label>
                    )
                  )}
                </div>
              </div>

              {/* PUC GPA Filter */}
              {batch == "r20" && (
                <div className="mb-2">
                  <label className="text-gray-700 font-semibold">PUC GPA</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="10"
                      placeholder="Min GPA"
                      className="border p-2 rounded-md w-25"
                      value={filters.pucMin || ""}
                      onChange={(e) =>
                        handleFilterChange("pucMin", e.target.value)
                      }
                    />
                    <span>-</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="10"
                      placeholder="Max GPA"
                      className="border p-2 rounded-md w-25"
                      value={filters.pucMax || ""}
                      onChange={(e) =>
                        handleFilterChange("pucMax", e.target.value)
                      }
                    />
                  </div>
                </div>
              )}

              {/* Engg GPA Filter */}
              {batch == "r20" && (
                <div className="mb-2">
                  <label className="text-gray-700 font-semibold">
                    Engg GPA
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="10"
                      placeholder="Min GPA"
                      className="border p-2 rounded-md w-25"
                      value={filters.enggMin || ""}
                      onChange={(e) =>
                        handleFilterChange("enggMin", e.target.value)
                      }
                    />
                    <span>-</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="10"
                      placeholder="Max GPA"
                      className="border p-2 rounded-md w-25"
                      value={filters.enggMax || ""}
                      onChange={(e) =>
                        handleFilterChange("enggMax", e.target.value)
                      }
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center space-x-2">
                <button
                  className="bg-gray-100 text-black p-2 border border-gray-300 rounded w-1/2"
                  onClick={() => {
                    setFilters({
                      sortBy: "",
                      sortOrder: "",
                      gender: "",
                      caste: [],
                      branch: [],
                      pucMin: "",
                      pucMax: "",
                      enggMin: "",
                      enggMax: "",
                    });
                  }}
                >
                  Clear Filters
                </button>
                <button
                  className="bg-blue-500 text-white p-2 rounded w-1/2"
                  onClick={() => {
                    setShowFilter(false);
                    applyFilters();
                  }}
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExplorePage;
