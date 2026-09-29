import { DefaultDeadline, nativeAddress, V2_ROUTER_Address, V3_ROUTER_Address, WNATIVE } from "../config/constants.js";
import { V2_Router, V3_Router } from "../config/contracts.js";
import { approveToken, showTxToast, updateTxToast } from "../utils/utils.js";
import { signer, userAddress } from "../utils/wallet.js";
import { refreshAllowance, refreshBalances } from "./swapCore.js";
import { renderSwap } from "./swapRenderer.js";
import { swapState } from "./swapState.js";


// tx deadline 
function getDeadline() {
    return Math.floor(Date.now() / 1000) + DefaultDeadline * 60;
}


// Execute Swap
export async function executeSwap() {
    const route = swapState.bestRoute;

    // return error when no route is found
    if (!route)
        throw new Error("No route.");


    // if approval needed -> approve first
    if (swapState.needsApproval) {

    try {
        await approveIfNeeded(route);

    } catch (error) {
        throw error;
    }

    await refreshAllowance();

    renderSwap();
    return;
}

let tx;

// route to dedicated v2 or v3 functions in swapExecutor.js
try {
    switch (route.protocol) {
        case "V2":
            tx = await executeV2(route);
            break;

        case "V3":
            tx = await executeV3(route);
            break;

        default:
            throw new Error(
                `unknown protocol: ${route.protocol}`
            );
    }

} catch (error) {

    console.error("Swap failed:", error);
    throw error;
}


// tx signed and sent
const toastId = showTxToast({
    action: `Swap ${route.tokenIn.symbol} → ${route.tokenOut.symbol}`,
    hash: tx.hash
});


// waiting for confirmed or failed tx
try {

    await tx.wait();

    updateTxToast(toastId, {
        status: "confirmed",
        hash: tx.hash
    });

} catch (error) {

    updateTxToast(toastId, {
        status: "failed",
        hash: tx.hash
    });

    throw error;
}

    //refresh and rerender
    await refreshBalances();
    await refreshAllowance();
    renderSwap();

    return tx;
}


// execute v2 swap
async function executeV2(route) {

    const {
        tokenIn,
        tokenOut,
        amountIn,
        amountOut
    } = route;

    const deadline = getDeadline();

    const isNativeIn =
        tokenIn.address === nativeAddress;

    const isNativeOut =
        tokenOut.address === nativeAddress;

    const V2_ROUTER = V2_Router.connect(signer);


    // Native -> Token
    if (isNativeIn && !isNativeOut) {
        return await V2_ROUTER.swapExactETHForTokens(
            swapState.minimumReceivedRaw,
            [
                nativeAddress,
                tokenOut.address
            ],
            userAddress,
            deadline,
            {
                value: amountIn
            }
        );
    }


    // Token -> Native
    if (!isNativeIn && isNativeOut) {
        return await V2_ROUTER.swapExactTokensForETH(
            amountIn,
            swapState.minimumReceivedRaw,
            [
                tokenIn.address,
                nativeAddress
            ],
            userAddress,
            deadline
        );
    }


    // Token -> Token
    if (!isNativeIn && !isNativeOut) {
        return await V2_ROUTER.swapExactTokensForTokens(
            amountIn,
            swapState.minimumReceivedRaw,
            [
                tokenIn.address,
                tokenOut.address
            ],
            userAddress,
            deadline
        );
    }

    throw new Error("Native → Native not supported.");
}

// execute v3 swap
async function executeV3(route) {

    const {
        tokenIn,
        tokenOut,
        fee,
        amountIn,
        amountOut
    } = route;

    const deadline = getDeadline();

    const isNativeIn =
        tokenIn.address === nativeAddress;

    const isNativeOut =
        tokenOut.address === nativeAddress;

    // "connect" signer to v3 router for swap execution
    const V3_ROUTER = V3_Router.connect(signer);

    
    // Native -> Native
    if (isNativeIn && isNativeOut) {
        throw new Error(
            "Native → Native not supported."
        );
    }


    // Native -> Token
    if (isNativeIn && !isNativeOut) {
        const params = {
            tokenIn: WNATIVE,
            tokenOut: tokenOut.address,
            fee,
            recipient: userAddress,
            deadline,
            amountIn,
            amountOutMinimum: swapState.minimumReceivedRaw,
            sqrtPriceLimitX96: 0
        };

        return await V3_ROUTER.exactInputSingle(
            params,
            {
                value: amountIn
            }
        );
    }


    // Token -> Native
    if (!isNativeIn && isNativeOut) {
        const params = {
            tokenIn: tokenIn.address,
            tokenOut: WNATIVE,
            fee,
            recipient: V3_ROUTER_Address,
            deadline,
            amountIn,
            amountOutMinimum: swapState.minimumReceivedRaw,
            sqrtPriceLimitX96: 0
        };

        const swapCalldata =
            V3_ROUTER.interface.encodeFunctionData(
                "exactInputSingle",
                [params]
            );

        const unwrapCalldata =
            V3_ROUTER.interface.encodeFunctionData(
                "unwrapWNative",
                [
                    swapState.minimumReceivedRaw,
                    userAddress
                ]
            );

        return await V3_ROUTER.multicall(
            [
                swapCalldata,
                unwrapCalldata
            ]
        );
    }


    // Token -> Token
    if (!isNativeIn && !isNativeOut) {
        const params = {
            tokenIn: tokenIn.address,
            tokenOut: tokenOut.address,
            fee,
            recipient: userAddress,
            deadline,
            amountIn,
            amountOutMinimum: swapState.minimumReceivedRaw,
            sqrtPriceLimitX96: 0
        };
    

    return await V3_ROUTER.exactInputSingle(params);
    }
}


// approve token if needed
async function approveIfNeeded(route) {

    if (!route || !route.tokenIn) {
        throw new Error("No viable swap route.");
    }


    // no approval for native needed
    if (tokenIn.address === nativeAddress) {
        return;
    }

    // declare spender v2 or v3 router
    let spender;

    switch (route.protocol) {
        case "V2":
            spender = V2_ROUTER_Address;
            break;

        case "V3":
            spender = V3_ROUTER_Address;
            break;

        default:
            throw new Error(
                `Unknown protocol: ${route.protocol}`
            );
    }


    // return if already approved
    if (!swapState.needsApproval) {
        return;
    }

    // approve
    const tx = await approveToken(
    route.tokenIn,
    spender,
    route.amountIn
);


if (!tx) {
    throw new Error("Error on approval, no transaction sent.");
}


// update interact button text to "approve"
const toastId = showTxToast({
    action: `Approve ${tokenIn.symbol}`,
    hash: tx.hash
});

// wait for approval and refresh toast
try {
    await tx.wait();

    updateTxToast(toastId, {
        status: "confirmed",
        hash: tx.hash
    });

} catch (error) {

    updateTxToast(toastId, {
        status: "failed",
        hash: tx.hash
    });

    throw error;
}
}