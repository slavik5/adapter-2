import "@nomiclabs/hardhat-waffle";
import "solidity-coverage"
import "@nomiclabs/hardhat-etherscan";
// import "hardhat-typechain";
import * as dotenv from "dotenv";

dotenv.config();



module.exports = {
  solidity: {
      compilers: [{
          version: '0.8.4',
          
        },
        {
          version: '0.6.6',
          
        },
        
      ],
  
    },

  networks: {
    hardhat: {
      accounts: {
        mnemonic: process.env.MNEMONIC,
      },
      forking: {
        url: "https://eth-rinkeby.alchemyapi.io/v2/dnF4zncBN_bGVJCxul1oLmpT9jjRO2ah",
        blockNumber: 10513880
      }
    },
    rinkeby: {
      url: process.env.ALCHEMY_API_KEY,
      gas: "auto",
      gasPrice: 20000000000,
      accounts: {
        mnemonic: process.env.MNEMONIC,
      },
    }
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN,
  }
};
