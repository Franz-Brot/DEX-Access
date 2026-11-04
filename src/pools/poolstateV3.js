/*
 * created file
*/

import { DefaultSlippage } from "../config/constants";

export const poolsV3State = {
    // token
    tokenA: null,
    tokenB: null,

    // fee tier: 0,05 %, 0,3 % oder 1 %
    fee: 3000,

    // pool status
    poolAddress: null,
    poolExists: false,
    initialized: false,

    // initialization
    initialPrice: "",

    // positionRange
    tickLower: null,
    tickUpper: null,
    priceLower: "",
    priceUpper: "",

    // token inputs
    amountA: "",
    amountB: "",

    // wallet-balances
    balanceA: "0",
    balanceB: "0",

    // token allowances
    allowanceA: "0",
    allowanceB: "0",

    // position data
    tokenId: null,
    liquidity: "0",

    // slippage
    slippage: DefaultSlippage,

    // tx status
    txStatus: "idle",
    txHash: null,
    error: null
};