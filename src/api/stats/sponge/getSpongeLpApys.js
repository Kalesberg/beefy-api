const { web3 } = require('../../../utils/web3');
const BigNumber = require('bignumber.js');

const MasterChef = require('../../../abis/MasterChef.json');
const { getPrice } = require('../../../utils/getPrice');
const pools = require('../../../data/spongeLpPools.json');
const { compound } = require('../../../utils/compound');
const { getTotalLpStakedInUsd } = require('../../../utils/getTotalStakedInUsd');

const getSpongeLpApys = async () => {
  let apys = {};
  const masterchef = '0x303961805A22d76Bac6B2dE0c33FEB746d82544B';

  let promises = [];
  pools.forEach(pool => promises.push(getPoolApy(masterchef, pool)));
  const values = await Promise.all(promises);

  for (item of values) {
    apys = { ...apys, ...item };
  }

  return apys;
};

const getPoolApy = async (masterchef, pool) => {
  const [yearlyRewardsInUsd, totalStakedInUsd] = await Promise.all([
    getYearlyRewardsInUsd(masterchef, pool),
    getTotalLpStakedInUsd(masterchef, pool),
  ]);
  const simpleApy = yearlyRewardsInUsd.dividedBy(totalStakedInUsd);
  const apy = compound(simpleApy, process.env.BASE_HPY, 1, 0.955);
  return { [pool.name]: apy };
};

const getYearlyRewardsInUsd = async (masterchef, pool) => {
  const blockNum = await web3.eth.getBlockNumber();
  const masterchefContract = new web3.eth.Contract(MasterChef, masterchef);

  const multiplier = new BigNumber(
    await masterchefContract.methods.getMultiplier(blockNum - 1, blockNum).call(),
  );
  const blockRewards = new BigNumber(await masterchefContract.methods.cakePerBlock().call());

  let { allocPoint } = await masterchefContract.methods.poolInfo(pool.poolId).call();
  allocPoint = new BigNumber(allocPoint);

  const totalAllocPoint = new BigNumber(await masterchefContract.methods.totalAllocPoint().call());
  const poolBlockRewards = blockRewards
    .times(multiplier)
    .times(allocPoint)
    .dividedBy(totalAllocPoint);

  const secondsPerBlock = 3;
  const secondsPerYear = 31536000;
  const yearlyRewards = poolBlockRewards.dividedBy(secondsPerBlock).times(secondsPerYear);

  const soakPrice = await getPrice('pancake', 'SOAK');
  const yearlyRewardsInUsd = yearlyRewards.times(soakPrice).dividedBy('1e18');

  return yearlyRewardsInUsd;
};

module.exports = getSpongeLpApys;
