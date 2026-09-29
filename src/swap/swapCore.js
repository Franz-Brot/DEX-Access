import { ethers } from "../utils/ethers.esm.min.js";
import { swapState, resetSwapState } from "./swapState.js";
import { initSwapEvents, renderSwap } from "./swapRenderer.js";
import { getQuotes } from "./quoteEngine.js";
import { checkApproval, approveToken, truncateDecimals, showTxToast, updateTxToast, sanitizeNumberInput} from "../utils/utils.js";
import { displayDecimals, nativeAddress, percentDecimals, V2_ROUTER_Address, V3_ROUTER_Address, WNATIVE } from "../config/constants.js";
import { userAddress, userBalance} from "../utils/wallet.js";
import { executeSwap } from "./swapExecutor.js";


// Initialize swap
export function initSwap() {
    // delete swap state on page refresh or change
    resetSwapState();
    // hook for token modal
    hookOnInputIn();
    // event-listeners for input events
    initSwapEvents();

    //rerender on connected wallet
    window.addEventListener("walletConnected", async () => {
        await refreshBalances();
    });

    // renderswap page based on swapstate
    renderSwap();

    
}


// Token symbol selection
export async function setTokenIn(token) {
    swapState.tokenIn = token;
    await refreshBalanceIn();
    renderSwap();
    updateQuotes();
}


export async function setTokenOut(token) {
    swapState.tokenOut = token;
    await refreshBalanceOut();
    renderSwap();
    updateQuotes();
}


// Switch input and output token symbols and balances
export async function switchTokens() {
    // Token tauschen
        const oldTokenIn = swapState.tokenIn;
        swapState.tokenIn = swapState.tokenOut;
        swapState.tokenOut = oldTokenIn;

        // refresh display
        await refreshSwap();
        await refreshBalanceIn();
        await refreshBalanceOut();

}


// Set token in input value and quote, replace comma as decimal 
export async function setInputIn(value) {
    swapState.lastChanged = "in";
    value = sanitizeNumberInput(value, displayDecimals);
    swapState.inputIn = value;
    await updateQuotes();
}


// Set slippage value and quote
export async function setSlippage(value) {
    value = sanitizeNumberInput(value, percentDecimals);

    swapState.slippage = Number(value);

    const slippageInput = document.getElementById("slippageInput");

    if (slippageInput) {
        slippageInput.value = value;
    }

    await updateQuotes();
}


// --------------------------------------------------
// for future exact output swaps
// --------------------------------------------------

//export async function setInputOut(value) {
//    swapState.lastChanged = "out";
//   swapState.inputOut = value;
//    // for later exact output

//}


// Refresh balances
export function refreshBalances() {
    refreshBalanceIn();
    refreshBalanceOut();
}


// refresh balance in
export async function refreshBalanceIn() {
    if (!swapState.tokenIn)
        return;

    swapState.balanceInLoading = true;
    renderSwap();

    try {
        swapState.balanceIn =
            await userBalance(
                swapState.tokenIn,
                userAddress
            );
    } catch (error) {
        console.error(
            "Error loading input balance:",
            error
        );
    } finally {
        swapState.balanceInLoading = false;
        renderSwap();
    }
}


// refresh balance out
export async function refreshBalanceOut() {
    if (!swapState.tokenOut)
        return;

    swapState.balanceOutLoading = true;

    renderSwap();

    try {
        swapState.balanceOut =
            await userBalance(
                swapState.tokenOut,
                userAddress
            );
    } catch (error) {
        console.error(
            "Error loading output balance:",
            error
        );

    } finally {
        swapState.balanceOutLoading = false;

        renderSwap();
    }
}

// check for current token input allowance
export async function refreshAllowance() {


    // return on missing wallet connection or input
    if (!userAddress ||!swapState.tokenIn || !swapState.bestRoute || !swapState.inputIn) {
        swapState.needsApproval = false;
        return;
    }

    // no approval for native needed
    if (swapState.tokenIn.address === nativeAddress) {
        swapState.needsApproval = false;
        return;
    }

    // define spender
    const spender =
        swapState.bestRoute.protocol === "V2"
            ? V2_ROUTER_Address
            : V3_ROUTER_Address;

    // convert input amount to the token's smallest unit
    const amountIn = ethers.utils.parseUnits(
        swapState.inputIn,
        swapState.tokenIn.decimals
    );

    swapState.allowanceToken = swapState.tokenIn;
    swapState.allowanceAmount = amountIn;

    //check approval
    const approved = await checkApproval(
        swapState.allowanceToken,
        spender,
        swapState.allowanceAmount
    );
    swapState.needsApproval = !approved;
}


