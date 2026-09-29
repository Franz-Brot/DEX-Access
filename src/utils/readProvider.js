// read provider to be able to quote or import token adress without wallet connection
import { ethers } from "./ethers.esm.min.js";
import { DMC_RPC_URL } from "../config/constants.js";

export const readProvider = new ethers.providers.JsonRpcProvider(
    DMC_RPC_URL
);