import { expect } from "chai";
import { ethers } from "hardhat";
import { Contract, ContractFactory } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { parseEther } from "ethers/lib/utils";


let addr: SignerWithAddress[];
let validator: SignerWithAddress;
let Token1: ContractFactory;
let token1: Contract;
let Token2: ContractFactory;
let token2: Contract;
let Token3: ContractFactory;
let token3: Contract;
let Adapter: ContractFactory;
let adapter: Contract;
let zeroAdd: string;
let routeradd;


describe("Adapter contract", function () {


  beforeEach(async () => {
    addr = await ethers.getSigners();
    Token1 = await ethers.getContractFactory("Token");
    token1 = await Token1.deploy();
    
    Token2 = await ethers.getContractFactory("Token");
    token2 = await Token2.deploy();
    Token3 = await ethers.getContractFactory("Token");
    token3 = await Token3.deploy();
    
    
    Adapter = await ethers.getContractFactory("Adapter");
    adapter = await Adapter.deploy("0xf164fC0Ec4E93095b804a4795bBe1e041497b92a",60);
    
    
    await token1.grantRole(await token1.DEFAULT_ADMIN_ROLE(), adapter.address);
    await token2.grantRole(await token2.DEFAULT_ADMIN_ROLE(), adapter.address);
    await token3.grantRole(await token3.DEFAULT_ADMIN_ROLE(), adapter.address);
    
    routeradd="0xf164fC0Ec4E93095b804a4795bBe1e041497b92a"
    zeroAdd = '0x0000000000000000000000000000000000000000';
  });
  describe("createPair", function () {
    it("createPair", async function () {
      await adapter.createPair(token1.address,token2.address);
    });
  });
  describe("addLiquidity", function () {
    it("addLiquidity 1", async function () {
      token1.approve(adapter.address, parseEther("300"));
      token2.approve(adapter.address, parseEther("300"));
      await adapter.addLiquidity(token1.address,token2.address,parseEther("200"),parseEther("300"),addr[0].address);
      const bal=await token1.balanceOf(addr[0].address)
      console.log(bal)
    });
    it("addLiquidity 2", async function () {
      token1.approve(adapter.address, parseEther("300"));
      token2.approve(adapter.address, parseEther("300"));
      await adapter.addLiquidity(token1.address,token2.address,parseEther("300"),parseEther("200"),addr[0].address);
      token1.approve(adapter.address, parseEther("300"));
      token2.approve(adapter.address, parseEther("300"));
      await adapter.addLiquidity(token1.address,token2.address,parseEther("300"),parseEther("200"),addr[0].address);
      const bal=await token2.balanceOf(addr[0].address)
      console.log(bal)
    });
    it("addLiquidity 3", async function () {
      token1.approve(adapter.address, parseEther("300"));
      token2.approve(adapter.address, parseEther("300"));
      
      await adapter.addLiquidity(token1.address,token2.address,parseEther("200"),parseEther("300"),addr[0].address);
      token1.approve(adapter.address, parseEther("300"));
      token2.approve(adapter.address, parseEther("300"));
      
      await adapter.addLiquidity(token1.address,token2.address,parseEther("200"),parseEther("300"),addr[0].address);
      const bal=await token1.balanceOf(addr[0].address)
      console.log(bal)
    });
  });
  describe("removeLiquidity", function () {
    it("removeLiquidity", async function () {
      token1.approve(adapter.address, parseEther("300"));
      token2.approve(adapter.address, parseEther("300"));
      await adapter.addLiquidity(token1.address,token2.address,parseEther("200"),parseEther("300"),addr[0].address);
      const bal=await token1.balanceOf(addr[0].address)
      console.log(bal)
      await adapter.removeLiquidity(token1.address,token2.address,addr[0].address);
      const bal2=await token1.balanceOf(addr[0].address)
      console.log(bal2)
    });
  });
  describe("addLiquidityETH", function () {
    it("addLiquidityETH 1", async function () {
      token1.approve(adapter.address, parseEther("300"));
      await adapter.addLiquidityETH(token1.address,parseEther("200"),addr[0].address,{value:parseEther("200")});
      const bal=await token1.balanceOf(addr[0].address)
      console.log(bal)
    });
    it("addLiquidityETH 2", async function () {
      token1.approve(adapter.address, parseEther("300"));
      await adapter.addLiquidityETH(token1.address,parseEther("300"),addr[0].address,{value:parseEther("250")});
      token1.approve(adapter.address, parseEther("300"));
      await adapter.addLiquidityETH(token1.address,parseEther("300"),addr[0].address,{value:parseEther("250")});
      const bal=await token1.balanceOf(addr[0].address)
      console.log(bal)
    });
    it("addLiquidityETH 3", async function () {
      token1.approve(adapter.address, parseEther("300"));
      await adapter.addLiquidityETH(token1.address,parseEther("200"),addr[0].address,{value:parseEther("300")});
      token1.approve(adapter.address, parseEther("300"));
      await adapter.addLiquidityETH(token1.address,parseEther("200"),addr[0].address,{value:parseEther("300")});
      const bal=await token1.balanceOf(addr[0].address)
      console.log(bal)
    });
  });

  describe("sell", function () {
    it("sell 1", async function () {
      token1.approve(adapter.address, parseEther("300"));
      token2.approve(adapter.address, parseEther("300"));
      await adapter.addLiquidity(token1.address,token2.address,parseEther("200"),parseEther("300"),addr[0].address);
      let path: string[]=[token1.address,token2.address]
      await adapter.sell(parseEther("50"),path,addr[0].address);
      const bal=await token1.balanceOf(addr[0].address)
      console.log(bal)
      const bal2=await token2.balanceOf(addr[0].address)
      console.log(bal2)
    });
  });
  describe("buy", function () {
    it("buy 1", async function () {
      token1.approve(adapter.address, parseEther("300"));
      token2.approve(adapter.address, parseEther("300"));
      await adapter.addLiquidity(token1.address,token2.address,parseEther("200"),parseEther("300"),addr[0].address);
      let path: string[]=[token1.address,token2.address]
      await adapter.buy(parseEther("50"),path,addr[0].address);
      const bal=await token1.balanceOf(addr[0].address)
      console.log(bal)
      const bal2=await token2.balanceOf(addr[0].address)
      console.log(bal2)
    });
  });
  describe("swapExactTokensForETH", function () {
    it("swapExactTokensForETH", async function () {
      token1.approve(adapter.address, parseEther("300"));
      await adapter.addLiquidityETH(token1.address,parseEther("200"),addr[0].address,{value:parseEther("200")});
      const bal=await token1.balanceOf(addr[0].address)
      console.log(bal)
      let path: string[]=[token1.address, "0xc778417e063141139fce010982780140aa0cd5ab"]
      await adapter.swapExactTokensForETH(token1.address,parseEther("20"),path,addr[0].address);
      const bal2=await token2.balanceOf(addr[0].address)
      console.log(bal2)
    });
  });
  describe("swapExactETHForTokens", function () {
    it("swapExactETHForTokens", async function () {
      token1.approve(adapter.address, parseEther("300"));
      await adapter.addLiquidityETH(token1.address,parseEther("200"),addr[0].address,{value:parseEther("200")});
      const bal=await token1.balanceOf(addr[0].address)
      console.log(bal)
      let path: string[]=[ "0xc778417e063141139fce010982780140aa0cd5ab",token1.address]
      await adapter.swapExactETHForTokens(token1.address,path,addr[0].address,{value:parseEther("20")});
      const bal2=await token2.balanceOf(addr[0].address)
      console.log(bal2)
    });
  });

});