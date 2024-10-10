import React, { useState, useEffect } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import toast from "react-hot-toast";
import { useRecoilState, useRecoilValue } from "recoil";
// import { userAtom } from "../state/userAtom.js";
import { useNavigate } from "react-router-dom";
import Spinner from "../components/Spinner.jsx";

function LoginPage() {
  const [userData, setUserData] = useState({});
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setLoading(true);
      axios
        .get("/verify", {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          setUserData(res.data.user);
          navigate("/");
        })
        .catch((err) => {
          console.log(err.message);
          localStorage.removeItem("token");
          setUserData(null);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [setUserData, navigate]);

  const handleLogin = async (x) => {
    try {
      console.log("login called");

      const res = await axios.post("/users/login", {
        email: x.email,
        name: x.name,
      });

      console.log(res);
      localStorage.setItem("token", res.data.token);
      setUserData(res.data.user);

      toast.success("Login Success");
      navigate("/");
    } catch (err) {
      console.log(err.message);
      console.log(err);
      toast.error("Please try again...");
    }
  };

  return (
    <>
      <div className="h-screen flex">
        <div className="w-full bg-blue-400 flex items-center justify-center p-8">
          <div className="text-center">
            {loading ? (
              <Spinner />
            ) : (
              <>
                <GoogleLogin
                  onSuccess={(res) => {
                    let x = jwtDecode(res?.credential);
                    handleLogin(x);
                  }}
                  onError={(err) => {
                    console.log(err, "Login Failed");
                  }}
                />
                <p className="text-white mt-4">Sign in with Google</p>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default LoginPage;
