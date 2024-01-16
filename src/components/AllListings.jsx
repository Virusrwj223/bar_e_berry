import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { abi, contractAddress } from "../../CompiledContract/constants.js";
import "../styles/AllListings.css";
import { useNavigate } from "react-router-dom";
import NavBar from "../widgets/NavBar.jsx";
import ListingCard from "../widgets/ListingCard.jsx";
import listenForTransactionMine from "../../services/listenForTransactionMine.js";

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
  /*
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
  */
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

          for (let j = 0; j < numOfListings; j++) {
            const listing = await contract.personToLandlord(address, j);
            const nft_uri = await listing[2];
            const deployed_contract_add = await listing[1];
            const childContract = new ethers.Contract(
              deployed_contract_add,
              abi,
              signer
            );
            if (nft_uri != "") {
              const landlordData = await childContract.listingMap(nft_uri);
              if (parseInt(landlordData[5]) == 2) {
                const img_uri = await get_img_uri(nft_uri);
                global_listing_data.push([
                  j,
                  landlordData[6],
                  landlordData[7],
                  landlordData[10],
                  parseInt(landlordData[9]),
                  parseInt(landlordData[8]),
                  parseInt(landlordData[2]),
                  parseInt(landlordData[4]),
                  parseInt(landlordData[3]),
                  img_uri,
                  address,
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
      parseInt(deposit),
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
      <NavBar type={2} />

      <h1 style={{ "line-height": "1.5" }}>All Listings</h1>
      <div className="feature-product-container">
        {globalListingData.map((dataPoint) => {
          return (
            <div className="feature-product-box card">
              <ListingCard dataPoint={dataPoint} />

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
                      dataPoint[10],
                      dataPoint[6],
                      (dataPoint[8] * sharesChosen) / dataPoint[5],
                      (dataPoint[7] * sharesChosen) / dataPoint[5],
                      parseInt(sharesChosen),
                      dataPoint[0]
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
