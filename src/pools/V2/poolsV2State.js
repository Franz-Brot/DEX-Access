
/*
 * created file
*/

import { DefaultSlippage } from "../../config/constants.js";

export const poolsV2State = {
    // Tokens
    tokenA: null,
    tokenB: null,

    // Action: add or remove liquidity
    action: "add",

    // Token inputs
    amountA: "",
    amountB: "",
    amountLP: "",

    // Wallet balances
    balanceA: "0",
    balanceB: "0",
    balanceLP: "0",
    balanceALoading: false,
    balanceBLoading: false,
    balanceLPLoading: false,

    // Pool data
    lpTokenSymbol: "",
    lpTokenName: "",
    lpTotalSupply: "0",
    pairAddress: null,
    pairExists: false,
    pairSymbol:"",
    poolName: "", 
    isPoolLoading: false,
    reserveA: "0",
    reserveB: "0",
    lpTotalSupply: "0",

    // Token allowances
    allowanceA: "0",
    allowanceB: "0",

    // Slippage
    slippage: DefaultSlippage,

    // UI state
    isLoading: false,
    showPoolInfo: false,

    // Transaction status
    txStatus: "idle",
    txHash: null,
    error: null,

    // Callbacks: amounts
    onAmountAChange: null,
    onAmountBChange: null,
    onAmountLPChange: null,

    // Callbacks: MAX buttons
    onMaxA: null,
    onMaxB: null,
    onMaxLP: null,

    // Callbacks: token selection
    onTokenSelect: null,

    // Callbacks: slippage
    onSlippageChange: null,

    // Callback: add/remove liquidity
    onSubmit: null
};
