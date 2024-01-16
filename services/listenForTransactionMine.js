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

export default listenForTransactionMine;
