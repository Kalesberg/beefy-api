const Web3 = require('web3');
const BigNumber = require('bignumber.js');
const { getPrice } = require('./getPrice');
const ERC20 = require('../abis/ERC20.json');
const LPPair = require('../abis/LPPair.json');

const web3 = new Web3(process.env.BSC_RPC);

const lpTokenPrice = async lpToken => {
  const tokenPairContract = await new web3.eth.Contract(ERC20, lpToken.address);
  const token0Contract = await new web3.eth.Contract(ERC20, lpToken.lp0.address);
  const token1Contract = await new web3.eth.Contract(ERC20, lpToken.lp1.address);

  let [totalSupply, reserve0, reserve1, token0Price, token1Price] = await Promise.all([
    tokenPairContract.methods.totalSupply().call(),
    token0Contract.methods.balanceOf(lpToken.address).call(),
    token1Contract.methods.balanceOf(lpToken.address).call(),
    getPrice(lpToken.lp0.oracle, lpToken.lp0.oracleId),
    getPrice(lpToken.lp1.oracle, lpToken.lp1.oracleId),
  ]);

  reserve0 = new BigNumber(reserve0);
  reserve1 = new BigNumber(reserve1);

  const token0StakedInUsd = reserve0.div(lpToken.lp0.decimals).times(token0Price);
  const token1StakedInUsd = reserve1.div(lpToken.lp1.decimals).times(token1Price);

  const totalStakedInUsd = token0StakedInUsd.plus(token1StakedInUsd);
  const lpTokenPrice = totalStakedInUsd.dividedBy(totalSupply).times(lpToken.decimals);

  return Number(lpTokenPrice);
};

const lpTokenPrices = async lpTokens => {
  let prices = {};

  let promises = [];
  lpTokens.forEach(lpToken => promises.push(lpTokenStats(lpToken)));
  const values = await Promise.all(promises);

  for (item of values) {
    prices = { ...prices, ...item };
  }

  return prices;
};

const lpTokenStats = async lpToken => {
  const lpPrice = await lpTokenPrice(lpToken);
  return { [lpToken.name]: lpPrice };
};

const lpTokenRatio = async (lpTokenAddress, decimals0, decimals1) => {
  const tokenPairContract = await new web3.eth.Contract(LPPair, lpTokenAddress);

  let { _reserve0, _reserve1 } = await tokenPairContract.methods.getReserves().call();
  const reserve0 = new BigNumber(_reserve0);
  const reserve1 = new BigNumber(_reserve1);

  const ratio = reserve0.div(decimals0).div(reserve1.div(decimals1));

  return Number(ratio);
};

module.exports = { lpTokenPrice, lpTokenPrices, lpTokenRatio };
