
/*
 * created file
*/

import { truncateDecimals } from "../../utils/utils.js";
import { poolsV2State } from "./poolsV2State.js";


// for renderer and eventListeners
function getPoolsV2Page() {
    return document.getElementById("poolPage-v2");
}

function getPoolsV2Element(selector) {
    return getPoolsV2Page()?.querySelector(selector) ?? null;
}

function getPoolsV2Elements(selector) {
    return getPoolsV2Page()?.querySelectorAll(selector) ?? [];
}


// Render V2 pools
export function renderPoolsV2() {
    if (!getPoolsV2Page()) {
        console.warn("Pool page V2 not found.");
        return;
    }

    renderPoolsV2Tokens();
    renderPoolLPToken();
    renderPoolsV2Balances();
    renderPoolsV2Amounts();
    renderPoolsV2Buttons();
    renderPoolsV2Info();
    renderPoolsV2Status();
}


// Render token button selection A and B 
function renderPoolsV2Tokens() {
    const tokenButtons = getPoolsV2Elements(".token-btn");


    const tokenAButton = tokenButtons[0];
    const tokenBButton = tokenButtons[1];

    if (tokenAButton) {
        tokenAButton.textContent = poolsV2State.tokenA
            ? `${poolsV2State.tokenA.symbol} ▼`
            : "Token A ▼";
    }

    if (tokenBButton) {
        tokenBButton.textContent = poolsV2State.tokenB
            ? `${poolsV2State.tokenB.symbol} ▼`
            : "Token B ▼";
    }

    const isRemove = poolsV2State.action === "remove";

    tokenButtons.forEach(button => {
        button.disabled = isRemove || poolsV2State.isLoading;
    });
}


// Render pool balances
function renderPoolsV2Balances() {
    const balanceA = getPoolsV2Element(".balanceA");
    const balanceB = getPoolsV2Element(".balanceB");
    const balanceLP = getPoolsV2Element(".balanceLP");

    if (balanceA) {
        const value = poolsV2State.balanceALoading
            ? "Loading..."
            : truncateDecimals(
                poolsV2State.balanceA || 0
            );

        const balanceText = balanceA.querySelector(".balance");

        if (balanceText) {
            balanceText.textContent = `Balance: ${value}`;
        }
    }

    if (balanceB) {
        const value = poolsV2State.balanceBLoading
            ? "Loading..."
            : truncateDecimals(
                poolsV2State.balanceB || 0
            );

        const balanceText = balanceB.querySelector(".balance");

        if (balanceText) {
            balanceText.textContent = `Balance: ${value}`;
        }
    }

    if (balanceLP) {
        const value = poolsV2State.balanceLPLoading
            ? "Loading..."
            : truncateDecimals(
                poolsV2State.balanceLP || 0
            );

        const balanceText = balanceLP.querySelector(".balance");

        if (balanceText) {
            balanceText.textContent = `Balance: ${value}`;
        }
    }
}


// render input amounts
function renderPoolsV2Amounts() {
    const isAdd = poolsV2State.action === "add";
    const isRemove = poolsV2State.action === "remove";

    const inputA = getPoolsV2Element(".input-token.A");
    const inputB = getPoolsV2Element(".input-token.B");
    const inputLP = getPoolsV2Element(".input-token.LP");

    if (inputA) {
        inputA.value = poolsV2State.amountA
            ? truncateDecimals(poolsV2State.amountA)
            : "";
        inputA.readOnly = isRemove;
    }

    if (inputB) {
        inputB.value = poolsV2State.amountB
            ? truncateDecimals(poolsV2State.amountB)
            : "";
        inputB.readOnly = isRemove;
    }

    if (inputLP) {
        inputLP.value = poolsV2State.amountLP
            ? truncateDecimals(poolsV2State.amountLP)
            : "";
        inputLP.readOnly = isAdd;
    }
}


// render interact button
function renderPoolsV2Buttons() {
    const isAdd = poolsV2State.action === "add";
    const isRemove = poolsV2State.action === "remove";

    const maxButtons = getPoolsV2Elements(".max-btn-pools");
    const lpGroup = getPoolsV2Element(".lp-group");
    const interactButton = getPoolsV2Element(".interact-btn.pool");

    maxButtons.forEach((button, index) => {
        const visible = isAdd
            ? index < 2
            : index === 2;

        button.classList.toggle("hidden", !visible);
    });

    if (lpGroup) {
        lpGroup.classList.remove("hidden");
    }

    if (!interactButton) return;

    interactButton.textContent = isRemove ? "Remove" : "Add";

    const busyStatuses = [
        "approving",
        "adding",
        "removing"
    ];

    interactButton.disabled =
        poolsV2State.isLoading ||
        busyStatuses.includes(poolsV2State.txStatus);

    if (poolsV2State.isLoading) {
        interactButton.textContent = "Loading...";
    } else if (poolsV2State.txStatus === "approving") {
        interactButton.textContent = "Approve...";
    } else if (poolsV2State.txStatus === "adding") {
        interactButton.textContent = "Adding...";
    } else if (poolsV2State.txStatus === "removing") {
        interactButton.textContent = "Removing...";
    }
}


