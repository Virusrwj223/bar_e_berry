import React from "react";
import "../styles/incrementer.css";

function Incrementer() {
  return (
    <div className="wrapper">
      <span className="minus">-</span>
      <span className="num">1</span>
      <span className="plus">+</span>
    </div>
  );
}

export default Incrementer;
