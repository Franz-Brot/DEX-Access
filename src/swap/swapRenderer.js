import { swapState } from "./swapState.js";
import { openTokenModal } from "../utils/tokenModal.js";
import { truncateDecimals } from "../utils/utils.js";
import { setSlippage, switchTokens } from "./swapCore.js";
import { percentDecimals } from "../config/constants.js";
import { userAddress } from "../utils/wallet.js";


// Main render
export function renderSwap() {
    renderTokens();
    renderBalances();
    renderAmounts();
    renderRoute();
    renderMinimumReceived();
    renderExecutionPrice();
    renderSwapBtn();
    renderStatus();
}


// Render token button selection input and output
function renderTokens() {
    const tokenButtons =
        document.querySelectorAll(".input-group .token-btn");

    const tokenInButton = tokenButtons[0];
    const tokenOutButton = tokenButtons[1];

    if (tokenInButton) {

        tokenInButton.textContent =
            swapState.tokenIn
                ? `${swapState.tokenIn.symbol} ▼`
                : "Token A ▼";
    }

    if (tokenOutButton) {

        tokenOutButton.textContent =
            swapState.tokenOut
                ? `${swapState.tokenOut.symbol} ▼`
                : "Token B ▼";
    }
}


// render Balances
function renderBalances() {
    const balanceIn =
        document.getElementById("balanceIn");

    const balanceOut =
        document.getElementById("balanceOut");

    if (balanceIn) {
        const maxButton =
            balanceIn.querySelector(".max-btn-swap");

        const value =
            swapState.balanceInLoading
                ? "Loading..."
                : truncateDecimals(
                    swapState.balanceIn || 0
                );

        balanceIn.childNodes[0].textContent =
            `Balance: ${value} `;

        if (maxButton) {
            balanceIn.appendChild(maxButton);
        }
    }

    if (balanceOut) {
        const value =
            swapState.balanceOutLoading
                ? "Loading..."
                : truncateDecimals(
                    swapState.balanceOut || 0
                );

        balanceOut.textContent =
            `Balance: ${value}`;
    }
}



// render input amounts
function renderAmounts() {
    const inputIn =
        document.querySelector(
            ".input-group:first-of-type .swap-input"
        );

    const inputOut =
        document.querySelector(
            ".input-group:nth-of-type(2) input"
        );

    // FROM token amount
    if (inputIn) {
        inputIn.value = swapState.inputIn || "";
    }

    // TO token amount
    if (inputOut) {

        // quoting
        if (swapState.isQuoting) {
            inputOut.value = "Quoting...";

        } else if (swapState.inputOut) {
            inputOut.value = truncateDecimals(swapState.inputOut);
        
        // no route or liquidity
        } else if (
            swapState.tokenIn &&
            swapState.tokenOut &&
            swapState.inputIn &&
            !swapState.bestRoute
        ) {
            inputOut.value = "No liquidity available";

        } else {
            inputOut.value = "";
        }
    }
}


// Render route
function renderRoute() {
    const routeElement =
        document.getElementById("swapRoute");

    const infoPanel =
        document.querySelector(".swap-info-panel");

    if (!routeElement || !infoPanel)
        return;

    // quoting
    if (swapState.isQuoting) {
        if (!infoPanel.classList.contains("hidden")) {
            routeElement.textContent = "Quoting...";
        }
        return;
    }

    // no route no quote
    if (!swapState.bestRoute) {

        routeElement.textContent = "—";
        infoPanel.classList.add("hidden");
        return;
    }

    // found route, show info panel
    infoPanel.classList.remove("hidden");

    if (swapState.bestRoute.protocol === "V2") {

        routeElement.textContent = "V2";

    } else {

        routeElement.textContent =
             `V3 ${swapState.routeFee}%`;
    }
}


// render minimum received amount in info panel
function renderMinimumReceived() {
    const element =
        document.getElementById("minimumReceived");

    if (!element)
        return;

    if (swapState.isQuoting) {
            element.textContent = "Quoting...";
            return;
        }

    element.textContent =
        ` ${swapState.tokenOut?.symbol || "—"} ${swapState.minimumReceived}`;
}


