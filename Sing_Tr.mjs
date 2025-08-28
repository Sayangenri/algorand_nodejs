// sign.mjs
import algosdk from "algosdk";

const mnemonic =
  ""; // fill in your 25-word mnemonic here
async function main() {
  try {
    // 🚀 Step 1: Recover account
    const account = algosdk.mnemonicToSecretKey(mnemonic);
    console.log("Loaded account address:", account.addr);

    // 🚀 Step 2: Setup Algod client (TestNet)
    const algod = new algosdk.Algodv2(
      "",
      "https://testnet-api.algonode.cloud",
      ""
    );

    // 🚀 Step 3: Check balance before txn
    const info = await algod.accountInformation(account.addr).do();

    // convert BigInt → Number safely
    const balanceAlgos = Number(info.amount) / 1e6;
    console.log("Balance:", balanceAlgos, "Algos");

    if (info.amount < 1000n) {
      console.error("❌ Not enough funds! Please fund your TestNet account first:");
      console.error("👉 https://bank.testnet.algorand.network/");
      return;
    }

    // 🚀 Step 4: Get suggested params
    const suggestedParams = await algod.getTransactionParams().do();

    // Build transaction
    const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
      sender: account.addr,
      receiver: account.addr, // self-payment
      amount: 100000, // 0.1 Algo in microAlgos
      note: new TextEncoder().encode("Hello from Node.js"),
      suggestedParams,
    });

    // Sign
    const signedTxn = txn.signTxn(account.sk);

    // ✅ Get txId BEFORE sending
    const txId = txn.txID().toString();

    // Send
    await algod.sendRawTransaction(signedTxn).do();
    console.log("Transaction sent! TxID:", txId);

    // Wait for confirmation
    const confirmedTxn = await algosdk.waitForConfirmation(algod, txId, 10);
    console.log("✅ Transaction confirmed", confirmedTxn);

    // 🚀 Decode note safely
    if (confirmedTxn.txn.txn.note) {
      console.log(
        "Decoded Note:",
        new TextDecoder().decode(new Uint8Array(confirmedTxn.txn.txn.note))
      );
    }
  } catch (err) {
    console.error("Error:", err);
  }
}

main();
