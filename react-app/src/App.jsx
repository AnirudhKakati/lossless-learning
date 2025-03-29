import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Navbar from "./components/Navbar";
import Summary from "./pages/Summary";





export default function App() {
  return (
    <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/summary" element={<Summary />} />
        </Routes>
    </Router>
);
}
