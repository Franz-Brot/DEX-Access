import { ERC20_ABI } from "../config/abis.js";
import { displayDecimals, nativeAddress } from "../config/constants.js";
import { ethers } from "./ethers.esm.min.js";
import { userAddress, signer, provider } from "./wallet.js";

// display shortened address
export function shortenAddress(address) {
    return address.slice(0, 6) + "..." + address.slice(-4);
}

// check token approval 
export async function checkApproval(token, spender, amount) {

    if (!token || !token.address) return false;
    if (!amount) return true;
    if (amount.isZero && amount.isZero()) return true;
    if (token.address === nativeAddress) return true;

    if (!provider || !userAddress) return false;

    const contract = new ethers.Contract(token.address, ERC20_ABI, provider);

    const allowance = await contract.allowance(userAddress, spender);

    return allowance.gte(amount);
}

// approve token spending amount
export async function approveToken(token, spender, amount) {

    if (token.address === nativeAddress) return null;

    const contract = new ethers.Contract(token.address, ERC20_ABI, signer);

    return contract.approve(spender, amount);
}

// sanitize inputs, remove comma as decimal, replace as point; only have one point available, remove non numbers, return as string
export function sanitizeNumberInput(value, decimals = 8) {
    if (!value) return "";

    let v = value.replace(/,/g, ".");

    v = v.replace(/[^0-9.]/g, "");

    const firstDot = v.indexOf(".");

    if (firstDot !== -1) {
        v =
            v.slice(0, firstDot + 1) +
            v.slice(firstDot + 1).replace(/\./g, "");
    }

    const parts = v.split(".");

    if (parts.length === 2) {
        v = parts[0] + "." + parts[1].slice(0, decimals);
    }

    return v;
}


// ─── TX toast notification ────────────────────────────────────

let toastContainer = null;

// create toast display only once
function getToastContainer() {
    if (!toastContainer) {
        toastContainer = document.createElement("div");
        toastContainer.id = "txToastContainer";
        document.body.appendChild(toastContainer);
    }
    return toastContainer;
}


// show tx toast
export function showTxToast({ action, hash = null }) {
    const container = getToastContainer();
    const id = "toast-" + Date.now();

    const toast = document.createElement("div");
    toast.className = "tx-toast tx-toast-pending";
    toast.id = id;

    // show shortened explorer hashlink
    const hashLink = hash
        ? `<a class="tx-toast-hash" href="https://mainnet-dmc.mydefichain.com:8441/tx/${hash}" target="_blank" rel="noopener">
            ${shortenAddress(hash)} ↗
        </a>`
        : "";

    // toast display
    toast.innerHTML = `
        <div class="tx-toast-top">
        <span class="tx-toast-action">${action}</span>
        <button class="tx-toast-close">✕</button>
        </div>
        <div class="tx-toast-status">
        <span class="tx-toast-dot"></span>
        <span class="tx-toast-label">Pending...</span>
        </div>
        ${hashLink}
    `;


    // toast closing event listener
    toast.querySelector(".tx-toast-close").addEventListener("click", () => {
        removeTxToast(id);
    });

    // append toast to container and return id for toast backtracing
    container.appendChild(toast);
    return id;
    }

    // update toast when tx confirmed or failed
    export function updateTxToast(id, { status, hash = null }) {
    const toast = document.getElementById(id);
    if (!toast) return;

    const label  = toast.querySelector(".tx-toast-label");
    const dot    = toast.querySelector(".tx-toast-dot");

    if (status === "confirmed") {
        toast.classList.remove("tx-toast-pending");
        toast.classList.add("tx-toast-confirmed");
        if (label) label.textContent = "Confirmed ✓";

        // Add hash link if not already there and hash provided
        if (hash && !toast.querySelector(".tx-toast-hash")) {
        const a = document.createElement("a");
        a.className = "tx-toast-hash";
        a.href = `https://mainnet-dmc.mydefichain.com:8441/tx/${hash}`;
        a.target = "_blank";
        a.rel = "noopener";
        a.textContent = `${shortenAddress(hash)} ↗`;
        toast.appendChild(a);
        }

        setTimeout(() => removeTxToast(id), 5000);

    } else if (status === "failed") {
        toast.classList.remove("tx-toast-pending");
        toast.classList.add("tx-toast-failed");
        if (label) label.textContent = "Failed ✗";
        setTimeout(() => removeTxToast(id), 7000);
    }
}


// remove toast after 5 sec
function removeTxToast(id) {
  const toast = document.getElementById(id);
  if (!toast) return;
  toast.classList.add("tx-toast-exit");
  setTimeout(() => toast.remove(), 5000);
}

// return token address from token object
export function getAddr(token) {
  return token.address;
}


// truncate function return string for display
export function truncateDecimals(value, decimals = displayDecimals) {

    if (!value) return "0";

    const [integer, fraction] = String(value).split(".");

    if (!fraction) return integer;

    return `${integer}.${fraction.slice(0, decimals)}`;
}