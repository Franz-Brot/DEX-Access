import { DefaultDeadline, DefaultSlippage } from "../config/constants.js";


// ─── State ────────────────────────────────────────────────────
export const swapState = {

    // Selected tokens
    tokenIn: null,
    tokenOut: null,

    // User inputs
    inputIn: "",
    inputOut: "",
    lastChanged: "in",

    // Wallet balances
    balanceIn: 0n,
    balanceOut: 0n,
    balanceInLoading: false,
    balanceOutLoading: false,

    // Approval
    allowance: 0n,
    allowanceToken: null,
    needsApproval: false,

    // Swap settings
    slippage: DefaultSlippage,
    deadline: DefaultDeadline,

    // Transaction state
    txStatus: "idle", // idle | quoting | approving | swapping | success | error
    txHash: null,
    error: null,

    // Quotes
    isQuoting: false,
    quotes: [],
    bestRoute: null,
    //lastQuoteTime: null,


    // Quote information
    executionPrice: "",
    minimumReceived: "",
    minimumReceivedRaw: "",
    priceImpact: null,

    // Hooks, callbacks, no reset in resetSwapState()
    onTokenSelected: null,
    onInputIn: null,
    onInputOut: null,

};

 
export function resetSwapState() {

    // Selected tokens
    swapState.tokenIn = null;
    swapState.tokenOut = null;

    // User inputs
    swapState.inputIn = "";
    swapState.inputOut = "";
    swapState.lastChanged = "in";

    // Wallet balances
    swapState.balanceIn = 0n;
    swapState.balanceOut = 0n;
    swapState.balanceInLoading = false;
    swapState.balanceOutLoading = false;
    swapState.balanceInFormatted = "";
    swapState.balanceOutFormatted = "";

    // Approval
    swapState.allowance = 0n;
    swapState.allowanceToken = null;
    swapState.needsApproval = false;

    // Transaction state
    swapState.txStatus = "idle";
    swapState.txHash = null;
    swapState.error = null;

    // Quotes
    swapState.isQuoting = false;
    swapState.quotes = [];
    swapState.bestRoute = null;
    //lastQuoteTime: null,

    // Quote information
    swapState.executionPrice = "";
    swapState.minimumReceived = "";
    swapState.minimumReceivedRaw = "";
    swapState.priceImpact = null;
}