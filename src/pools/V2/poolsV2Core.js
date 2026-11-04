/*
 * created file
*/
import { ethers } from "../../utils/ethers.esm.min.js";
import { poolsV2State } from "./poolsV2State.js";
import { initPoolsV2Events, renderPoolsV2 } from "./poolsV2Renderer.js";
import { openTokenModal } from "../../utils/tokenModal.js";
import { refreshTokenBalance, userAddress, userBalance } from "../../utils/wallet.js";
import { getV2PairAddress } from "../../utils/v2_functions.js";
import { getPoolName } from "../../utils/utils.js";


// Initialize V2 Pools
export function initPoolsV2() {
    //resetPoolsV2State(); tbd
    hookPoolsV2();
    initPoolsV2Events();
    poolsV2State.onMaxA = handleMaxA;
    poolsV2State.onMaxB = handleMaxB;
    poolsV2State.onMaxLP = handleMaxLP;

    //rerender on connected wallet, remove old before initializing a new one
    window.removeEventListener("walletConnected", handlePoolsV2WalletConnected);
    window.addEventListener("walletConnected", handlePoolsV2WalletConnected);
    
    // renderswap page based on swapstate
    renderPoolsV2();


}

async function handlePoolsV2WalletConnected() {
    await refreshPoolBalances();
    await refreshBalanceLP();
}

// Hook for UI events
function hookPoolsV2() {
    poolsV2State.onTokenSelect = handleTokenSelect;
    poolsV2State.onTokenSelected = handlePoolsV2TokenSelected;

    poolsV2State.onAmountAChange = handleAmountAChange;
    poolsV2State.onAmountBChange = handleAmountBChange;
    poolsV2State.onAmountLPChange = handleAmountLPChange;

    poolsV2State.onMaxA = handleMaxA;
    poolsV2State.onMaxB = handleMaxB;
    poolsV2State.onMaxLP = handleMaxLP;

    poolsV2State.onSlippageChange = handleSlippageChange;
    poolsV2State.onSubmit = handleSubmit;
}


// Token selection: open modal
function handleTokenSelect(index) {
    openTokenModal({ type: "poolsV2", index });
}


// Token selected in modal
export async function handlePoolsV2TokenSelected(token, index) {
    if (index === 0) {
        poolsV2State.tokenA = token;
    } else {
        poolsV2State.tokenB = token;
    }

    poolsV2State.error = null;

    // Reset pool information
    poolsV2State.pairAddress = null;
    poolsV2State.pairExists = false;
    poolsV2State.pairSymbol = "";
    poolsV2State.poolName = "";

    // Refresh balances
    await refreshPoolBalances();

    // Check pair if both tokens are selected
    if (poolsV2State.tokenA && poolsV2State.tokenB) {
        await checkV2Pair();
    }

    renderPoolsV2();
}


// Check whether a V2 pair exists
async function checkV2Pair() {
    const tokenA = poolsV2State.tokenA;
    const tokenB = poolsV2State.tokenB;

    if (!tokenA || !tokenB) return;

    poolsV2State.isPoolLoading = true;
    renderPoolsV2();

    try {
        // Get pair address from factory
        const pairAddress = await getV2PairAddress(
            tokenA.address,
            tokenB.address
        );

        await refreshBalanceLP();

        // No pair exists
        if (pairAddress === "0x0000000000000000000000000000000000000000") {
            poolsV2State.pairAddress = null;
            poolsV2State.pairExists = false;
            return;
        }

        // Pair exists
        poolsV2State.pairAddress = pairAddress;
        poolsV2State.pairExists = true;

        await refreshBalanceLP();

        
    } catch (error) {
        console.error("Failed to check V2 pair:", error);
        poolsV2State.error = "Failed to load pool information.";
    } finally {
        
        poolsV2State.poolName = getPoolName(
            poolsV2State.tokenA,
            poolsV2State.tokenB
        );

        poolsV2State.isPoolLoading = false;
        renderPoolsV2();
    }
}


// Amount A changed
async function handleAmountAChange(amount) {
    // amountA is already stored in the renderer
    // TODO: Calculate amountB using the pool ratio

    renderPoolsV2();
}


// Amount B changed
async function handleAmountBChange(amount) {
    // amountB is already stored in the renderer
    // TODO: Calculate amountA using the pool ratio

    renderPoolsV2();
}


// LP amount changed
async function handleAmountLPChange(amount) {
    // amountLP is already stored in the renderer
    // TODO: Update the liquidity removal preview

    renderPoolsV2();
}


