// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;
import "./Token.sol";

import "@openzeppelin/contracts/access/AccessControl.sol";
//import '@uniswap/v2-periphery/contracts/interfaces/IWETH.sol';
//import "@uniswap/v2-periphery/contracts/libraries/UniswapV2Library.sol";
import "@uniswap/v2-core/contracts/interfaces/IUniswapV2Pair.sol";
import '@uniswap/v2-core/contracts/interfaces/IUniswapV2Factory.sol';
import '@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router01.sol';
contract Adapter{
    address routerAdd;
    uint256 delay;
    IUniswapV2Router01 Router;
    IUniswapV2Factory Factory;
    constructor(address router_, uint256 delay_)
    {
        routerAdd=router_;
        delay=delay_;
        Router = IUniswapV2Router01(routerAdd);
        Factory = IUniswapV2Factory(Router.factory());
    }

    function createPair(address tokenA, address tokenB) external returns (address pair)
    {
        return Factory.createPair(tokenA,tokenB);
    }
    
    function addLiquidity(
    address tokenA,
    address tokenB,
    uint amountADesired,
    uint amountBDesired,
    address to
    )   external {
        Token(tokenA).transferFrom(to, address(this), amountADesired);
        Token(tokenB).transferFrom(to, address(this), amountBDesired);

        Token(tokenA).approve(routerAdd, amountADesired);
        Token(tokenB).approve(routerAdd, amountBDesired);

        if (Factory.getPair(tokenA,tokenB) == address(0)) {
            Router.addLiquidity(
                tokenA,
                tokenB,
                amountADesired,
                amountBDesired,
                0,
                0,
                to,
                block.timestamp+delay
            );
        } else {
            (uint256 reserveA, uint256 reserveB) = getReservesSort(tokenA, tokenB);
            //(uint256 reserveA, uint256 reserveB,)=IUniswapV2Pair(Factory.getPair(tokenA, tokenB)).getReserves();
            if (reserveA >= reserveB) {
                uint256 maxAmountB = Router.getAmountOut(amountADesired, reserveA, reserveB);
                (, uint256 sentB, ) = Router.addLiquidity(
                    tokenA,
                    tokenB,
                    amountADesired,
                    maxAmountB,
                    0,
                    0,
                    to,
                    block.timestamp+delay
                );
                Token(tokenB).transfer(to, amountBDesired - sentB);
            } else {
                uint256 maxAmountA = Router.getAmountIn(amountBDesired, reserveA, reserveB);
                (uint256 sentA, , ) = Router.addLiquidity(
                    tokenA,
                    tokenB,
                    maxAmountA,
                    amountBDesired,
                    0,
                    0,
                    to,
                    block.timestamp+delay
                );
                Token(tokenA).transfer(to, amountADesired - sentA);
            }
        }
    }

    function removeLiquidity(
    address tokenA,
    address tokenB,
    address to
    )   external returns (uint amountA, uint amountB){
        address pair = Factory.getPair(tokenA, tokenB);
        uint256 liquidity = Token(pair).balanceOf(to);
        Token(pair).transferFrom(to, address(this), liquidity);
        Token(pair).approve(routerAdd, liquidity);
        return Router.removeLiquidity(tokenA, tokenB,liquidity,0,0,to,block.timestamp+delay);
    }

    function removeLiquidityETH(
    address token,
    address to
    ) external returns (uint amountToken, uint amountETH){
        address weth=Router.WETH();
        address pair = Factory.getPair(token, weth);
        uint256 liquidity = Token(pair).balanceOf(to);
        Token(pair).transferFrom(to, address(this), liquidity);
        Token(pair).approve(routerAdd, liquidity);
        return IUniswapV2Router01(routerAdd).removeLiquidityETH(token,liquidity,0,0,to,block.timestamp+delay);
    }

    function addLiquidityETH(
    address token,
    uint amountTokenDesired,
    address to
    ) external payable {
        address weth=Router.WETH();
        Token(token).transferFrom(to, address(this), amountTokenDesired);
        

        Token(token).approve(routerAdd,amountTokenDesired);
        
        if (Factory.getPair(token, weth) == address(0)) {
            Router.addLiquidityETH{value:msg.value}(
                token,
                amountTokenDesired,
                0,
                0,
                to,
                block.timestamp+delay
            );
        } else {
            (uint256 reserveA, uint256 reserveB) = getReservesSort(token,weth);

            if (reserveA >= reserveB) {
                uint256 maxAmountB = Router.getAmountOut(amountTokenDesired, reserveA, reserveB);
                (, uint256 sentB, ) = Router.addLiquidityETH{value:maxAmountB}(
                    token,
                    amountTokenDesired,
                    0,
                    0,
                    to,
                    block.timestamp+delay
                );
                payable(to).transfer(msg.value - sentB);
            } else {
                uint256 maxAmountA = Router.getAmountIn(msg.value, reserveA, reserveB);
                (uint256 sentA, ,) = Router.addLiquidityETH{value:msg.value}(
                    token,
                    maxAmountA,
                    0,
                    0,
                    to,
                    block.timestamp+delay
                );
                Token(token).transfer(to, amountTokenDesired - sentA);
            }
        }
    
    } 

    function getReservesSort(address tokenA, address tokenB) internal view returns(uint256 reserveA, uint256 reserveB) {

        (address token0, ) = tokenA < tokenB ? (tokenA, tokenB) : (tokenB, tokenA);
        (uint reserve0, uint reserve1, ) = IUniswapV2Pair(Factory.getPair(tokenA, tokenB)).getReserves();
        (reserveA, reserveB) = tokenA == token0 ? (reserve0, reserve1) : (reserve1, reserve0);
    }
    function getAmountIn(uint amountOut, address tokenA, address tokenB) internal view returns (uint amountIn){

        (uint reserve0, uint reserve1, ) = IUniswapV2Pair(Factory.getPair(tokenA, tokenB)).getReserves();
        return Router.getAmountIn(amountOut, reserve0, reserve1);

    }
    function getAmountOut(uint amountIn, address tokenA, address tokenB) internal view returns (uint amountOut){
        
        (uint reserve0, uint reserve1 ) = getReservesSort(tokenA,tokenB);
        return Router.getAmountOut(amountIn, reserve0, reserve1);

    }
    function sell(uint256 amountIn,address[] calldata path,address to) external{
        Token(path[0]).transferFrom(to, address(this), amountIn);
        uint256 amountOut =getAmountOut(amountIn, path[0],path[1]);
        Token(path[0]).approve(routerAdd, amountIn);
        Token(path[1]).approve(routerAdd, amountOut);
        Router.swapExactTokensForTokens(
            amountIn,
            amountOut,
            path,
            to,
            block.timestamp + delay
        );

    }
    function buy(uint256 amountOut,address[] calldata path,address to) external{
        Token(path[0]).transferFrom(to, address(this), amountOut);
        uint256 amountIn =getAmountIn(amountOut,  path[0], path[1]);
        Token(path[0]).approve(routerAdd, amountIn);
        Token(path[1]).approve(routerAdd, amountOut);
        Router.swapTokensForExactTokens(
            amountIn,
            amountOut,
            path,
            to,
            block.timestamp + delay
        );

    }
    function swapExactETHForTokens(address tokenA,address[] calldata path,address to) external payable{
        
        address weth=Router.WETH();
        uint256 amountOut =getAmountOut(msg.value,weth, tokenA);
        
        Router.swapExactETHForTokens{value:msg.value}(
            amountOut,
            path,
            to,
            block.timestamp + delay  
        );

    }
    function swapExactTokensForETH(address tokenA, uint256 amountOut,address[] calldata path,address to) external {
        
        address weth=Router.WETH();
        uint256 amountIn =getAmountIn(amountOut, tokenA,weth);
        Router.swapExactTokensForETH(
            amountIn,
            0,
            path,
            to,
            block.timestamp + delay  
        );

    }

} 