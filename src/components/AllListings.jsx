import React, { useEffect, useState } from "react";
import BARE from "../assets/BAR-E TrxBg.png";
import { ethers } from "ethers";
import { abi, contractAddress } from "../../CompiledContract/constants.js";
import "../styles/AllListings.css";
import { useNavigate } from "react-router-dom";

function AllListings() {
  const [contract, setContract] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [globalListingData, setGlobalListingData] = useState([[]]);
  const [providers, setProviders] = useState(null);
  const navigate = useNavigate();

  const get_img_uri = async (nft_uri) => {
    try {
      const response = await fetch(
        `https://gateway.pinata.cloud/ipfs/${nft_uri}`
      );
      if (response.ok) {
        const json = await response.json();
        return json["image"].replace("ipfs://", "");
      } else {
        const json = await response.json();
      }
    } catch (e) {
      return [400, e];
    }
  };

  async function listenForTransactionMine(transactionResponse, provider) {
    console.log("Mining ${transactionResponse.hash}...");
    return new Promise((resolve, reject) => {
      provider.once(transactionResponse.hash, (transactionReceipt) => {
        console.log(
          "Completed with ${transactionReceipt.confirmations} confirmations"
        );
        //location.reload();
        resolve();
      });
    });
  }
  const test = async () => {
    if (typeof window.ethereum != "undefined") {
      await window.ethereum.request({ method: "eth_requestAccounts" });
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const walletAddress = signer["address"];
      const contract = new ethers.Contract(contractAddress, abi, signer);
      setWalletAddress(walletAddress);
      setContract(contract);
      setProviders(provider);
      try {
        const global_listing_data = [];
        const numUsers = parseInt(await contract.numUsers());
        for (let i = 0; i < numUsers; i++) {
          const address = await contract.registeredAddresses(i);
          const personData = await contract.person(walletAddress);
          const numOfListings = parseInt(personData[3]);
          for (let j = 0; j < numOfListings; j++) {
            const listing = await contract.personToLandlord(address, j);
            if (parseInt(listing[5]) == 2) {
              const img_uri = await get_img_uri(listing[6]);
              console.log(img_uri);
              await global_listing_data.push([
                address,
                j,
                parseInt(listing[2]),
                parseInt(listing[3]),
                parseInt(listing[4]),
                img_uri,
                listing[7],
                listing[8],
              ]);
            }
          }
        }
        setGlobalListingData(global_listing_data);
      } catch (error) {
        console.log(error);
      }
    } else {
      console.log("Not Connected");
    }
  };

  useEffect(() => {
    test();
  }, []);

  const purchase = async (
    owner_add,
    serial_num,
    time,
    deposit,
    monthlyRental
  ) => {
    console.log(deposit);
    const bought = await contract.firstPurchase(
      walletAddress,
      owner_add,
      time,
      deposit,
      monthlyRental,
      serial_num
    );
    await listenForTransactionMine(bought, providers);
    test();
  };

  return (
    <div>
      <nav className="navigation">
        <a
          onClick={() => navigate("/payments", { replace: true })}
          style={{ cursor: "pointer" }}
          className="logo"
        >
          <img src={BARE} alt="Picture of a house" width="180px" />
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
        <div className="right-elements"></div>
      </nav>
      <h1 style={{ "line-height": "1.5" }}>All Listings</h1>
      <div className="feature-product-container">
        {globalListingData.map((dataPoint) => {
          return (
            <div className="feature-product-box card">
              <div className="product-feature-img">
                <img
                  src={`https://gateway.pinata.cloud/ipfs/${dataPoint[5]}`}
                  alt="Picture of a house"
                  className="house-image"
                />
              </div>

              <div className="product-feature-text-container">
                <div style={{ height: "165px" }}>
                  <p style={{ color: "black" }}>
                    <strong>{dataPoint[6]}</strong>
                  </p>
                  <p style={{ color: "black" }}>{dataPoint[7]}</p>
                  <p style={{ color: "black" }}>
                    Rental Duration: {dataPoint[2] / (30 * 24 * 60 * 60)} months
                  </p>
                  <p style={{ color: "black" }}>
                    Rental Deposit: {dataPoint[3]} XRP
                  </p>
                  <p style={{ color: "black" }}>
                    Monthly Rental: {dataPoint[4]} XRP
                  </p>
                </div>
                <button
                  id="createListing"
                  type="button"
                  className="buy-button"
                  onClick={() =>
                    purchase(
                      dataPoint[0],
                      dataPoint[1],
                      dataPoint[2],
                      dataPoint[3],
                      dataPoint[4]
                    )
                  }
                >
                  Buy
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default AllListings;
