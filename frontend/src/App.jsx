import { useState } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { useRecoilState } from "recoil";
import userAtom from "./state/userAtom.js";
import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage";
import Spinner from "./components/Spinner";
import "./App.css";
import Navbar from "./components/Navbar.jsx";

function App() {
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useRecoilState(userAtom);
  const navigate = useNavigate();
  const location = useLocation();

  if (loading) return <Spinner />;

  return (
    <>
      <div className="flex flex-col min-h-screen">
        {userData && <Navbar />}
        {/* <div className="flex-1 p-4 pt-2 md:ml-64">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route
              path="/login"
              element={!userData ? <LoginPage /> : navigate("/")}
            />
          </Routes>
        </div> */}

        {location.pathname === "/" ? (
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
