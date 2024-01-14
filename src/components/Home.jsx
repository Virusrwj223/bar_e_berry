import React from "react";
import BARE from "../assets/BAR-E TrxBg.png";
import House from "../assets/SuCasaDesign-Modern-9335be77ca0446c7883c5cf8d974e47c.jpg";
import "../styles/Home.css";
import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();
  return (
    <div>
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

      <section id="main">
        <div className="main-content">
          <div className="main-text">
            <span>BAR-E</span>
            <h1>BUILDING A RENTER ELECTRONICALLY</h1>
            <p>
              Ever wondered 'Why wouldn't my rentee pay their rent?' or 'My
              landlord is the meanest person ever!'? With BAR-E, worry less. Our
              app opens up transactions to the world.
            </p>
            <a
              onClick={() => navigate("/login", { replace: true })}
              className="shadow"
              style={{ cursor: "pointer" }}
            >
              Rent Now
            </a>
          </div>
          <div className="main-img">
            <img src={House} alt="Picture of a house" />
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
