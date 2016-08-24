import SymbolsHelper from '../helpers/SymbolsHelper';
import ContractsHelper from '../helpers/ContractsHelper';

import showBuyWindow from '../patches/showBuyWindow';
import TradingAnalysis from '../patches/TradingAnalysis';
import * as Actions from './Actions';

import { Map, List } from 'immutable';

const timers = {};

function authorize() {
  return (dispatch, getState) => {
    if (typeof window.CommonData !== 'object') {
      return Promise.resolve();
    }

    const apiToken = window.CommonData.getLoginToken();

    if (getState().has('user') || !apiToken || !localStorage.getItem('client.tokens')) {
      return Promise.resolve();
    }

    return dispatch(Actions.authorize({ apiToken }));
  };
}

function getTimeOffset() {
  return (dispatch) => {
    return dispatch(Actions.getTimeOffset());
  };
}

function setExpiryCounter() {
  return (dispatch, getState) => {
    const offset = getState().get('timeOffset');

    if (typeof offset !== 'undefined') {
      const expiry = getState().getIn(['values', 'period']).split('_')[1];
      const timeLeft = expiry - (parseInt((new Date()) / 1000, 10) + offset);

      return dispatch(Actions.setExpiryCounter({ timeLeft }))
        .then(() => (timers.leftTime = setTimeout(() => dispatch(setExpiryCounter()), 1000)));
    }

    return Promise.resolve();
  };
}

function getTicks() {
  return (dispatch, getState) => {
    const symbol = getState().getIn(['values', 'symbol']);
    if (!symbol) {
      return Promise.resolve();
    }

    const prevTickChannel = getState().getIn(['streams', 'ticks', 'channel']);
    if (prevTickChannel) {
      prevTickChannel.close();
    }

    return dispatch(Actions.getTicks({ symbol }));
  };
}

export function getSymbols() {
  clearTimeout(timers.contractsTimer);
  return (dispatch) => dispatch(getTimeOffset())
    .then(() => dispatch(Actions.getSymbols()))
    .then(() => dispatch(setSymbols()))
    .then(() => dispatch(setSymbol()));
}

function setSymbols() {
  return (dispatch, getState) => {
    const symbols = getState().get('symbols', List());
    const symbolsList = SymbolsHelper.getSymbols(symbols, 'major_pairs')
      .toList()
      .map((symbol) => List.of(symbol.get('symbol'), symbol.get('display_name')));
    return dispatch(Actions.setSymbols({ symbols: symbolsList }));
  };
}

export function setSymbol(payload) {
  return (dispatch, getState) => {
    const symbols = getState().get('symbols');

    let symbol = payload && payload.symbol;
    const needToStore = Boolean(symbol);

    if (!symbol) {
      symbol = getState().getIn(['storage', 'symbol']);
    }

    if (!symbol) {
      const openedSymbols = SymbolsHelper.getSymbols(symbols, 'major_pairs', { state: true });
      symbol = openedSymbols.first() ? openedSymbols.first().get('symbol') : '';
    }

    if (!symbol) {
      return Promise.reject();
    }

    return dispatch(deleteProposalsStreams())
      .then(() => dispatch(Actions.setSymbol({ needToStore, symbol })))
      .then(() => dispatch(getContracts()))
      .then(dispatch(getTicks()));
  };
}

function getContracts() {
  clearTimeout(timers.contractsTimer);
  return (dispatch, getState) => {
    const symbol = getState().getIn(['values', 'symbol']);
    return dispatch(Actions.getContracts({ symbol }))
      .then(() => {
        timers.contractsTimer = setTimeout(() => dispatch(updateContracts()), 15 * 1000);
      })
      .then(() => dispatch(setCategories()))
      .then(() => dispatch(setCategory()));
  };
}

function updateContracts() {
  clearTimeout(timers.contractsTimer);
  return (dispatch, getState) => {
    const symbol = getState().getIn(['values', 'symbol']);
    return dispatch(Actions.getContracts({ symbol }))
      .then(() => {
        timers.contractsTimer = setTimeout(() => dispatch(updateContracts()), 15 * 1000);
      })
      .then(() => dispatch(setCategories()))
      .then(() => dispatch(setPeriods()));
  };
}

function setCategories() {
  return (dispatch, getState) => {
    const contracts = getState().getIn(['contracts', 'available']);
    const categories = ContractsHelper.getCategories(contracts);

    return dispatch(Actions.setCategories({ categories }));
  };
}

function setPeriods() {
  return (dispatch, getState) => {
    const contracts = getState().getIn(['contracts', 'available']);
    const category = getState().getIn(['values', 'category']);
    const periods = ContractsHelper.getTradingPeriods(contracts, category);

    return dispatch(Actions.setPeriods({ periods }));
  };
}

