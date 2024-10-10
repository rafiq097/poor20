import { useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { useRecoilState } from "recoil";
import userAtom from "./state/userAtom.js";
import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage";
import Spinner from "./components/Spinner";
import "./App.css";

function App() {
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useRecoilState(userAtom);
  const navigate = useNavigate();

  if (loading) return <Spinner />;

  return (
    <>
      <div className="flex flex-col min-h-screen">
        <Routes>
          <Route path="/" element={<HomePage />}/>
          <Route path="/login" element={!userData ? <LoginPage /> : navigate("/")} />
        </Routes>
      </div>
    </>
  );
}

export default App;
