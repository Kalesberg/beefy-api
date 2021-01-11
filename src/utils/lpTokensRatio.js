const Web3 = require('web3');
const BigNumber = require('bignumber.js');
const LPPair = require('../abis/LPPair.json');

const web3 = new Web3(process.env.BSC_RPC);

const lpTokenRatio = async (lpTokenAddress, decimals0, decimals1) => {
  const tokenPairContract = await new web3.eth.Contract(LPPair, lpTokenAddress);

  let { _reserve0, _reserve1 } = await tokenPairContract.methods.getReserves().call();
  const reserve0 = new BigNumber(_reserve0);
  const reserve1 = new BigNumber(_reserve1);

  const ratio = reserve0.div(decimals0).div(reserve1.div(decimals1));

  return Number(ratio);
};

module.exports = { lpTokenRatio };