// Refresh quote and rerender
async function refreshSwap() {

    await updateQuotes();
    renderSwap();

}


// update quotes 
export async function updateQuotes() {

    //console.log("tokenIn:", swapState.tokenIn);
    //console.log("tokenOut:", swapState.tokenOut);
    //console.log("inputIn:", swapState.inputIn);
    swapState.isQuoting = true;
    renderSwap();
    swapState.bestRoute = null;
    swapState.quotes = [];

    // return on missing inputs
    if (
        !swapState.tokenIn ||
        !swapState.tokenOut ||
        !swapState.inputIn
    ) {
        swapState.inputOut = "";
        swapState.quotes = [];
        swapState.isQuoting = false;
        swapState.txStatus = "idle";
        renderSwap();
        return;
    }


    try {
        // call getQuotes
        const result = await getQuotes(
            swapState.tokenIn,
            swapState.tokenOut,
            swapState.inputIn
        );      

        // save quotes, routes and amountOut
        swapState.quotes = result.quotes;
        swapState.bestRoute = result.bestRoute;
        swapState.inputOut = result.amountOut;

        // check token input allowance
        await refreshAllowance();

        // for best route = v3 show fee tier as decimal -> 10000 to 1; 3000 to 0.3; 500 to 0,05;
        swapState.routeFee = result.bestRoute?.protocol === "V3"
            ? result.bestRoute.fee / 10000
            : null;

        // calculate execution price based on best route's quote; excluding fee on transfer or ecosystem fee
        swapState.executionPrice = result.bestRoute
            ? getExecutionPrice(
            result.bestRoute.amountOut,
            result.bestRoute.amountIn,
            swapState.tokenIn.decimals,
            swapState.tokenOut.decimals
        )
        : "";

        // calculate minimum received based on best route output and slippage input
        const minimumReceived = result.bestRoute
            ? getMinimumReceived(
                result.bestRoute.amountOut,
                swapState.slippage,
                swapState.tokenOut.decimals
            )
            : null;

        swapState.minimumReceived = minimumReceived
            ? minimumReceived.minimumReceived
            : "";

        swapState.minimumReceivedRaw = minimumReceived
            ? minimumReceived.minimumReceivedRaw
            : null;
    //console.log("BEST ROUTE:", result.bestRoute);
    //console.log("INPUT OUT:", result.amountOut);
    //console.log("MINIMUM RECEIVED:", swapState.minimumReceived);

        // after successful best route rerender swap and return quotes, best route and amount out
        swapState.isQuoting = false;
        renderSwap();
        return result;

    } catch (err) {

        console.error(err);

        swapState.quotes = [];
        swapState.bestRoute = null;
        swapState.inputOut = "";
        swapState.isQuoting = false;
        renderSwap();
        return null;

    }
}


// Minimum received
function getMinimumReceived(amountOut, slippage, decimals) {

    if (!amountOut)
        throw new Error("amountOut missing.");

    if (!Number.isFinite(slippage)) {
        throw new Error("Slippage error.");
    }

    if (slippage < 0 || slippage >= 100) {
        throw new Error(
            "Slippage needs to be between 0 and 100."
        );
    }

    const slippageBps = Math.round(slippage * 100);

    const minimumRaw = amountOut
        .mul(10000 - slippageBps)
        .div(10000);

    const minimumReceived = truncateDecimals(
        ethers.utils.formatUnits(
            minimumRaw,
            decimals
        )
    );

    return {
        minimumReceived,
        minimumReceivedRaw: minimumRaw
    };;
}


// Average execution price based on quote, excluding fee on transfer/ ecosystem fees
function getExecutionPrice(amountOut, amountIn, tokenInDecimals, tokenOutDecimals) {
    if (!amountOut || !amountIn)
        return "";

    const amountInFormatted =
        ethers.utils.formatUnits(
            amountIn,
            tokenInDecimals
        );

    const amountOutFormatted =
        ethers.utils.formatUnits(
            amountOut,
            tokenOutDecimals
        );

    const executionPrice =
        Number(amountOutFormatted) /
        Number(amountInFormatted);

    return truncateDecimals(executionPrice);
}


// Hook for token modal
function hookOnInputIn() {

    swapState.onInputIn = async (amount) => {
        await updateQuotes();
    };

    swapState.onSwap = async () => {
        await executeSwap();
    };
}