import { useState, useEffect } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { useRecoilState } from "recoil";
import userAtom from "./state/userAtom.js";
import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage";
import ExplorePage from "./pages/ExplorePage.jsx";
import Spinner from "./components/Spinner";
import Navbar from "./components/Navbar.jsx";
import "./App.css";

function App() {
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useRecoilState(userAtom);
  const navigate = useNavigate();
  const location = useLocation();
  console.log(userData);

  // useEffect(() => {
  //   setUserData(userData);
  // }, [setUserData]);

  if (loading) return <Spinner />;

  return (
    <>
      <div className="flex flex-col min-h-screen">
        {userData && (
          <div className="sticky top-0 z-10 bg-white">
            <Navbar />
          </div>
        )}

        {location.pathname === "/" || location.pathname === "/explore" ? (
          <div className="flex-1 p-4 pt-2 md:ml-64">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/explore" element={<ExplorePage />} />
            </Routes>
          </div>
        ) : (
          <div className="flex-1">
            <Routes>
              <Route
                path="/login"
                element={!userData ? <LoginPage /> : navigate("/")}
              />
            </Routes>
          </div>
        )}
      </div>
    </>
  );
}

export default App;
