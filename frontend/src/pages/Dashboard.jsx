/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import { useRecoilState } from "recoil";
import axios from "axios";
import userAtom from "../state/userAtom";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const [users, setUsers] = useState([]);
  const [userData, setUserData] = useRecoilState(userAtom);
  const [loading, setLoading] = useState(true);
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
      const res = await axios.get(`/users/get`);
      setUsers(res.data.users);
    } catch (err) {
      console.log(err.message);
    }
  };

  // Format time into DD/MM/YYYY, HH:mm format
  // const formatTime = (time) => {
  //   const options = {
  //     year: "numeric",
  //     month: "2-digit",
  //     day: "2-digit",
  //     hour: "2-digit",
  //     minute: "2-digit",
  //   };
  //   return new Intl.DateTimeFormat("en-GB", options).format(new Date(time));
  // };

  useEffect(() => {
    verify();
    fetchUsers();
  }, []);

  if (userData.email != admins) {
    toast.error("Why Vro?");
    navigate("/");
  }

  return (
    <div className="container mx-auto my-8 px-4">
      <h1 className="text-2xl font-semibold mb-4 text-center">
        User Dashboard
      </h1>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-300 shadow-md rounded-lg overflow-hidden">
          <thead>
            <tr>
              <th className="px-4 py-3 border-b border-gray-300 bg-gray-100 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Name
              </th>
              <th className="px-4 py-3 border-b border-gray-300 bg-gray-100 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Email
              </th>
              <th className="px-4 py-3 border-b border-gray-300 bg-gray-100 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Last Time
              </th>
              <th className="px-4 py-3 border-b border-gray-300 bg-gray-100 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Viewed
              </th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id} className="hover:bg-gray-100">
                <td className="px-4 py-4 border-b border-gray-200 text-sm text-gray-900">
                  {user.name}
                </td>
                <td className="px-4 py-4 border-b border-gray-200 text-sm text-gray-900">
                  {user.email}
                </td>
                <td className="px-4 py-4 border-b border-gray-200 text-sm text-gray-900">
                  {user.time}
                </td>
                <td className="px-4 py-4 border-b border-gray-200 text-sm text-gray-900">
                  {user.viewed.length > 0 ? (
                    <div className="border border-gray-300 rounded-md p-2 bg-gray-50">
                      {user.viewed.map((item, index) => (
                        <div
                          key={index}
                          className="border-b border-gray-300 py-2 px-2 last:border-none"
                        >
                          {item}
                        </div>
                      ))}
                    </div>
                  ) : (
                    "N/A"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard;
