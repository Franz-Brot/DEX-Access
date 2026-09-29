import { readProvider } from "../utils/readProvider.js";
import { V2_Factory_ABI, V2_Router_ABI, V3_Factory_ABI, V3_Quoter_ABI, V3_Router_ABI } from "./abis.js";
import { V2_FACTORY_Address, V2_ROUTER_Address, V3_FACTORY_Address, V3_QUOTER_Address, V3_ROUTER_Address } from "./constants.js";
import { ethers } from "..//utils/ethers.esm.min.js";

export let V2_Factory;
export let V2_Router;

export let V3_Factory;
export let V3_Router;
export let V3_Quoter;


// Contract initiliazation with readonly provider, no signer
export function initializeContracts() {
    V2_Router = new ethers.Contract(
        V2_ROUTER_Address,
        V2_Router_ABI,
        readProvider
    );

    V2_Factory = new ethers.Contract(
        V2_FACTORY_Address,
        V2_Factory_ABI,
        readProvider
    );

    V3_Factory = new ethers.Contract(
        V3_FACTORY_Address,
        V3_Factory_ABI,
        readProvider
    );

    V3_Router = new ethers.Contract(
        V3_ROUTER_Address,
        V3_Router_ABI,
        readProvider
    );

    V3_Quoter = new ethers.Contract(
        V3_QUOTER_Address,
        V3_Quoter_ABI,
        readProvider
    );
};

initializeContracts();