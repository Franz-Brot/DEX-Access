import { ethers } from "./ethers.esm.min.js";
import { readProvider } from "./readProvider.js";
import { V2_Factory } from "../config/contracts.js";
import { V2_Pair_ABI } from "../config/abis.js";


// Get V2 pair address
export async function getV2PairAddress(tokenA, tokenB) {
    return await V2_Factory.getPair(
        tokenA,
        tokenB
    );
}

// Get V2 pair contract
export function getV2PairContract(pairAddress) {
    return new ethers.Contract(
        pairAddress,
        V2_Pair_ABI,
        readProvider
    );
}


