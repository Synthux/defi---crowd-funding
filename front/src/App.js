import React from "react";
import { Routes, Route, NavLink } from "react-router-dom";
import Home from "./components/Home";
import Docs from "./components/Docs";

function App() {
  return (
    <div className="App">
      <nav className="navbar">
        <div className="branding">
          <img
            src={`${process.env.PUBLIC_URL}/logo.svg`}
            alt="Project Logo"
            className="logo-img"
          />
        </div>
        <div className="nav-links">
          <NavLink to="/" end className="nav-link">
            Home
          </NavLink>
          <NavLink to="/docs" className="nav-link">
            Documentation
          </NavLink>
        </div>
      </nav>

      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/docs" element={<Docs />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
