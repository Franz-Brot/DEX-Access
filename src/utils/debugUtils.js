import { userAddress } from "../utils/wallet.js";
import { swapState } from "../swap/swapState.js";

/**
 * Logs comprehensive debug information to the browser console.
 * Accessible by typing `debug()` in the browser console.
 */
export function debug() {
    console.log("--- Debug Information ---");

    // Wallet status
    console.log(
    "Wallet:",
    userAddress ? "Connected" : "Not connected"
    );

    // Current Page
    let currentPage =
        window.location.hash.replace("#/", "");

    if (!currentPage)
        currentPage = "main";

    console.log("Current Page:", currentPage);


    // Swap State
    console.groupCollapsed("--- Swap State ---");

        console.log("Token In:", swapState.tokenIn);
        console.log("Token Out:", swapState.tokenOut);
        console.log("Input In:", swapState.inputIn);
        console.log("Input Out:", swapState.inputOut);
        console.log("Last Changed:", swapState.lastChanged);
        console.log("Balance In:",swapState.balanceIn);
        console.log("Balance Out:",swapState.balanceOut);
        console.log("Balance In Loading:",swapState.balanceInLoading);
        console.log("Balance Out Loading:",swapState.balanceOutLoading);
        console.log("Allowance:",swapState.allowance);
        console.log("Allowance Token:",swapState.allowanceToken);
        console.log("Needs Approval:",swapState.needsApproval);
        console.log("Slippage:",swapState.slippage);
        console.log("Deadline:",swapState.deadline);
        console.log("Transaction Status:",swapState.txStatus);
        console.log("Transaction Hash:",swapState.txHash);
        console.log("Error:",swapState.error);
        console.log("Quotes:",swapState.quotes);
        console.log("Best Route:",swapState.bestRoute);
        console.log("Execution Price:",swapState.executionPrice);
        console.log("Minimum Received:",swapState.minimumReceived);
        console.log("Minimum Received Raw:",
        swapState.minimumReceivedRaw);
        console.log("Price Impact:",swapState.priceImpact);

    console.groupEnd();



    // Liquidity State
    console.groupCollapsed("--- Liquidity State ---");

        console.log("Token A:",stateLiquidity.tokenA);
        console.log("Token B:",stateLiquidity.tokenB);
        console.log("Input A:",stateLiquidity.inputA);
        console.log("Input B:",stateLiquidity.inputB);
        console.log("Balance A:",stateLiquidity.balanceA);
        console.log("Balance B:",stateLiquidity.balanceB);
        console.log("All Liquidity State Properties:",stateLiquidity);


    console.groupEnd();

    console.log("-------------------------");
}