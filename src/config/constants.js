// Version
export const appVersion = "0.0.1";


// DMC RPC for readonly provider; Used for quoting without wallet connection
export const DMC_RPC_URL = "https://dmc.mydefichain.com/mainnet";


// v2
export const V2_FACTORY_Address = "0x79Ea1b897deeF37e3e42cDB66ca35DaA799E93a3";
export const V2_ROUTER_Address  = "0x3E8C92491fc73390166BA00725B8F5BD734B8fba";



// v3
export const V3_FACTORY_Address = "0x9C444DD15Fb0Ac0bA8E9fbB9dA7b9015F43b4Dc1";
export const V3_ROUTER_Address  = "0x2A9c4EdE9994911359af815367187947eD1dDf02";
export const V3_QUOTER_Address  = "0xD21dacF881990A75F96D0C2d7DBe9Fb7ee03870c";
export const V3_POSITION_MANAGER_Address = "0x274567C3B27F3981C4Ae7C951ECDe1C2aE70e6d0";

export const V3_FEES = [
    500,
    3000,
    10000
];


// native token 
export const WNATIVE = {
    symbol: "WDFI",
    name: "Defichain DFI",
    address: "0x49febbF9626B2D39aBa11C01d83Ef59b3D56d2A4",
    decimals: 18
};

export const nativeAddress = WNATIVE.address; 

export const ZERO_ADDRESS =
    "0x0000000000000000000000000000000000000000";


// Default slippage 0.5%
export const DefaultSlippage=0.005;
// default deadline in minutes
export const DefaultDeadline=20;


// Display
export const displayDecimals = 8; // UI
export const priceDecimals = 8; // prices
export const percentDecimals = 2; // slippage, pool share