// Common wallet and blockchain info
export const ERC20_ABI = [
    "function approve(address,uint256) returns(bool)",
    "function allowance(address,address) view returns(uint256)",
    "function balanceOf(address) view returns(uint256)",
    "function decimals() view returns(uint8)",
    "function symbol() view returns(string)",
    "function name() view returns(string)"
];


// v2 
export const V2_Factory_ABI = [
    "function getPair(address,address) view returns(address)"
];


export const V2_Pair_ABI = [
    "function token0() view returns (address)",
    "function token1() view returns (address)",
    "function getReserves() view returns (uint112,uint112,uint32)",
    "function totalSupply() view returns (uint256)",
    "function balanceOf(address) view returns (uint256)",
    "function approve(address,uint256) returns (bool)",
    "function allowance(address,address) view returns (uint256)"
];


export const V2_Router_ABI = [
    "function getAmountsOut(uint256 amountIn, address[] path) view returns (uint256[])",
    "function swapExactTokensForTokens(uint256 amountIn, uint256 amountOutMin, address[] path, address to, uint256 deadline)",
    "function swapExactETHForTokens(uint256 amountOutMin, address[] path, address to, uint256 deadline) payable",
    "function swapExactTokensForETH(uint256 amountIn, uint256 amountOutMin, address[] path, address to, uint256 deadline)",
    "function swapExactTokensForTokensSupportingFeeOnTransferTokens(uint256 amountIn, uint256 amountOutMin, address[] path, address to, uint256 deadline)",
    "function swapExactETHForTokensSupportingFeeOnTransferTokens(uint256 amountOutMin, address[] path, address to, uint256 deadline) payable",
    "function swapExactTokensForETHSupportingFeeOnTransferTokens(uint256 amountIn, uint256 amountOutMin, address[] path, address to, uint256 deadline)",
    "function removeLiquidity(address tokenA,address tokenB,uint liquidity,uint amountAMin,uint amountBMin,address to,uint deadline) returns (uint,uint)",
    "function removeLiquidityETH(address token,uint liquidity,uint amountTokenMin,uint amountETHMin,address to,uint deadline) returns (uint,uint)",
    "function addLiquidity(address tokenA, address tokenB, uint amountADesired, uint amountBDesired, uint amountAMin, uint amountBMin, address to, uint deadline) returns (uint,uint,uint)",
    "function addLiquidityETH(address token, uint amountTokenDesired, uint amountTokenMin, uint amountETHMin, address to, uint deadline) payable returns (uint,uint,uint)"
];



// v3 

export const V3_Factory_ABI = [
    "function getPool(address,address,uint24) view returns(address)"
];

export const V3_Router_ABI = [
    "function exactInputSingle((address tokenIn,address tokenOut,uint24 fee,address recipient,uint256 amountIn,uint256 amountOutMinimum,uint160 sqrtPriceLimitX96)) payable returns (uint256 amountOut)",
    "function unwrapWNative(uint256 amountMinimum,address recipient)",
    //"function multicall(bytes[] data) payable returns (bytes[] results)"
];

export const V3_Quoter_ABI = [
    "function quoteExactInputSingle((address tokenIn,address tokenOut,uint256 amountIn,uint24 fee,uint160 sqrtPriceLimitX96)) view returns (uint256,uint160,uint32,uint256)"
];