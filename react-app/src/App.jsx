import { useState } from 'react'
import './App.css'

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Summary from "./pages/Summary";
import Resource from "./pages/Resource";
import Login from "./pages/Login";






export default function App() {
  return (
    <div className = "bg-gray-100">
      <Router>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/summary" element={<Summary />} />
            <Route path="/resource/:id" element={<Resource />} />
          </Routes>
      </Router>
    </div>
);
}
