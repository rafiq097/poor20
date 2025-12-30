/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import { useRecoilState } from "recoil";
import axios from "axios";
import userAtom from "../state/userAtom";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const SecretPage = () => {
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


  useEffect(() => {
    verify();
  }, []);

  if (!admins.includes(userData?.email)) {
    toast.error("Why Vro?");
    navigate("/");
  }

  return (
    <div>
      SecretPage
    </div>
  );
};

export default SecretPage;
