/** Latest changes:
 * truncate decimals correctly when using max button
 * added not enough balance option for swap button
 * added weird div classes ".input-group.swap.swap-input input" and ".input-group.swap.swap-output input" for distinguishing between swap and pool
 * added swapPage identifier to not have multiple listeners with new pages 
 * removed unused imports
 * added unique eventListeners only for swap page
 * interact button for swap now active, when slippage = 0%, added "select token" to renderSwapBTN
 * removed if in renderAmounts, when there is no route for swapping from output field to swap button (No liquidity available)
 * 
*/

import { swapState } from "./swapState.js";
import { openTokenModal } from "../utils/tokenModal.js";
import { truncateDecimals } from "../utils/utils.js";
import { setSlippage, switchTokens } from "./swapCore.js";
import { displayDecimals } from "../config/constants.js";
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
        getSwapElements(".input-group .token-btn");

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


// render balances
function renderBalances() {
    const balanceIn =
        getSwapElement(".balanceIn");

    const balanceOut =
        getSwapElement(".balanceOut");

    if (balanceIn) {
        const value =
            swapState.balanceInLoading
                ? "Loading..."
                : truncateDecimals(
                    swapState.balanceIn || 0
                );

        // Only change balance amt
        const balanceText = balanceIn.querySelector(".balance");

        if (balanceText) {
            balanceText.textContent = `Balance: ${value}`;
        }
    }

    if (balanceOut) {
        const value =
            swapState.balanceOutLoading
                ? "Loading..."
                : truncateDecimals(
                    swapState.balanceOut || 0
                );

        const balanceText = balanceOut.querySelector(".balance");

        if (balanceText) {
            balanceText.textContent = `Balance: ${value}`;
        }
    }
}



// render input amounts
function renderAmounts() {
    const inputIn =
        getSwapElement(
            ".input-group.swap.tokenIn input"
        );

    const inputOut =
        getSwapElement(
            ".input-group.swap.tokenOut input"
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

        } else {
            inputOut.value = "";
        }
    }
}


// Render route
function renderRoute() {
    const routeElement =
        getSwapElement("#swapRoute");

    const infoPanel =
        getSwapElement(".swap-info-panel");

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
        getSwapElement("#minimumReceived");

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
        getSwapElement("#executionPrice");

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
        getSwapElement(".interact-btn.swap");


    if (!button) return;

    // approving
    if (swapState.txStatus === "approving") {
        button.textContent = "Approving...";
        button.disabled = true;
        return;
    }
    // swapping
    if (swapState.txStatus === "swapping") {
        button.textContent = "Swapping...";
        button.disabled = true;
        return;
    }

    // wallet not connected
    if (!userAddress) {
        button.textContent = "Connect wallet";
        button.disabled = true;
        return;
    }

    // missing token selection
    if (!swapState.tokenIn || !swapState.tokenOut) {
        button.textContent = "Select tokens";
        button.disabled = true;
        return;
    }


    // no route available
    if (!swapState.bestRoute && swapState.tokenIn &&  swapState.inputIn && swapState.tokenOut) {
        button.textContent = "No liquidity available";
        button.disabled = true;
        return;
    }


    // check for missing inputs, if one missing, disable swap button
    const inputMissing =
        !swapState.tokenIn ||
        !swapState.tokenOut ||
        !swapState.inputIn ||
        swapState.slippage == null ||
        !Number.isFinite(Number(swapState.slippage)) ||
        Number(swapState.slippage) < 0;

    if (inputMissing) {
        button.textContent = "Swap";
        button.disabled = true;
        return;
    }


    // missing approval
    if (swapState.needsApproval) {
        button.textContent =
            `Approve ${swapState.tokenIn?.symbol || ""}`;

        button.disabled = false;
        return;
    }

    //not enough balance
    if (swapState.inputIn>swapState.balanceIn) {
        button.textContent =
            `Not enough ${swapState.tokenIn?.symbol || ""} balance`;

        button.disabled = true;
        return;
    }

    // swap (default button text)
    button.textContent = "Swap";
    button.disabled = false;
}


// render transaction status 
function renderStatus() {

    const status =
        getSwapElement("txStatus");
    if (!status)
        return;
    status.textContent =
        swapState.txStatus;
}

// for eventListeners
function getSwapPage() {
    return document.getElementById("swapPage");
}

function getSwapElement(selector) {
    return getSwapPage()?.querySelector(selector) ?? null;
}

function getSwapElements(selector) {
    return getSwapPage()?.querySelectorAll(selector) ?? [];
}


// EVENT LISTENER
export function initSwapEvents() {

    const inputIn =
        getSwapElement(".input-group.swap.tokenIn input");

    const tokenButtons =
        getSwapElements(".input-group .token-btn");

    const maxButton =
        getSwapElement(".max-btn-swap");

    const slippageInput =
        getSwapElement("#slippageInput");

    const swapButton =
        getSwapElement(".interact-btn.swap");

    const importTokenButton =
        getSwapElement("importTokenBtn");

    const tokenAddressInput =
        getSwapElement("tokenAddressInput");

    const swapSwitchButton =
        getSwapElement(".swap-switch");


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
            swapState.inputIn = truncateDecimals(swapState.balanceIn, displayDecimals);
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