// render execution price in info panel
function renderExecutionPrice() {

    const element =
        document.getElementById("executionPrice");

    if (!element)
        return;

    if (swapState.isQuoting) {
            element.textContent = "Quoting...";
            return;
        }

    element.textContent =
    `${swapState.tokenOut?.symbol || "—"}/${swapState.tokenIn?.symbol || "—"} ${swapState.executionPrice} `;
}


// render interact (swap) button
function renderSwapBtn() {

    const button =
        document.querySelector(".interact-btn.swap");

    if (!button) return;


    // when wallet not connected, change button text from swap to connect
    if (!userAddress) {
        button.textContent = "Connect wallet first";
        button.disabled = true;
        return;
    }


    // check for missing inputs, if one missing, disable swap button
    const inputMissing =
        !swapState.tokenIn ||
        !swapState.tokenOut ||
        !swapState.inputIn ||
        !swapState.slippage;

    if (inputMissing) {
        button.textContent = "Swap";
        button.disabled = true;
        return;
    }


    // when input token amount not yet approved, change button text from swap to approve
    if (swapState.needsApproval) {
        button.textContent =
            `Approve ${swapState.tokenIn?.symbol || ""}`;

        button.disabled = false;
        return;
    }


    // swap (default button text)
    button.textContent = "Swap";
    button.disabled = false;
}


// render transaction status 
function renderStatus() {

    const status =
        document.getElementById("txStatus");
    if (!status)
        return;
    status.textContent =
        swapState.txStatus;
}


// EVENT LISTENER
export function initSwapEvents() {

    const inputIn =
        document.querySelector(".input-group:first-of-type .swap-input");

    const tokenButtons =
        document.querySelectorAll(".input-group .token-btn");

    const maxButton =
        document.querySelector(".max-btn-swap");

    const slippageInput =
        document.getElementById("slippageInput");

    const swapButton =
        document.querySelector(".interact-btn.swap");

    const importTokenButton =
        document.getElementById("importTokenBtn");

    const tokenAddressInput =
        document.getElementById("tokenAddressInput");

    const swapSwitchButton =
        document.querySelector(".swap-switch");


    // FROM Token
    tokenButtons[0]?.addEventListener("click", () => {
        openTokenModal({
            type: "swap",
            index: 0
        });
    });


    // TO Token
    tokenButtons[1]?.addEventListener("click", () => {
        openTokenModal({
            type: "swap",
            index: 1
        });
    });


    // FROM Amount
    if (inputIn) {
        inputIn.addEventListener("input", () => {
            // Komma sofort in Punkt umwandeln
            inputIn.value = inputIn.value.replace(",", ".");

            swapState.inputIn = inputIn.value;

            if (typeof swapState.onInputIn === "function") {
                swapState.onInputIn(swapState.inputIn);
            }
        });
    }  


    // MAX
    if (maxButton) {
        maxButton.addEventListener("click", () => {
            if (!swapState.tokenIn)
            return;
            if (!swapState.balanceIn)
                return;
            swapState.inputIn =
                swapState.balanceIn;
            renderAmounts();
            if (
                typeof swapState.onInputIn === "function"
            ) {
                swapState.onInputIn(
                    swapState.inputIn
                );
            }
        });
    }


    // Slippage
    if (slippageInput) {
        slippageInput.addEventListener("input", () => {
            setSlippage(slippageInput.value);
        });
    }


    // Swap / Approve
    if (swapButton) {
        swapButton.addEventListener("click", async () => {
            if (
                typeof swapState.onSwap === "function"
            ) {
                await swapState.onSwap();
            }
        });
    }


    // Import Token
    if (
        importTokenButton &&
        tokenAddressInput
    ) {
        importTokenButton.addEventListener(
            "click",
            () => {

                const address =
                    tokenAddressInput.value.trim();

                if (!address)
                    return;

                if (
                    typeof swapState.onImportToken ===
                    "function"
                ) {

                    swapState.onImportToken(address);
                }
            }
        );
    }

    
    // Swap Switch
    if (swapSwitchButton) {

        swapSwitchButton.addEventListener("click", async () => {
            await switchTokens();
        });
    }
}