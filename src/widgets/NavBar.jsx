import React, { useEffect, useState } from "react";
import "../styles/NavBar.css";
import BARE from "../assets/BAR-E TrxBg.png";
import { useNavigate } from "react-router-dom";

function NavBar({ type }) {
  const navigate = useNavigate();
  const [MLColor, setMLColor] = useState(
    <a
      onClick={() => navigate("/myListings", { replace: true })}
      style={{ cursor: "pointer", color: "white" }}
    >
      My Listings
    </a>
  );
  const [ALColor, setALColor] = useState(
    <a
      onClick={() => navigate("/allListings", { replace: true })}
      style={{ cursor: "pointer", color: "white" }}
    >
      All Listings
    </a>
  );
  const [PColor, setPColor] = useState(
    <a
      onClick={() => navigate("/payments", { replace: true })}
      style={{ cursor: "pointer", color: "white" }}
    >
      My Space
    </a>
  );

  useEffect(() => {
    if (type == "ML") {
      setMLColor(
        <a
          onClick={() => navigate("/myListings", { replace: true })}
          style={{ cursor: "pointer", color: "white", opacity: "1" }}
        >
          My Listings
        </a>
      );
    } else if (type == "AL") {
      setALColor(
        <a
          onClick={() => navigate("/allListings", { replace: true })}
          style={{ cursor: "pointer", color: "white", opacity: "1" }}
        >
          All Listings
        </a>
      );
    } else if (type == "P") {
      setPColor(
        <a
          onClick={() => navigate("/payments", { replace: true })}
          style={{ cursor: "pointer", color: "white", opacity: "1" }}
        >
          My Space
        </a>
      );
    }
  }, []);

  if (type == 1) {
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
          <li>{MLColor}</li>
          <li>{ALColor}</li>
          <li>{PColor}</li>
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
