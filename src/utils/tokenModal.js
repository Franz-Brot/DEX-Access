import { ethers } from "./ethers.esm.min.js";
import { defaultTokens } from "../config/tokens.js";
import { swapState } from "../swap/swapState.js";
import { handleSwapTokenSelected } from "../swap/swapCore.js";
import { readProvider } from "./readProvider.js";
import { ERC20_ABI } from "../config/abis.js";
import { poolsV2State } from "../pools/V2/poolsV2State.js";
import { handlePoolsV2TokenSelected } from "../pools/V2/poolsV2Core.js";


let tokens = [...defaultTokens];
let modalState = {
  type: null,   // "swap" | "liquidity"
  index: null
};

// prevent multiple initialization of eventListeners
let eventsRegistered = false;

export function initTokenModal() {
    // Always reload tokens (picks up any newly imported ones)
    loadTokensFromStorage();

    // Register document-level events only once for the lifetime of the app
    if (!eventsRegistered) {
    eventsRegistered = true;
    setupModalEvents();
    }
}


// open token list 
export function openTokenModal({ type, index }) {
    modalState.type = type;
    modalState.index = index;

    const modal = document.getElementById("tokenModal");
    if (!modal) return;

    // reset error displays
    clearInputError()
    clearHasFeeError();

    // reset token search after reopening
    const search = document.getElementById("tokenSearch");
    if (search) search.value = "";

    // show token list
    modal.classList.remove("hidden");
    // render token list
    renderTokenList();
}


// render token list
export function renderTokenList(list = tokens) {

  const container = document.getElementById("tokenList");
  if (!container) return;

  container.innerHTML = "";

  list.forEach(token => {

    if (!isTokenAllowed(token)) return;

    const el = document.createElement("div");

    el.className = "token-item";

    el.dataset.address = token.address;

    el.innerText = `${token.symbol} - ${token.name}`;

    container.appendChild(el);
  });
}

// Set selected token and close modal
export async function selectToken(token) {
    if (modalState.type === "swap") {
        await handleSwapTokenSelected(token, modalState.index);

    } else if (modalState.type === "poolsV2") {
        await handlePoolsV2TokenSelected(token, modalState.index);
    }

    closeTokenModal();
}


// Filter to prevent duplicate token entries
function isTokenAllowed(token) {
    const selectedTokens = [];

    switch (modalState.type) {
        case "swap":
            if (swapState) {
                selectedTokens.push(
                    modalState.index === 0
                        ? swapState.tokenOut
                        : swapState.tokenIn
                );
            }
            break;

        case "poolsV2":
            if (poolsV2State) {
                selectedTokens.push(
                    modalState.index === 0
                        ? poolsV2State.tokenB
                        : poolsV2State.tokenA
                );
            }
            break;

        // further modal types
    }

    return !selectedTokens.some(
        selectedToken =>
            selectedToken?.address?.toLowerCase() ===
            token.address?.toLowerCase()
    );
}



function setupModalEvents() {

// token search and filter (symbol, name or address)
document.addEventListener("input", (e) => {
    if (e.target.id !== "tokenSearch") return;

    const value = e.target.value.toLowerCase();

    const filtered = tokens.filter(token =>
      token.symbol.toLowerCase().includes(value) ||
      token.name.toLowerCase().includes(value) ||
      token.address.toLowerCase().includes(value)
    );

    renderTokenList(filtered);
});

// close modal
document.addEventListener("click", (e) => {
    if (e.target.id === "tokenModal") {
      closeTokenModal();
    }
});

// import token button
document.addEventListener("click", async (e) => {
    if (e.target.id !== "importTokenBtn") return;

    const input = document.getElementById("tokenAddressInput");
    const address = input.value.trim();

    importToken(address);
});

// select token
document.addEventListener("click", (e) => {
    const item = e.target.closest(".token-item");

    if (!item) return;

        const token = tokens.find(
            t =>
                t.address.toLowerCase() ===
                item.dataset.address.toLowerCase()
        );
    if (!token) {return;}
        selectToken(token);
});
}


// input error
function setInputError(msg) {
    const input = document.getElementById("tokenAddressInput");

    if (input) {
        input.style.border = "2px solid #e05252";
        input.title = msg;
    }
}

