import React, { useState } from "react";
import BARE from "../assets/BAR-E TrxBg.png";
import { ethers } from "ethers";
import { abi, contractAddress } from "../../CompiledContract/constants.js";
import { useNavigate } from "react-router-dom";

function Login() {
  const [contract, setContract] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [address, setAddress] = useState("");
  const navigate = useNavigate();

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

  const auth = async () => {
    if (typeof window.ethereum != "undefined") {
      await window.ethereum.request({ method: "eth_requestAccounts" });
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const walletAddress = signer["address"];
      const contract = new ethers.Contract(contractAddress, abi, signer);
      setWalletAddress(walletAddress);
      setContract(contract);
      try {
        if (address == walletAddress) {
          const existance = await contract.person(address);
          if (existance[0] == "0x0000000000000000000000000000000000000000") {
            const loadingUser = await contract.addPerson(walletAddress);
            await listenForTransactionMine(loadingUser, provider);
            navigate("/payments", { replace: true });
          } else {
            navigate("/payments", { replace: true });
          }
        } else {
          console.log("error");
        }
      } catch (error) {
        console.log(error);
      }
    } else {
      console.log("Not Connected");
    }
  };
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
            style={{ cursor: "pointer" }}
            className="user"
          >
            Login
          </a>
        </div>
      </nav>

      <div className="hero">
        <div className="form-box">
          <div>
            <input
              id="walletAddress"
              type="text"
              className="input-field"
              placeholder="Wallet Address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              style={{ color: "black" }}
            />
            <input type="checkbox" className="check-box" />
            <span>Remember Me</span>
            <button
              id="loginButton"
              type="button"
              className="submit-btn"
              onClick={auth}
            >
              Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
