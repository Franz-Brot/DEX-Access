import { ethers } from "../utils/ethers.esm.min.js";
import { quoteV2 } from "./quoteV2.js";
import { quoteV3 } from "./quoteV3.js";


// Get best quote out of all 
function getBestQuote(quotes) {
    // Return if no quotes
    if (quotes.length === 0)
        return null;

    // Filter out the best quote out of the array
    return quotes.reduce((best, current) =>
        current.amountOut.gt(best.amountOut)
            ? current
            : best
    );
}


// Get quotes for v2, and all three v3 tiers
export async function getQuotes(tokenIn, tokenOut, inputIn) {

    // return if input is missing
    if (
        !tokenIn ||
        !tokenOut ||
        !inputIn ||
        Number(inputIn) <= 0
    ) {
        return {
            quotes: [],
            bestRoute: null,
            amountIn: "",
            amountOut: ""
        };
    }

    // format input amountIn
    const amountIn = ethers.utils.parseUnits(
        inputIn,
        tokenIn.decimals
    );

    // always quote v2
    const tasks = [
        quoteV2(
            tokenIn,
            tokenOut,
            amountIn
        ).catch(err => {
            console.error("❌ V2 error:", err);
            throw err;
        })
    ];

    // only quote v3 for non fee-on-transfer tokens
    if (!tokenIn.hasFee && !tokenOut.hasFee) {
        tasks.push(
            quoteV3(
                tokenIn,
                tokenOut,
                amountIn,
                500
            ).catch(err => {
                console.error("❌ V3 0.05% error:", err);
                throw err;
            }),

            quoteV3(
                tokenIn,
                tokenOut,
                amountIn,
                3000
            ).catch(err => {
                console.error("❌ V3 0.3% error:", err);
                throw err;
            }),

            quoteV3(
                tokenIn,
                tokenOut,
                amountIn,
                10000
            ).catch(err => {
                console.error("❌ V3 1% error:", err);
                throw err;
            })
        );
    }

        
    // await all quotes
    const results = await Promise.allSettled(tasks);


    // debugging functions
    // filter out rejected quotes and log error in console
    results
        .filter(result => result.status === "rejected")
        .forEach(result => console.error(result.reason));


    // use fulfilled quotes as results
    const quotes = results
        .filter(result => result.status === "fulfilled")
        .map(result => result.value)
        .filter(Boolean);


    // always use same order for results 
    quotes.sort((a, b) => {
        if (a.protocol !== b.protocol)
            return a.protocol.localeCompare(b.protocol);

        return (a.fee ?? 0) - (b.fee ?? 0);
    });


    // call getBestQuote to define best quote
    const bestRoute = getBestQuote(quotes);

    return {
        quotes,
        bestRoute,
        amountIn: inputIn,
        amountOut: bestRoute
            ? ethers.utils.formatUnits(
                bestRoute.amountOut,
                tokenOut.decimals
            )
            : ""
    };
    }