// MAX Token A
async function handleMaxA() {
    if (!poolsV2State.tokenA || !poolsV2State.tokenB) return;

    const balanceA = poolsV2State.balanceA;

    if (!balanceA || ethers.utils.parseUnits(
        balanceA,
        poolsV2State.tokenA.decimals
    ).isZero()) return;

    poolsV2State.amountA = balanceA;

    if (
        poolsV2State.pairExists &&
        poolsV2State.reserveA &&
        poolsV2State.reserveB
    ) {
        poolsV2State.amountB = calculateAmountByRatio(
            balanceA,
            poolsV2State.reserveA,
            poolsV2State.reserveB,
            poolsV2State.tokenA.decimals,
            poolsV2State.tokenB.decimals
        );
    }

    renderPoolsV2();
}

// MAX Token B
async function handleMaxB() {
    if (!poolsV2State.tokenA || !poolsV2State.tokenB) return;

    const balanceB = poolsV2State.balanceB;

    if (!balanceB || ethers.utils.parseUnits(
        balanceB,
        poolsV2State.tokenB.decimals
    ).isZero()) return;

    poolsV2State.amountB = balanceB;

    if (
        poolsV2State.pairExists &&
        poolsV2State.reserveA &&
        poolsV2State.reserveB
    ) {
        poolsV2State.amountA = calculateAmountByRatio(
            balanceB,
            poolsV2State.reserveB,
            poolsV2State.reserveA,
            poolsV2State.tokenB.decimals,
            poolsV2State.tokenA.decimals
        );
    }

    renderPoolsV2();
}

// MAX LP
async function handleMaxLP() {
    // TODO: Set amountLP to the available LP token balance
}

// calculate amounts by ratio
function calculateAmountByRatio(
    amount,
    reserveFrom,
    reserveTo,
    decimalsFrom,
    decimalsTo
) {
    const amountRaw = ethers.utils.parseUnits(
        amount,
        decimalsFrom
    );

    const reserveFromRaw = ethers.utils.parseUnits(
        reserveFrom,
        decimalsFrom
    );

    const reserveToRaw = ethers.utils.parseUnits(
        reserveTo,
        decimalsTo
    );

    if (
        reserveFromRaw.isZero() ||
        reserveToRaw.isZero()
    ) {
        return "";
    }

    const resultRaw = amountRaw
        .mul(reserveToRaw)
        .div(reserveFromRaw);

    return ethers.utils.formatUnits(
        resultRaw,
        decimalsTo
    );
}

// Slippage changed
function handleSlippageChange(value) {
    poolsV2State.slippage = value;
    renderPoolsV2();
}

// Add / Remove liquidity
async function handleSubmit() {
    if (poolsV2State.isLoading) return;

    // TODO: Execute add/remove liquidity
    console.log("V2 Liquidity action:", poolsV2State.action);
}



// Refresh all pool balances
async function refreshPoolBalances() {
    await Promise.all([
        refreshBalanceA(),
        refreshBalanceB()
    ]);
}


// Refresh Token A balance
async function refreshBalanceA() {
    await refreshTokenBalance({
        token: poolsV2State.tokenA,
        requestKey: "poolsV2BalanceA",
        setBalance: value => poolsV2State.balanceA = value,
        setLoading: value => poolsV2State.balanceALoading = value,
        render: renderPoolsV2,
        label: "Token A"
    });
}


// Refresh Token B balance
async function refreshBalanceB() {
    await refreshTokenBalance({
        token: poolsV2State.tokenB,
        requestKey: "poolsV2BalanceB",
        setBalance: value => poolsV2State.balanceB = value,
        setLoading: value => poolsV2State.balanceBLoading = value,
        render: renderPoolsV2,
        label: "Token B"
    });
}


// Refresh LP token balance
async function refreshBalanceLP() {

    if (
        !poolsV2State.pairAddress ||
        !poolsV2State.pairExists ||
        !userAddress
    ) {

        poolsV2State.balanceLP = "0";
        poolsV2State.balanceLPLoading = false;
        renderPoolsV2();
        return;
    }

    poolsV2State.balanceLPLoading = true;
    renderPoolsV2();

    try {
        const lpToken = {
            address: poolsV2State.pairAddress,
            symbol: poolsV2State.pairSymbol,
            decimals: 18
        };

        const balance = await userBalance(
            lpToken,
            userAddress
        );

        poolsV2State.balanceLP = balance;

    } catch (error) {
        console.error("Failed to load LP balance:", error);
    } finally {
        poolsV2State.balanceLPLoading = false;
        renderPoolsV2();
    }
}