import { useState } from 'react'
import './App.css'

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Summary from "./pages/Summary";
import Resource from "./pages/Resource";
import Login from "./pages/Login";
import Favorites from "./pages/Favorites";
import RequireAuth from "./components/RequireAuth";
import Query from "./pages/Query";





export default function App() {
  return (
    <div className = "bg-gray-100">
      <Router>
          <Routes>
            <Route path="/" element={<RequireAuth> <Home /> </RequireAuth>} />
            <Route path="/login" element={<Login />} />
            <Route path="/summary" element={<RequireAuth> <Summary /> </RequireAuth>} />
            <Route path="/summary/:topic" element={<RequireAuth> <Summary /> </RequireAuth>} />
            <Route path="/resource/:id" element={<RequireAuth> <Resource /> </RequireAuth>} />
            <Route path="/favorites" element={<RequireAuth> <Favorites /> </RequireAuth>} />
            <Route path="/query/:question?" element={<RequireAuth> <Query /> </RequireAuth>} />
          </Routes>
      </Router>
    </div>
);
}
