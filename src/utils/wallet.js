import { shortenAddress } from "./utils.js"; 
import { ethers } from "./ethers.esm.min.js";
import { ERC20_ABI } from "../config/abis.js";
import { nativeAddress } from "../config/constants.js";
import { renderSwap } from "../swap/swapRenderer.js";
import { DMC_RPC_URL } from "../config/constants.js";
import { refreshBalances } from "../swap/swapCore.js";

export let currentChainId = null;
export let provider = null;
export let signer = null;
export let userAddress = null;


// connect wallet 
export async function connectWallet() {
    const button = document.getElementById("walletButton");
    
    // return if no wallet installed
    if (typeof window.ethereum === "undefined") {
        alert("No wallet installed");
        return;
    }

    try {
        const accounts = await window.ethereum.request({
        method: "eth_requestAccounts"
        });

        userAddress = accounts[0];

        currentChainId = await window.ethereum.request({
        method: "eth_chainId"
        });

        provider = new ethers.providers.Web3Provider(window.ethereum);
        signer = provider.getSigner();

        // show shortened wallet address and chain id
        if (button) {
        button.innerText =
            userAddress.slice(0, 6) + "..." + userAddress.slice(-4) +
            " | Net " + parseInt(currentChainId, 16);

        button.classList.add("connected");
        }

        window.dispatchEvent(new Event("walletConnected"));

        // rerender functions
        //refreshBalances();
        //renderSwap();
        

        } catch (error) {
        console.log("Wallet error:", error);
    }
}


// get UserBalance of currentToken
export async function userBalance(currentToken) {

    // return on no provider or user address
    if (!provider || !userAddress) {
        console.log("Wallet not connected");
        return "0";
    }

    // balance for native token
    if (currentToken.address === nativeAddress) {
        const balance = await provider.getBalance(userAddress);
        return ethers.utils.formatEther(balance);
    }

    // balance for non native token
    const contract = new ethers.Contract(
        currentToken.address,
        ERC20_ABI,
        provider
    );

    const rawBalance = await contract.balanceOf(userAddress);
    const decimals = await contract.decimals();
    
    return ethers.utils.formatUnits(rawBalance, decimals);
}


// Track active balance requests
const balanceRequests = new Map();


// Generic token balance refresh
export async function refreshTokenBalance({
    token,
    address = userAddress,
    requestKey,
    setBalance,
    setLoading,
    render,
    label = "Token"
}) {
    // Create a unique ID for this request
    const requestId = Symbol();

    // Mark this request as the latest one
    balanceRequests.set(requestKey, requestId);

    // Check whether this request is still current
    const isCurrentRequest = () =>
        balanceRequests.get(requestKey) === requestId;

    // No token or wallet address
    if (!token || !address) {
        setBalance("0");
        setLoading(false);
        render();
        return;
    }

    setLoading(true);
    render();

    try {
        const balance = await userBalance(token, address);

        // Ignore outdated responses
        if (!isCurrentRequest()) return;

        setBalance(balance);

    } catch (error) {
        // Ignore errors from outdated requests
        if (!isCurrentRequest()) return;

        console.error(`Error loading ${label} balance:`, error);

    } finally {
        // Only the latest request may change the loading state
        if (isCurrentRequest()) {
            setLoading(false);
            render();
        }
    }
}