function setBarriers() {
  return (dispatch, getState) => {
    const category = getState().getIn(['values', 'category']);
    const period = getState().getIn(['values', 'period']);
    const contracts = getState().getIn(['contracts', 'available']);
    const [startDate, endDate] = period.split('_');
    const barriers = ContractsHelper.getJapanBarriers(contracts, category, startDate, endDate);

    return dispatch(Actions.setBarriers({ barriers }));
  };
}

function setContractTypes() {
  return (dispatch, getState) => {
    const category = getState().getIn(['values', 'category']);
    const contracts = getState().getIn(['contracts', 'available']);
    const contractTypes = ContractsHelper.getContractTypes(contracts, category);

    return dispatch(Actions.setContractTypes({ contractTypes }));
  };
}

export function setCategory(payload) {
  return (dispatch, getState) => {
    let category = payload && payload.category;
    const needToStore = Boolean(category);

    if (!category) {
      category = getState().getIn(['storage', 'category']);
    }

    if (!category) {
      const categories = getState().getIn(['values', 'categories']);
      category = categories.first();
    }

    TradingAnalysis().request();

    return dispatch(deleteProposalsStreams())
      .then(() => dispatch(Actions.setCategory({ needToStore, category })))
      .then(() => dispatch(setContractTypes()))
      .then(() => dispatch(setPeriods()))
      .then(() => dispatch(setPeriod()));
  };
}

export function setPeriod(payload) {
  clearTimeout(timers.leftTime);
  return (dispatch, getState) => {
    let period = payload && payload.period;
    const needToStore = Boolean(period);

    if (!period) {
      const periods = getState().getIn(['values', 'periods']);
      period = getState().getIn(['storage', 'period']);

      if (!periods.filter((v) => `${v.get('start')}_${v.get('end')}` === period).size) {
        period = `${periods.first().get('start')}_${periods.first().get('end')}`;
      }
    }

    return dispatch(deleteProposalsStreams())
      .then(() => dispatch(Actions.setPeriod({ period, needToStore })))
      .then(() => dispatch(setBarriers()))
      .then(() => dispatch(setExpiryCounter()))
      .then(() => dispatch(setPayout()));
  };
}

export function setPayout(payload) {
  return (dispatch, getState) => {
    let payout = payload && payload.payout;
    const needToStore = Boolean(payout);

    if (!payout) {
      payout = getState().getIn(['storage', 'payout']);
    }

    if (!payout) {
      payout = 1000;
    }

    return dispatch(deleteProposalsStreams())
      .then(() => dispatch(Actions.setPayout({ payout, needToStore })))
      .then(() => dispatch(getPrices()));
  };
}

export function getPrices() {
  return (dispatch, getState) => {
    const symbol = getState().getIn(['values', 'symbol']);
    const [, endDate] = getState().getIn(['values', 'period'], '').split('_');
    const payout = getState().getIn(['values', 'payout']);
    const barriers = getState().getIn(['values', 'barriers']);
    const contractTypes = getState().getIn(['values', 'contractTypes']);


    contractTypes.forEach((contractType) => barriers.forEach((barrier) => (
      dispatch(Actions.getPrice({ contractType, symbol, endDate, payout, barrier }))
      .catch((err) => console.log(`${err.message}`))
    )));

    return Promise.resolve();
  };
}

export function buy({ type, price, barriers }) {
  return (dispatch, getState) => {
    const payout = getState().getIn(['values', 'payout']);
    const symbol = getState().getIn(['values', 'symbol']);
    const expiry = getState().getIn(['values', 'period']).split('_')[1];

    dispatch(authorize())
      .then(() => dispatch(Actions.buy(type, price, barriers, payout, symbol, expiry)))
      .then((payload) => {
        showBuyWindow(payload.contract_id);
      }).catch((err) => {
        alert(err.message);
      });
  };
}

export function close() {
  for (const id of Object.keys(timers)) {
    clearInterval(timers[id]);
    clearTimeout(timers[id]);
  }

  return Actions.close();
}

function deleteProposalsStreams() {
  return (dispatch, getState) => {
    const streams = getState().getIn(['streams', 'proposals'], Map())
      .concat(getState().getIn(['errors', 'proposals'], Map()));

    streams.forEach((stream) => {
      const channel = stream.get('channel');
      if (channel) {
        channel.close();
      }
    });

    if (!streams.isEmpty()) {
      return dispatch(Actions.deleteProposalsStreams());
    }

    return Promise.resolve();
  };
}