// render pool info panel
function renderPoolsV2Info() {
    const poolInfo = getPoolsV2Element(".pool-info-panel");

    if (!poolInfo) return;

    poolInfo.classList.toggle(
        "hidden",
        !poolsV2State.showPoolInfo
    );

    if (!poolsV2State.showPoolInfo) return;

    if (poolsV2State.isPoolLoading) {
        poolInfo.textContent = "Loading pool information...";
        return;
    }

    if (poolsV2State.pairExists) {
        poolInfo.innerHTML = `
            <div class="pool-info-title">
                ${poolsV2State.poolName || "V2 Pool"}
            </div>

            <div class="pool-info-row">
                <span>LP Token Symbol:</span>
                <strong>${poolsV2State.pairSymbol || "Unknown"}</strong>
            </div>

            <div class="pool-info-row">
                <span>Pair Address:</span>
                <span class="pool-address">${poolsV2State.pairAddress}</span>
            </div>
        `;
    } else {
        poolInfo.textContent = "New pool. No existing pair found.";
    }
}


// render transaction status 
function renderPoolsV2Status() {
    let status = getPoolsV2Element(".pool-tx-status");

    if (!status) {
        status = document.createElement("div");
        status.className = "pool-tx-status";

        const interactButton =
            getPoolsV2Element(".interact-btn.pool");

        if (interactButton) {
            interactButton.insertAdjacentElement("afterend", status);
        } else {
            return;
        }
    }

    status.textContent = poolsV2State.error
        ? String(poolsV2State.error)
        : poolsV2State.txHash
            ? `Transaction: ${poolsV2State.txHash}`
            : "";

    status.classList.toggle(
        "hidden",
        !poolsV2State.error && !poolsV2State.txHash
    );
}


// Render LP token name
function renderPoolLPToken() {
    const lpTokenButton = getPoolsV2Element(".lp-token-btn");

    if (!lpTokenButton) return;

    if (poolsV2State.poolName) {
        lpTokenButton.textContent = poolsV2State.poolName;
    } else {
        lpTokenButton.textContent = "Select Pool";
    }
}


// register UI events once
export function initPoolsV2Events() {
    const poolsV2 = getPoolsV2Page();

    if (
        !poolsV2 ||
        poolsV2.dataset.rendererInitialized === "true"
    ) {
        return;
    }

    poolsV2.dataset.rendererInitialized = "true";

    // Amount inputs
    getPoolsV2Element(".input-token.A")
        ?.addEventListener("input", event => {
            poolsV2State.amountA = event.target.value;
            poolsV2State.onAmountAChange?.(event.target.value);
        });

    getPoolsV2Element(".input-token.B")
        ?.addEventListener("input", event => {
            poolsV2State.amountB = event.target.value;
            poolsV2State.onAmountBChange?.(event.target.value);
        });

    getPoolsV2Element(".input-token.LP")
        ?.addEventListener("input", event => {
            poolsV2State.amountLP = event.target.value;
            poolsV2State.onAmountLPChange?.(event.target.value);
        });

    // MAX buttons
    getPoolsV2Elements(".max-btn-pools").forEach((button, index) => {
        button.addEventListener("click", () => {
            if (poolsV2State.isLoading) return;

            if (poolsV2State.action === "add" && index === 0) {
                poolsV2State.onMaxA?.();
            } else if (
                poolsV2State.action === "add" &&
                index === 1
            ) {
                poolsV2State.onMaxB?.();
            } else if (
                poolsV2State.action === "remove" &&
                index === 2
            ) {
                poolsV2State.onMaxLP?.();
            }
        });
    });

    // Token selection
    getPoolsV2Elements(".token-btn:not(.lp-token-btn)").forEach((button, index) => {
        button.addEventListener("click", () => {
            if (
                poolsV2State.action !== "add" ||
                poolsV2State.isLoading
            ) {
                return;
            }

            poolsV2State.onTokenSelect?.(index);
        });
    });

    // Slippage
    getPoolsV2Element("#slippageInput")
        ?.addEventListener("change", event => {
            const value = Number(event.target.value);

            if (!Number.isFinite(value) || value < 0) {
                event.target.value = String(poolsV2State.slippage);
                return;
            }

            poolsV2State.slippage = value;
            poolsV2State.onSlippageChange?.(value);
        });

    // Add / Remove
    getPoolsV2Element(".interact-btn.pool")
        ?.addEventListener("click", () => {
            if (poolsV2State.isLoading) return;
            poolsV2State.onSubmit?.();
        });

    renderPoolsV2();
}


