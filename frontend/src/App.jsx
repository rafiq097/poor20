import { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import Spinner from "./components/Spinner";
import "./App.css";

function App() {
  const [loading, setLoading] = useState(false);

  if (loading) return <Spinner />;

  return (
    <di>
      <div className="flex flex-col min-h-screen">
        <Routes>
          <Route path="/" element={}/>
          <Route path="/login" element={<LoginPage />} />
        </Routes>
      </div>
    </>
  );
}

export default App;
