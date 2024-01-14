import React, { useEffect, useState } from "react";
import "../styles/MyListings.css";
import BARE from "../assets/BAR-E TrxBg.png";
import { ethers } from "ethers";
import { abi, contractAddress } from "../../CompiledContract/constants.js";
import pinFileToIPFS from "../../services/pinFileToIpfs.js";
import { useNavigate } from "react-router-dom";

function MyListings() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [rentalDuration, setRentalDuration] = useState("");
  const [rentalDeposit, setRentalDeposit] = useState("");
  const [monthlyRental, setMonthlyRental] = useState("");
  const [img, setFileImg] = useState(null);
  const [imgUri, setImgUri] = useState([[]]);
  const [contract, setContract] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [providers, setProviders] = useState(null);
  const [mintBtn, setMintBtn] = useState("Mint");
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
      //const walletAddress = "0x7f88196f90b210f78512D0e1Be0ba49a3535A72d"; //document.getElementById("walletAddress").value;
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const walletAddress = signer["address"];
      const contract = new ethers.Contract(contractAddress, abi, signer);
      setWalletAddress(walletAddress);
      setContract(contract);
      setProviders(provider);
      try {
        const img_uri_lst = [];
        const personData = await contract.person(walletAddress);
        const num_listings = parseInt(personData[3]);
        for (let i = 0; i < num_listings; i++) {
          const personData = await contract.personToLandlord(walletAddress, i);
          const nft_uri = personData[6];
          const duration = parseInt(personData[2]);
          const deposit = parseInt(personData[3]);
          const cost = parseInt(personData[4]);
          const listingNum = parseInt(personData[1]);
          const contTitle = personData[7];
          const contDesc = personData[8];
          const img_uri = await get_img_uri(nft_uri);
          console.log(img_uri);
          if (personData[5] == 2) {
            img_uri_lst.push([
              img_uri,
              i,
              listingNum,
              duration,
              deposit,
              cost,
              contTitle,
              contDesc,
            ]);
          }
        }
        setImgUri(img_uri_lst);
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

  const listProp = async () => {
    if (
      title != "" &&
      description != "" &&
      rentalDeposit != "" &&
      rentalDuration != "" &&
      monthlyRental != "" &&
      img != null
    ) {
      setMintBtn("Minting");
      const nft_cid = await pinFileToIPFS(
        title,
        description,
        rentalDuration * 30 * 24 * 60 * 60,
        rentalDeposit,
        monthlyRental,
        img
      );
      const nft_ipfsHash = nft_cid["IpfsHash"];
      const minting = await contract.safeMint(
        walletAddress,
        parseInt(rentalDuration * 30 * 24 * 60 * 60),
        parseInt(rentalDeposit),
        parseInt(monthlyRental),
        nft_ipfsHash,
        title,
        description
      );
      await listenForTransactionMine(minting, providers);
      test();
      setMintBtn("Mint");
    }
  };

  const removeList = async (tokenSerialNum, tokenID) => {
    await contract.burn(tokenID);
    const deacitvate = await contract.deactivateListing(
      walletAddress,
      tokenSerialNum
    );
    await listenForTransactionMine(deacitvate, providers);
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
        <div className="right-elements"></div>
      </nav>
      <h1 style={{ lineHeight: "1.5", "margin-top": "20px" }}>My Listings</h1>
      <div className="section">
        <div id="main-listings-box" className="my-listings">
          <div className="float-child">
            {imgUri.map((dataPoint) => {
              return (
                <div className="feature-product-box card">
                  <div className="product-feature-img">
                    <img
                      src={`https://gateway.pinata.cloud/ipfs/${dataPoint[0]}`}
                      alt="Picture of a house"
                      className="house-image"
                    />
                  </div>
                  <div className="product-feature-text-container">
                    <p style={{ color: "black" }}>
                      <strong>{dataPoint[6]}</strong>
                    </p>
                    <p style={{ color: "black" }}>{dataPoint[7]}</p>
                    <p>Duration: {dataPoint[3] / (30 * 24 * 60 * 60)} months</p>
                    <p style={{ color: "black" }}>
                      Deposit: {dataPoint[4]} XRP
                    </p>
                    <p style={{ color: "black" }}>Rental: {dataPoint[5]} XRP</p>
                    <button
                      id="createListing"
                      type="button"
                      className="delete-button"
                      onClick={() => removeList(dataPoint[1], dataPoint[2])}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div id="right_hand" className="floating-child">
          <input
            id="title"
            type="text"
            className="input-field"
            placeholder="Caption"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{ color: "black" }}
          />
          <input
            id="description"
            type="text"
            className="input-field"
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={{ color: "black" }}
          />
          <input
            id="time"
            type="text"
            className="input-field"
            placeholder="Rental Duration"
            value={rentalDuration}
            onChange={(e) => setRentalDuration(e.target.value)}
            style={{ color: "black" }}
          />
          <input
            id="deposit"
            type="text"
            className="input-field"
            placeholder="Rental Deposit"
            value={rentalDeposit}
            onChange={(e) => setRentalDeposit(e.target.value)}
            style={{ color: "black" }}
          />
          <input
            id="monthly-rental"
            type="text"
            className="input-field"
            placeholder="Monthly Rental"
            value={monthlyRental}
            onChange={(e) => setMonthlyRental(e.target.value)}
            style={{ color: "black" }}
          />
          <input
            type="file"
            onChange={(e) => setFileImg(e.target.files[0])}
            style={{ color: "black" }}
            required
          />

          <button
            id="createListing"
            type="button"
            className="submit-btn"
            onClick={listProp}
          >
            {mintBtn}
          </button>
        </div>
      </div>
    </div>
  );
}

export default MyListings;
