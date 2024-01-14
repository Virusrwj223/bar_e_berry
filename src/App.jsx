import { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MyListings from "./components/MyListings";
import AllListings from "./components/AllListings";
import Payments from "./components/Payments";
import Home from "./components/Home";
import Login from "./components/Logins";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/myListings" element={<MyListings />} />
        <Route path="/allListings" element={<AllListings />} />
        <Route path="/payments" element={<Payments />} />
        <Route path="*" element={<h1>You have entered a wrong url!</h1>} />
      </Routes>
    </Router>
  );
}

export default App;
