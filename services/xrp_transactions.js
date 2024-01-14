import { Client, xrpToDrops, Wallet, getBalanceChanges } from "xrpl";

async function xrp_transact(client_seed, amount, type) {
  let dest_seed = "";
  let sender_seed = "";
  if (type == "fund") {
    dest_seed = "sEd7eKtkQ3xWEbGPteFtRRGvvniWbuN";
    sender_seed = client_seed;
  } else {
    dest_seed = client_seed;
    sender_seed = "sEd7eKtkQ3xWEbGPteFtRRGvvniWbuN";
  }

  //const wallet = xrpl.Wallet.fromSeed("sEdTBbPTsU8SpYrXTT8L3Ljs4aBbrmk");
  const client = new Client("wss://s.altnet.rippletest.net:51233");
  await client.connect();
  const prepared = await client.autofill({
    TransactionType: "Payment",
    Account: Wallet.fromSeed(sender_seed).address, //sender_add,
    Amount: xrpToDrops(amount),
    Destination: Wallet.fromSeed(dest_seed).address, //dest_add,
  });
  const max_ledger = prepared.LastLedgerSequence;
  const signed = Wallet.fromSeed(sender_seed).sign(prepared);
  const tx = await client.submitAndWait(signed.tx_blob);

  const bal_overview = getBalanceChanges(tx.result.meta);

  await client.disconnect();

  if (type == "fund") {
    return bal_overview[1]["balances"][0]["value"];
  } else {
    return bal_overview[1]["balances"][0]["value"];
  }
}

export default xrp_transact;
