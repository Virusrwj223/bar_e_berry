import React, { useState } from "react";
import "../styles/ListingCard.css";

function ListingCard({ dataPoint }) {
  return (
    <div>
      <div className="product-feature-img">
        <img
          src={`https://gateway.pinata.cloud/ipfs/${dataPoint[9]}`}
          alt="Picture of a house"
          className="house-image"
        />
      </div>
      <div className="product-feature-text-container">
        <div className="upper-description">
          <div className="upper-left-description">
            <p style={{ color: "black" }}>
              <strong>{dataPoint[1]}</strong>
            </p>
          </div>
          <div className="upper-right-description">
            <p style={{ color: "black" }}>
              <strong>{dataPoint[3]}</strong>
            </p>
            <p style={{ color: "black" }}>
              {dataPoint[5] - dataPoint[4]}/{dataPoint[5]}
            </p>
          </div>
        </div>
        <div className="lower-description">
          <p style={{ color: "black" }}>{dataPoint[2]}</p>
          <p>Duration: {dataPoint[6] / (30 * 24 * 60 * 60)} months</p>
          <p style={{ color: "black" }}>Deposit: {dataPoint[8]} XRP</p>
          <p style={{ color: "black" }}>Rental: {dataPoint[7]} XRP</p>
        </div>
      </div>
    </div>
  );
}

export default ListingCard;
