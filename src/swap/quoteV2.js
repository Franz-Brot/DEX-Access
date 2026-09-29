import { ethers } from "../utils/ethers.esm.min.js";
import { V2_Factory, V2_Router } from "../config/contracts.js";


// Quote v2
export async function quoteV2(
    tokenIn,
    tokenOut,
    amountIn
) {
    // find v2 pool
    const pool = await V2_Factory.getPair(
        tokenIn.address,
        tokenOut.address
    );

    
    if (pool === ethers.constants.AddressZero)
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
            pool,
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