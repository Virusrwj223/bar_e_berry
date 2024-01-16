import React, { useEffect, useState } from "react";
import BARE from "../assets/BAR-E TrxBg.png";
import { ethers } from "ethers";
import { abi, contractAddress } from "../../CompiledContract/constants.js";
import "../styles/AllListings.css";
import { useNavigate } from "react-router-dom";
import NavBar from "../widgets/NavBar.jsx";

function AllListings() {
  const [contract, setContract] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [globalListingData, setGlobalListingData] = useState([[]]);
  const [providers, setProviders] = useState(null);
  const [sign, setSign] = useState(null);
  const [sharesChosen, setSharesChosen] = useState(1);
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
      setSign(signer);
      try {
        const global_listing_data = [];
        const numUsers = parseInt(await contract.numUsers());

        for (let i = 0; i < numUsers; i++) {
          const address = await contract.registeredAddresses(i);
          const personData = await contract.person(address);
          const numOfListings = parseInt(personData[3]);
          console.log(numOfListings);

          for (let j = 0; j < numOfListings; j++) {
            const listing = await contract.personToLandlord(address, j);   
            console.log(listing);
            const nft_uri = await listing[2];
            const deployed_contract_add = await listing[1];
            const childContract = new ethers.Contract(
              deployed_contract_add,
              abi,
              signer
            );
            if (nft_uri != "") {
              console.log(nft_uri)
              const landlordData = await childContract.listingMap(nft_uri);
              console.log(landlordData)
              if (parseInt(landlordData[5]) == 2) {
                const img_uri = await get_img_uri(nft_uri);
                global_listing_data.push([
                  address,
                  j,
                  parseInt(landlordData[2]),
                  parseInt(landlordData[3]),
                  parseInt(landlordData[4]),
                  img_uri,
                  landlordData[6],
                  landlordData[7],
                  parseInt(landlordData[8]),
                  parseInt(landlordData[9]),
                  landlordData[10],
                ]);
              }
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
    time,
    deposit,
    monthlyRental,
    sharesPurchased,
    listingNum
  ) => {
    const bought = await contract.firstPurchase(
      walletAddress,
      owner_add,
      time,
      deposit,
      parseInt(monthlyRental),
      sharesPurchased,
      listingNum
    );
    await listenForTransactionMine(bought, providers);

    const listing = await contract.personToLandlord(owner_add, listingNum);
    const nft_uri = listing[2];
    const deployed_contract_add = listing[1];
    const childContract = new ethers.Contract(deployed_contract_add, abi, sign);

    const buying = await childContract.purchaseListing(
      nft_uri,
      sharesPurchased,
      walletAddress
    );
    await listenForTransactionMine(buying, providers);
    test();
  };

  return (
    <div>
      <NavBar />

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
                <div>
                  <div className="upper-description">
                    <div className="upper-left-description">
                      <p style={{ color: "black" }}>
                        <strong>{dataPoint[6]}</strong>
                      </p>
                    </div>
                    <div className="upper-right-description">
                      <p style={{ color: "black" }}>
                        <strong>{dataPoint[10]}</strong>
                      </p>
                      <p style={{ color: "black" }}>
                        {dataPoint[9]} / {dataPoint[8]}
                      </p>
                    </div>
                  </div>
                  <div className="lower-description">
                    <p style={{ color: "black" }}>{dataPoint[7]}</p>
                    <p style={{ color: "black" }}>
                      Rental Duration: {dataPoint[2] / (30 * 24 * 60 * 60)}{" "}
                      months
                    </p>
                    <p style={{ color: "black" }}>
                      Deposit: {dataPoint[4]} XRP
                    </p>
                    <p style={{ color: "black" }}>Rental: {dataPoint[3]} XRP</p>
                  </div>
                </div>
                <div className="user-interaction-wrapper">
                  <input
                    type="number"
                    min="1"
                    max="5"
                    className="incrementer-wrapper"
                    placeholder="0"
                    onChange={(e) => setSharesChosen(parseInt(e.target.value))}
                    style={{ color: "black" }}
                  />
                  <button
                    id="createListing"
                    type="button"
                    className="buy-button"
                    onClick={() =>
                      purchase(
                        dataPoint[0],
                        dataPoint[2],
                        dataPoint[3],
                        (dataPoint[4] * sharesChosen) / dataPoint[8], //calculate monthly rental prop to shares purchased HERE
                        parseInt(sharesChosen),
                        dataPoint[1]
                      )
                    }
                  >
                    Buy
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default AllListings;
