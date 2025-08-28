// account_transfer.mjs
import algosdk from 'algosdk'
import readline from 'readline/promises'
import { stdin as input, stdout as output } from 'node:process'

const rl = readline.createInterface({ input, output })
const wait = async (msg) => { await rl.question(`\n${msg} — press Enter to continue...`) }

// Setup Algod client (TestNet)
const algod = new algosdk.Algodv2(
  "",
  "https://testnet-api.algonode.cloud",
  ""
)

async function main() {
  // 🚀 Step 1: Create two accounts
  console.log('Step 1) Create accounts ->')
  const camilo = algosdk.generateAccount()
  const juan = algosdk.generateAccount()

  console.log('\nAddress1:', camilo.addr)
  console.log('Mnemonic (save for faucet funding):')
  console.log(algosdk.secretKeyToMnemonic(camilo.sk))

  console.log('\nAddress2:', juan.addr)
  console.log('Mnemonic (save for faucet funding):')
  console.log(algosdk.secretKeyToMnemonic(juan.sk))

  await wait('Accounts created')

  // 🚀 Step 2: Fund accounts manually
  console.log('\nStep 2) Fund both accounts with at least 10 ALGO each')
  console.log('👉 Go to faucet: https://bank.testnet.algorand.network/ or https://lora.algokit.io/')
  console.log(`Fund Account1: ${camilo.addr}`)
  console.log(`Fund Account2  : ${juan.addr}`)
  await wait('Press Enter after funding the accounts')

  // 🚀 Step 3: Check balances automatically after funding
  console.log('\nStep 3) Checking balances...')
  let infoCamilo = await algod.accountInformation(camilo.addr).do()
  let infoJuan = await algod.accountInformation(juan.addr).do()

  console.log(`Account1 Balance: ${(Number(infoCamilo.amount) / 1e6).toFixed(6)} ALGO`)
  console.log(`Account2 Balance  : ${(Number(infoJuan.amount) / 1e6).toFixed(6)} ALGO`)

  await wait('Balances checked')

  await rl.close()
}

main().catch(err => {
  console.error('Unexpected error:', err)
  rl.close()
})
