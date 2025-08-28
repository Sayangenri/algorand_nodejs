// transfer_step.mjs
import * as algokit from '@algorandfoundation/algokit-utils'
import algosdk from 'algosdk'
import readline from 'readline/promises'
import { stdin as input, stdout as output } from 'node:process'

const rl = readline.createInterface({ input, output })
const wait = async (msg) => { await rl.question(`\n${msg} — press Enter to continue...`) }

// 🚀 Step 1: Setup Algod client (TestNet)
const algod = algokit.getAlgoClient({
  server: 'https://testnet-api.algonode.cloud',
  port: '',
  token: ''
})

async function main() {
  // 🚀 Step 2: Recover sender account from mnemonic
  console.log("Step 2) Recover sender account")
  const mnemonic = ""; // fill in your 25-word mnemonic here
  const sender = algosdk.mnemonicToSecretKey(mnemonic)
  console.log("Sender Address:", sender.addr.toString())
  await wait('Sender recovered')

  // 🚀 Step 3: Define receiver
  const receiver = "GFOBZK4SCMRZMSWBYFE3Z7XY5DQ7SF3HDY2AMYFJ3BZCG7LYBZWO6PFD5U"
  console.log("Receiver Address:", receiver)
  await wait('Receiver set')

  // 🚀 Step 4: Check balances before txn
  console.log("\nStep 4) Checking balances...")
  let senderInfo = await algod.accountInformation(sender.addr).do()
  let receiverInfo = await algod.accountInformation(receiver).do()
  console.log("Sender Balance :", (Number(senderInfo.amount) / 1e6).toFixed(6), "ALGO")
  console.log("Receiver Balance:", (Number(receiverInfo.amount) / 1e6).toFixed(6), "ALGO")
  if (senderInfo.amount < 1000000n) {
    console.error("❌ Not enough funds in sender! Fund it here: https://bank.testnet.algorand.network/")
    process.exit(1)
  }
  await wait('Balances checked')

  // 🚀 Step 5: Get suggested params
  console.log("\nStep 5) Getting suggested params...")
  const suggestedParams = await algod.getTransactionParams().do()
  await wait('Params fetched')

  // 🚀 Step 6: Build transaction
  console.log("\nStep 6) Building 1 ALGO transfer transaction...")
  const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    sender: sender.addr,
    receiver,
    amount: 1e6, // 1 ALGO
    note: new TextEncoder().encode("TestNet transfer with AlgoKit"),
    suggestedParams,
  })
  await wait('Transaction built')

  // 🚀 Step 7: Sign transaction
  console.log("\nStep 7) Signing transaction...")
  const signedTxn = txn.signTxn(sender.sk)
  const txId = txn.txID().toString()
  console.log("Signed TxID:", txId)
  await wait('Transaction signed')

  // 🚀 Step 8: Send transaction
  console.log("\nStep 8) Sending transaction...")
  await algod.sendRawTransaction(signedTxn).do()
  console.log("✅ Transaction sent! TxID:", txId)
  await wait('Transaction sent')

  // 🚀 Step 9: Wait for confirmation
  console.log("\nStep 9) Waiting for confirmation...")
  const confirmedTxn = await algosdk.waitForConfirmation(algod, txId, 10)
  console.log("🎉 Transaction confirmed in round", confirmedTxn['confirmed-round'])
  await wait('Transaction confirmed')

  // 🚀 Step 10: Decode note
  if (confirmedTxn.txn.txn.note) {
    console.log("Note:", new TextDecoder().decode(new Uint8Array(confirmedTxn.txn.txn.note)))
  }
  await wait('Note checked')

  // 🚀 Step 11: Check balances after txn
  console.log("\nStep 11) Checking balances after transfer...")
  senderInfo = await algod.accountInformation(sender.addr).do()
  receiverInfo = await algod.accountInformation(receiver).do()
  console.log("New Sender Balance :", (Number(senderInfo.amount) / 1e6).toFixed(6), "ALGO")
  console.log("New Receiver Balance:", (Number(receiverInfo.amount) / 1e6).toFixed(6), "ALGO")
  await wait('Balances updated')

  await rl.close()
}

main().catch(err => {
  console.error('Unexpected error:', err)
  rl.close()
})
