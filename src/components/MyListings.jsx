import React, { useEffect, useState } from "react";
import "../styles/MyListings.css";
import { ethers } from "ethers";
import { abi, contractAddress } from "../../CompiledContract/constants.js";
import pinFileToIPFS from "../../services/pinFileToIpfs.js";
import { useNavigate } from "react-router-dom";
import NavBar from "../widgets/NavBar.jsx";
import ListingCard from "../widgets/ListingCard.jsx";
import listenForTransactionMine from "../../services/listenForTransactionMine.js";

function MyListings() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [rentalDuration, setRentalDuration] = useState("");
  const [rentalDeposit, setRentalDeposit] = useState("");
  const [monthlyRental, setMonthlyRental] = useState("");
  const [tokenName, setTokenName] = useState("");
  const [authorisedShares, setAuthorisedShares] = useState("");
  const [img, setFileImg] = useState(null);
  const [imgUri, setImgUri] = useState([[]]);
  const [contract, setContract] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [providers, setProviders] = useState(null);
  const [sign, setSign] = useState(null);
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
      setSign(signer);
      try {
        const img_uri_lst = [];
        const personData = await contract.person(walletAddress);
        const num_listings = parseInt(personData[3]);
        for (let i = 0; i < num_listings; i++) {
          const personData = await contract.personToLandlord(walletAddress, i);
          const nft_uri = personData[2];
          const deployed_contract_add = personData[1];
          const childContract = new ethers.Contract(
            deployed_contract_add,
            abi,
            signer
          );
          const landlordData = await childContract.listingMap(nft_uri);
          const duration = parseInt(landlordData[2]);
          const deposit = parseInt(landlordData[3]);
          const cost = parseInt(landlordData[4]);
          const contTitle = landlordData[6];
          const contDesc = landlordData[7];
          const authorised_shares = parseInt(landlordData[8]);
          const shares_bought = parseInt(landlordData[9]);
          const token_ticker = landlordData[10];
          const img_uri = await get_img_uri(nft_uri);
          if (landlordData[5] == 2) {
            img_uri_lst.push([
              i,
              contTitle,
              contDesc,
              token_ticker,
              shares_bought,
              authorised_shares,
              duration,
              cost,
              deposit,
              img_uri,
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
      tokenName != "" &&
      authorisedShares != "" &&
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
        tokenName,
        parseInt(rentalDuration * 30 * 24 * 60 * 60),
        parseInt(rentalDeposit),
        parseInt(monthlyRental),
        parseInt(authorisedShares),
        nft_ipfsHash,
        title,
        description
      );
      await listenForTransactionMine(minting, providers);
      test();
      setMintBtn("Mint");
    }
  };

  const removeList = async (tokenSerialNum) => {
    const personData = await contract.personToLandlord(
      walletAddress,
      tokenSerialNum
    );
    const deployed_contract_add = personData[1];
    const nft_uri = personData[2];
    const childContract = new ethers.Contract(deployed_contract_add, abi, sign);
    const deacitvate = await childContract.deactivateListing(nft_uri);
    await listenForTransactionMine(deacitvate, providers);
    test();
  };

  return (
    <div className="overarching-box">
      <NavBar type={"ML"} />

      <div className="section">
        <div id="main-listings-box" className="my-listings">
          <div className="float-child">
            {imgUri.map((dataPoint) => {
              return (
                <div className="feature-product-box card">
                  <ListingCard dataPoint={dataPoint} />

                  <div className="ML-user-interaction-box-area">
                    <button
                      id="createListing"
                      type="button"
                      className="delete-button"
                      onClick={() => removeList(dataPoint[0])}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div id="right_side" className="floating-child">
          <div className="input-img">
            {img != null ? (
              <img
                src={URL.createObjectURL(img)}
                alt="uploaded image"
                className="house-image"
              />
            ) : (
              <div id="no-image">No Image</div>
            )}
            <h1></h1>
            {/*DONT REMOVE*/}
            <label for="file-upload" id="file-upload-label">
              Upload Image of Property
            </label>
            <input
              type="file"
              id="file-upload"
              name="file-upload"
              onChange={(e) => setFileImg(e.target.files[0])}
              style={{ color: "black" }}
              required
            />
          </div>
          <div className="upper-description">
            <div className="upper-left-description">
              <input
                id="title"
                type="text"
                className="input-field-ulml"
                placeholder="Caption"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                style={{ color: "black" }}
              />
            </div>
            <div className="upper-right-description">
              <input
                id="token-name"
                type="text"
                className="input-field-urml"
                placeholder="Ticker"
                value={tokenName}
                onChange={(e) => setTokenName(e.target.value)}
                style={{ color: "black" }}
              />
              <input
                id="authorised-shares"
                type="number"
                min="1"
                max="6"
                className="input-field-urml"
                placeholder="Shares"
                value={authorisedShares}
                onChange={(e) => setAuthorisedShares(e.target.value)}
                style={{ color: "black" }}
              />
            </div>
          </div>
          <div>
            <input
              id="description"
              type="text"
              className="input-field-ml"
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{ color: "black" }}
            />
            <input
              id="time"
              type="number"
              min="3"
              className="input-field-ml"
              placeholder="Rental Duration"
              value={rentalDuration}
              onChange={(e) => setRentalDuration(e.target.value)}
              style={{ color: "black" }}
            />
            <input
              id="deposit"
              type="number"
              min="1"
              className="input-field-ml"
              placeholder="Rental Deposit"
              value={rentalDeposit}
              onChange={(e) => setRentalDeposit(e.target.value)}
              style={{ color: "black" }}
            />
            <input
              id="monthly-rental"
              type="number"
              min="1"
              className="input-field-ml"
              placeholder="Monthly Rental"
              value={monthlyRental}
              onChange={(e) => setMonthlyRental(e.target.value)}
              style={{ color: "black" }}
            />
          </div>

          <button
            id="createListing"
            type="button"
            className="mint-btn"
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
