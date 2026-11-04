import { ethers } from "../utils/ethers.esm.min.js";
import { V2_Router } from "../config/contracts.js";
import { getV2PairAddress } from "../utils/v2_functions.js";


// Quote v2
export async function quoteV2(
    tokenIn,
    tokenOut,
    amountIn
) {
    // find v2 pairAddress
    const pairAddress = await getV2PairAddress(
        tokenIn.address,
        tokenOut.address
    );

    
    if (pairAddress === ethers.constants.AddressZero)
        return null;
    try {
        // await quote from v2 router
        const amounts = await V2_Router.getAmountsOut(
            amountIn,
            [
                tokenIn.address,
                tokenOut.address
            ]
        );
        //console.log("V2:", ethers.utils.formatUnits(amounts[1], tokenOut.decimals) );

        // return v2 quote data
        return {
            protocol: "V2",
            fee: null,
            pairAddress,
            tokenIn,
            tokenOut,
            amountIn,
            amountOut: amounts[1],
        };
    }
    catch (err) {
        console.error("V2 Quote:", err);
        return null;
    }
}