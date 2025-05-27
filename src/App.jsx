import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./Pages/Login/Login";
import SheetPage from "./Pages/SheetPage/SheetPage";
import ProtectedRoute from "./components/ProtectedRoute";
import AutoLogin from "./components/AutoLogin";

function App() {
  return (
    <Router>
      <AutoLogin />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Login />} />
        <Route
          path="/GitScrum"
          element={
            <ProtectedRoute>
              <SheetPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
