const { ethers } = require("hardhat");
const hre = require("hardhat");
const { networks } = require('../hardhat.config')
//const { impersonateAddress } = require("../helpers/misc-utils");

//must create a .env file with the variable PRIVATE_KEY. Usage: process.env.PRIVATE_KEY
require('dotenv').config()


async function main() {

  const stargateRouter = '0x13093E05Eb890dfA6DacecBdE51d24DabAb2Faa1'
  const usdc = '0x4A0D1092E9df255cf95D72834Ea9255132782318'
  const tenth = '100000000000000000'

  const currentNetwork = networks.fuji.url
  console.log("Deploying to current network: ", currentNetwork)

  const provider = new ethers.providers.JsonRpcProvider(currentNetwork)

  let wallet = new ethers.Wallet(process.env.PRIV_KEY, provider);

  let gasPrice = await provider.getGasPrice()

  const params = { gasLimit: String(gasPrice.toString()), gasPrice: String(gasPrice.toString()) }

  const newBalance = await wallet.getBalance()

  console.log("Balance of this wallet is: ", newBalance.toString())

  console.log("Deployer address: ", wallet.address)

  console.log("Deploying Bridgerton...")

  const Bridgerton = await ethers.getContractFactory('Bridgerton')
  const bridgerton = await Bridgerton.connect(wallet).deploy(
    stargateRouter
    //{ params }
  )
  await bridgerton.deployed()

  console.log("Bridgerton Deployed to: ", bridgerton.address)

  console.log("Deploying Vault")
  const Vault = await ethers.getContractFactory("SavorVault");
  const vault = await Vault.connect(wallet).deploy(
    usdc,  //Underlying USDC 
    bridgerton.address,   // Brigerton
    wallet.address   //Keeper,
  )

  await vault.deployed()
  console.log("Vault Deployed: ", vault.address)

  // //set the fee percent
  // Sets performance fee to 10%

  await vault.connect(wallet).setFeePercent(tenth)
  console.log("Target fee Percent set")
  // //Set Target Float
  await vault.connect(wallet).setTargetFloatPercent(tenth)
  console.log("Targe Float Set")

  // //Set harvest deplay and Harvest Window


  // //Initialize the Vault
  await vault.connect(wallet).initialize()
  console.log("Vault initiliazed")

  console.log("Vault Ready to Go")

}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
