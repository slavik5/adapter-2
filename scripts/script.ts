import {ethers} from "hardhat";


async function main() {
  
  const Adapter= await ethers.getContractFactory("Adapter");
  const adapter = await Adapter.deploy("0xf164fC0Ec4E93095b804a4795bBe1e041497b92a",60);
  await adapter.deployed();
  
  
  console.log("Adapter deployed to:", adapter.address);  
  
}


main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