function clearInputError() {
    const input = document.getElementById("tokenAddressInput");

    if (input) {
        input.style.border = "";
        input.title = "";
    }
}


// fee error
function setHasFeeError() {
    const hasFeeQuestion = document.querySelector(".import-hasFee");

    if (hasFeeQuestion) {
        hasFeeQuestion.classList.add("import-hasFee-error");
    }
}

function clearHasFeeError() {
    const hasFeeQuestion = document.querySelector(".import-hasFee");

    if (hasFeeQuestion) {
        hasFeeQuestion.classList.remove("import-hasFee-error");
    }
}


//import token
async function importToken(address) {

    const input = document.getElementById("tokenAddressInput");

    // clear old errors
    clearInputError();
    clearHasFeeError();

    // valid address format
    if (!address.startsWith("0x") || address.length !== 42) {
        setInputError("Invalid address format");
        alert("Invalid address");
        return;
    }

    // already imported?
    const alreadyExists = tokens.some(
        t =>
            t.address.toLowerCase() ===
            address.toLowerCase()
    );

    if (alreadyExists) {

        const existing = tokens.find(
            t =>
                t.address.toLowerCase() ===
                address.toLowerCase()
        );

        setInputError(
            `Already in list: ${existing?.symbol || "token"}`
        );

        alert(
            `Token already in list${
                existing?.symbol
                    ? ": " + existing.symbol
                    : ""
            }`
        );

        return;
    }

    // Fee-on-transfer
    const feeOption = document.querySelector(
        'input[name="import-tokenFeeRadio"]:checked'
    );

    if (!feeOption) {

        setHasFeeError();

        alert(
            "Please select whether the token has a Fee-on-Transfer."
        );

        return;
    }

    const hasFee = feeOption.value === "true";


    // read token from blockchain
    try {

        const contract = new ethers.Contract(
            address,
            ERC20_ABI,
            readProvider
        );

        const name = await contract.name();
        const symbol = await contract.symbol();
        const decimals = await contract.decimals();

        // create token
        const newToken = {
            name,
            symbol,
            address,
            decimals,
            hasFee
        };


        tokens.push(newToken);

        saveTokens();

        // reset input
        if (input) {
            input.value = "";
        }

        clearInputError();
        clearHasFeeError();

        // clear radio buttons hasFee
        resetTokenFeeImportForm();
        // update token list
        renderTokenList();

    } catch (err) {
        console.error("Token import failed:", err);
        console.error("Error message:", err?.message);
        console.error("Error code:", err?.code);

        setInputError("Token not found on chain");
        alert(`Token not valid: ${err?.reason || err?.message || "Unknown error"}`);
    }
}

// reset radio buttons for has Fee form on successful import
function resetTokenFeeImportForm() {
    document.querySelectorAll(
        'input[name="import-tokenFeeRadio"]'
    ).forEach(radio => {
        radio.checked = false;
    });

    const input = document.getElementById("tokenAddressInput");

    if (input) {
        input.value = "";
    }
}


// save only custom token to local storage
function saveTokens() {
  const customTokens = tokens.filter(
    t => !defaultTokens.some(d => d.address === t.address)
  );

  localStorage.setItem("customTokens", JSON.stringify(customTokens));
}

// load tokens from storage
function loadTokensFromStorage() {
  const stored = localStorage.getItem("customTokens");
  if (!stored) return;

  const parsed = JSON.parse(stored);

  parsed.forEach(newToken => {
    const exists = tokens.some(
      t => t.address.toLowerCase() === newToken.address.toLowerCase()
    );

    if (!exists) {
      tokens.push(newToken);
    }
  });
}

// close token modal
export function closeTokenModal() {
  document.getElementById("tokenModal").classList.add("hidden");

 // reset state
  modalState.type = null;
  modalState.index = null;
}

// load token modal
export async function loadTokenModal() {
    const response = await fetch("../../tokenModal.html");
    
    if (!response.ok) {
        throw new Error(`Failed to load token modal: ${response.status}`);
    }
    const html = await response.text();

    document.body.insertAdjacentHTML("beforeend", html);
}
