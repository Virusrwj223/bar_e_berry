import React from "react";
import "../styles/NavBar.css";
import BARE from "../assets/BAR-E TrxBg.png";
import { useNavigate } from "react-router-dom";

function NavBar(type) {
  const navigate = useNavigate();

  if (type["type"] == 1) {
    return (
      <nav className="navigation">
        <a
          onClick={() => navigate("/", { replace: true })}
          style={{ cursor: "pointer" }}
          className="logo"
        >
          <img src={BARE} alt="Picture of a house" width="180px" />
        </a>
        <ul className="menu">
          <li>
            <a
              onClick={() => navigate("/", { replace: true })}
              style={{ cursor: "pointer" }}
              className="active"
            >
              Home
            </a>
          </li>
        </ul>
        <div className="right-elements">
          <a
            onClick={() => navigate("/login", { replace: true })}
            className="user"
            style={{ cursor: "pointer" }}
          >
            Login
          </a>
        </div>
      </nav>
    );
  } else {
    return (
      <nav className="navigation">
        <a
          onClick={() => navigate("/payments", { replace: true })}
          style={{ cursor: "pointer" }}
          className="logo"
        >
          <img src={BARE} alt="Brand Logo" width="180px" />
        </a>
        <ul className="menu">
          <li>
            <a
              onClick={() => navigate("/myListings", { replace: true })}
              style={{ cursor: "pointer" }}
            >
              My Listings
            </a>
          </li>
          <li>
            <a
              onClick={() => navigate("/allListings", { replace: true })}
              style={{ cursor: "pointer" }}
            >
              All Listings
            </a>
          </li>
          <li>
            <a
              onClick={() => navigate("/payments", { replace: true })}
              style={{ cursor: "pointer" }}
            >
              My Space
            </a>
          </li>
        </ul>
        <div className="right-elements">
          <li>
            <a
              onClick={() => navigate("/", { replace: true })}
              style={{ cursor: "pointer" }}
            >
              Logout
            </a>
          </li>
        </div>
      </nav>
    );
  }
}

export default NavBar;
