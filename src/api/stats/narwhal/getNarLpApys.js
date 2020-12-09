const Web3 = require('web3');
const BigNumber = require('bignumber.js');

const IGoldFarm = require('../../../abis/IGoldFarm.json');
const { getPrice } = require('../../../utils/getPrice');
const pools = require('../../../data/narLpPools.json');
const { compound } = require('../../../utils/compound');
const { getTotalLpStakedInUsd } = require('../../../utils/getTotalStakedInUsd');

const web3 = new Web3(process.env.BSC_RPC_2 || process.env.BSC_RPC);

const getNarLpApys = async () => {
  let apys = {};
  const goldFarm = '0x77C10A04B7d3adEBE4F235D69b5c1f20Cbfd2E57';

  let promises = [];
  pools.forEach(pool => promises.push(getPoolApy(goldFarm, pool)));
  const values = await Promise.all(promises);

  for (item of values) {
    apys = { ...apys, ...item };
  }

  return apys;
};

const getPoolApy = async (goldFarm, pool) => {
  const [yearlyRewardsInUsd, totalStakedInUsd] = await Promise.all([
    getYearlyRewardsInUsd(goldFarm, pool),
    getTotalLpStakedInUsd(goldFarm, pool),
  ]);
  const simpleApy = yearlyRewardsInUsd.dividedBy(totalStakedInUsd);
  const apy = compound(simpleApy, process.env.BASE_HPY, 1, 0.955);
  return { [pool.name]: apy };
};

const getYearlyRewardsInUsd = async (goldFarm, pool) => {
  const blockNum = await web3.eth.getBlockNumber();
  const goldFarmContract = new web3.eth.Contract(IGoldFarm, goldFarm);

  const multiplier = new BigNumber(
    await goldFarmContract.methods.getMultiplier(blockNum, blockNum + 1).call()
  );
  const blockRewards = new BigNumber(await goldFarmContract.methods.nartPerBlock().call());

  let { allocPoint } = await goldFarmContract.methods.poolInfo(pool.poolId).call();
  allocPoint = new BigNumber(allocPoint);

  const totalAllocPoint = new BigNumber(await goldFarmContract.methods.totalAllocPoint().call());
  const poolBlockRewards = blockRewards
    .times(multiplier)
    .times(allocPoint)
    .dividedBy(totalAllocPoint);

  const secondsPerBlock = 3;
  const secondsPerYear = 31536000;
  const yearlyRewards = poolBlockRewards.dividedBy(secondsPerBlock).times(secondsPerYear);

  const narPrice = await getPrice('pancake', 'NAR');
  const yearlyRewardsInUsd = yearlyRewards.times(narPrice).dividedBy('1e18');

  return yearlyRewardsInUsd;
};

module.exports = getNarLpApys;
