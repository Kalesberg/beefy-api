const getCakeApys = require('./pancake/getCakeApys');
const getCakePoolApy = require('./pancake/getCakePoolApy');
const { getCakeLpApys } = require('./pancake/getCakeLpApys');
const getFortubeApys = require('./fortube/getFortubeApys');
const getBifiMaxiApy = require('./beefy/getBifiMaxiApy');
const getBakePoolApy = require('./bakery/getBakePoolApy');
const getBakeryLpApys = require('./bakery/getBakeryLpApys');
const getVenusApys = require('./venus/getVenusApys');
const getJetfuelLpApys = require('./jetfuel/getJetfuelLpApys');
const getBdoLpApys = require('./bdollar/getBdoLpApys');
const getSbdoLpApys = require('./bdollar/getSbdoLpApys');
const getHelmetPoolApy = require('./helmet/getHelmetPoolApy');
const getHelmetLpApy = require('./helmet/getHelmetLpApy');
const getBhcPoolApy = require('./bhc/getBhcPoolApy');
const getKebabLpApys = require('./kebab/getKebabLpApys');
const getKebabPoolApy = require('./kebab/getKebabPoolApy');
const getMonsterLpApys = require('./monster/getMonsterLpApys');
const getJulDPoolApy = require('./julb/getJuldPoolApy');
const getNyacashNyasLpApys = require('./nyanswop/getNyacashNyasLpApys');
const getSpongeLpApys = require('./sponge/getSpongeLpApys');
const getSpongePoolApy = require('./sponge/getSpongePoolApy');
const getAutoApys = require('./auto/getAutoApys');
const getMdexLpApys = require('./mdex/getMdexLpApys');
const getBtdLpApys = require('./bolt/getBtdLpApys');
const getBtsLpApys = require('./bolt/getBtsLpApys');

// FIXME: restoring partial service
// const getThugsLpApys = require('./thugs/getThugsLpApys');
// const getDrugsApys = require('./thugs/getDrugsApys');
// const getNarLpApys = require('./narwhal/getNarLpApys');

const INTERVAL = 5 * 60 * 1000;

let apys = {};

const getApys = () => {
  return apys;
};

const updateApys = async () => {
  const values = await Promise.all([
    getBifiMaxiApy(),
    getCakeApys(),
    getCakePoolApy(),
    getCakeLpApys(),
    getFortubeApys(),
    getThugsLpApys(),
    getDrugsApys(),
    getBakePoolApy(),
    getBakeryLpApys(),
    getVenusApys(),
    getJetfuelLpApys(),
    getBdoLpApys(),
    getSbdoLpApys(),
    getHelmetPoolApy(),
    getHelmetLpApy(),
    getBhcPoolApy(),
    getKebabLpApys(),
    getKebabPoolApy(),
    getMonsterLpApys(),
    getJulDPoolApy(),
    getNyacashNyasLpApys(),
    getSpongeLpApys(),
    getSpongePoolApy(),
    getBtdLpApys(),
    getBtsLpApys(),
    getAutoApys(),
    getMdexLpApys()
  ]);

  for (item of values) {
    apys = { ...apys, ...item };
  }

  setTimeout(updateApys, INTERVAL);
};

updateApys();

module.exports = getApys;
