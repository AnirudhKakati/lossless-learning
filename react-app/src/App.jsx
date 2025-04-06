import { useState } from 'react'
import './App.css'

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Summary from "./pages/Summary";





export default function App() {
  return (
    <div className = "bg-gray-100">
      <Router>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/summary/" element={<Summary />} />
            <Route path="/summary/:count" element={<Summary />} />
          </Routes>
      </Router>
    </div>
);
}
