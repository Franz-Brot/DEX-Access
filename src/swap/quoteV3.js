import { ethers } from "../utils/ethers.esm.min.js";
import { V3_Factory, V3_Quoter } from "../config/contracts.js";


// Quote v3
export async function quoteV3(
    tokenIn,
    tokenOut,
    amountIn,
    fee
) {

   // find v3 pool based on fee
    const pool = await V3_Factory.getPool(
        tokenIn.address,
        tokenOut.address,
        fee
    );

    
    if (pool === ethers.constants.AddressZero)
        return null;
    // quote v3 based on fee
    try {
        const [
            amountOut,
            sqrtPriceX96After,
            initializedTicksCrossed,
            gasEstimate
            ]
             = await V3_Quoter.callStatic.quoteExactInputSingle({
            tokenIn: tokenIn.address,
            tokenOut: tokenOut.address,
            amountIn,
            fee,
            sqrtPriceLimitX96: 0
        });
        //console.log("V3:", fee,  ethers.utils.formatUnits(amountOut, tokenOut.decimals) );

        // return v3 quote data
        return {
            protocol: "V3",
            fee,
            pool,
            tokenIn,
            tokenOut,
            amountIn,
            amountOut,

            // v3 specific
            sqrtPriceX96After,
            initializedTicksCrossed,
            gasEstimate
        };
    }
    catch (err) {
        console.error(`V3 Quote (${fee}), pool but no liquidity`, err);
        return null;
    }
}