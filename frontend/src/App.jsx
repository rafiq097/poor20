import { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import "./App.css";

function App() {
  return (
    <>
      <Routes>
        <Route
          path="/login"
          element={<LoginPage />}
        />
      </Routes>
    </>
  );
}

export default App;
