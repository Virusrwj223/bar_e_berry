import React, { useEffect, useState } from "react";
import xrp_transact from "../../services/xrp_transactions";
import { ethers } from "ethers";
import { abi, contractAddress } from "../../CompiledContract/constants.js";
import "../styles/Payments.css";
import { useNavigate } from "react-router-dom";
import NavBar from "../widgets/NavBar.jsx";
import listenForTransactionMine from "../../services/listenForTransactionMine.js";

function Payments() {
  const [contract, setContract] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [sign, setSign] = useState(null);
  const [transferAmt, setTransferAmt] = useState("");
  const [terminateStatus, setTerminateStatus] = useState("");
  const [rentalStatus, setRentalStatus] = useState("");
  const [xrpWallet, setXrpWallet] = useState("");
  const [providers, setProviders] = useState(null);
  const [FundBtn, setFundBtn] = useState("Fund");
  const [withdrawBtn, setWithdrawBtn] = useState("Withdraw");
  const [payBtn, setPayBtn] = useState("Pay");
  const [terminateBtn, setTerminateBtn] = useState("Terminate");
  const [sharesOutstanding, setSharesOutstanding] = useState("NO");
  const [rentalCost, setRentalCost] = useState("");
  const [depositCost, setDepositCost] = useState("");
  const [shareSell, setShareSell] = useState(0);
  const navigate = useNavigate();
  /*
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
  */

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
        const renterData = await contract.personToRenter(
          walletAddress,
          walletAddress
        );
        const outstandingShares = parseInt(renterData[11]);
        const rentalCost = parseInt(renterData[9]);
        const depositCost = parseInt(renterData[8]);
        if (outstandingShares > 0) {
          setSharesOutstanding(outstandingShares);
          setRentalCost(`${rentalCost} XRP Rent`);
          setDepositCost(`${depositCost} XRP Deposit`);
        } else {
          setSharesOutstanding("NO");
          setRentalCost(``);
          setDepositCost(``);
        }
        const locked_amt = parseInt(renterData[6]);
        setAmount(locked_amt);
        if (!renterData[7]) {
          setTerminateStatus("Please Start Rental");
          setRentalStatus("Please Start Rental");
        } else {
          if (Date.now() / 1000 >= parseInt(renterData[2])) {
            setTerminateStatus("Please clear rent");
            setRentalStatus("Rent is due");
          } else if (Date.now() / 1000 >= parseInt(renterData[4])) {
            setTerminateStatus("Terminate");
            setRentalStatus("Click button to terminate");
          } else {
            setTerminateStatus("All Good!");
            setRentalStatus("Not time to pay rent");
          }
        }
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

  const transact = async (type) => {
    //sEd7i8dvPzRKeMwXKHRWsjU4pvRJF3C
    const val_change = await xrp_transact(xrpWallet, transferAmt, type);
    if (type == "fund") {
      const transact_change = await contract.deposit(
        walletAddress,
        parseInt(val_change)
      );
      await listenForTransactionMine(transact_change, providers);
      test();
      setFundBtn("Fund");
    } else {
      const transact_change = await contract.withdraw(
        walletAddress,
        -parseInt(val_change)
      );
      await listenForTransactionMine(transact_change, providers);
      test();
      setWithdrawBtn("Withdraw");
    }
  };

  const earlyTerminate = async () => {
    if (terminateStatus == "All Good!" || terminateStatus == "Terminate") {
      try {
        setTerminateBtn("Processing");
        const earlyTerminate = await contract.earlyTerminateRental(
          walletAddress,
          shareSell
        );
        await listenForTransactionMine(earlyTerminate, providers);
        const renterData = await contract.personToRenter(
          walletAddress,
          walletAddress
        );
        const tokenId = parseInt(renterData[12]);
        const listing = await contract.personToLandlord(
          renterData[10],
          tokenId
        );
        const nft_uri = listing[2];
        const deployed_contract_add = listing[1];
        const childContract = new ethers.Contract(
          deployed_contract_add,
          abi,
          sign
        );
        const burn = await childContract.terminateRental(
          nft_uri,
          shareSell,
          walletAddress
        );

        await listenForTransactionMine(burn, providers);

        test();
        setTerminateBtn("Terminate");
      } catch (error) {
        console.log(error);
      }
    }
  };

  const payRent = async () => {
    if (rentalStatus == "Rent is due") {
      try {
        setPayBtn("Processing");
        const rentpayment = await contract.payMonthlyRent(walletAddress);
        await listenForTransactionMine(rentpayment, providers);
        test();
        setPayBtn("Pay");
      } catch (error) {
        console.log(error);
      }
    }
  };

  return (
    <div>
      <NavBar type={"P"} />

      <div className="dashboard">
        <div className="value">
          <h1 id="amountBalanceView" className="status">
            Amount
          </h1>
          <h1>{amount} XRP</h1>
        </div>
        <div className="actions">
          <div id="left_hand" className="left_actions">
            <div className="upper-form-box">
              <div className="button-box">
                <input
                  id="xrpWalletAddress"
                  type="text"
                  className="input-field"
                  placeholder="XRP Seed"
                  value={xrpWallet}
                  onChange={(e) => setXrpWallet(e.target.value)}
                  style={{ color: "black" }}
                />
                <input
                  id="withdrawingAmount"
                  type="text"
                  className="input-field"
                  placeholder="Amount"
                  value={transferAmt}
                  onChange={(e) => setTransferAmt(e.target.value)}
                  style={{ color: "black" }}
                />
                <form className="shared-btn-container">
                  <button
                    id="fundbtn"
                    type="button"
                    className="submit-btn"
                    onClick={() => {
                      setFundBtn("Funding");
                      if (transferAmt != "" && xrpWallet != "") {
                        transact("fund");
                      } else {
                        setFundBtn("Fund");
                      }
                    }}
                  >
                    {FundBtn}
                  </button>
                  <button
                    id="withdrawbtn"
                    type="button"
                    className="submit-btn"
                    onClick={() => {
                      setWithdrawBtn("Withdrawing");
                      if (transferAmt != "" && xrpWallet != "") {
                        transact("withdraw");
                      } else {
                        setWithdrawBtn("Withdraw");
                      }
                    }}
                  >
                    {withdrawBtn}
                  </button>
                </form>
              </div>
            </div>

            <div className="lower-form-box">
              <p id="termination_status" className="terminate-status">
                {terminateStatus}
              </p>
              <div className="terminate-group">
                <input
                  id="withdrawingAmount"
                  type="number"
                  min="1"
                  max={shareSell}
                  className="terminate-shares"
                  placeholder="Shares"
                  value={shareSell}
                  onChange={(e) => setShareSell(parseInt(e.target.value))}
                  style={{ color: "black" }}
                />
                <button
                  id="terminateButton"
                  type="button"
                  className="terminate-btn"
                  onClick={earlyTerminate}
                >
                  {terminateBtn}
                </button>
              </div>
            </div>
          </div>

          <div id="right_hand" className="right-actions">
            <div className="upper-right-actions">
              <p id="rent-payment-indicator" className="payment-status">
                {rentalStatus}
              </p>
              <div className="payment-group">
                <button
                  id="payButton"
                  type="button"
                  className="submit-btn"
                  onClick={payRent}
                >
                  {payBtn}
                </button>
              </div>
            </div>
            <div className="lower-right-actions">
              <div className="shares-status">
                <p>{sharesOutstanding} SHARES</p>
                <p>{rentalCost}</p>
                <p>{depositCost}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Payments;
