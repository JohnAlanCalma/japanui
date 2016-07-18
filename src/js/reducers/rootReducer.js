import { Map, fromJS } from 'immutable';

export default function reducer(state = Map(), action = {}) {
  const payload = action.payload ? fromJS(action.payload) : Map();
  switch (action.type) {
    case 'PENDING_SYMBOLS':
      return state.setIn(['status', 'symbols'], 'pending').deleteIn(['errors', 'symbols']);

    case 'FAILURE_SYMBOLS':
      return state.setIn(['status', 'symbols'], 'error')
        .setIn(['errors', 'symbols'], payload);

    case 'SUCCESS_SYMBOLS':
      return state.setIn(['status', 'symbols'], 'ready')
        .set('symbols', payload)
        .deleteIn(['errors', 'symbols']);

    case 'SET_SYMBOL':
      return state.setIn(['values', 'symbol'], payload.get('symbol'))
        .updateIn(['storage', 'symbol'], (v) => payload.get('store') ? payload.get('symbol') : v);

    case 'PENDING_CONTRACTS':
      return state.setIn(['status', 'contracts'], 'pending').deleteIn(['errors', 'contracts']);

    case 'FAILURE_CONTRACTS':
      return state.setIn(['status', 'contracts'], 'error')
        .setIn(['errors', 'contracts'], payload);

    case 'SUCCESS_CONTRACTS':
      return state.setIn(['status', 'contracts'], 'ready')
        .set('contracts', payload)
        .deleteIn(['errors', 'contracts']);

    case 'SET_CATEGORY':
      return state.setIn(['values', 'category'], payload.get('category'))
        .updateIn(['storage', 'category'],
          (v) => payload.get('store') ? payload.get('category') : v);

    case 'SET_PERIOD':
      return state.setIn(['values', 'period'], payload.get('period'))
        .updateIn(['storage', 'period'], (v) => payload.get('store') ? payload.get('period') : v);


    case 'SET_PAYOUT':
      return state.setIn(['values', 'payout'], payload.get('payout'))
        .updateIn(['storage', 'payout'], (v) => payload.get('store') ? payload.get('payout') : v);


    case 'PENDING_PROPOSAL':
      return state.setIn(['status', 'proposals', action.shortCode], 'pending')
        .deleteIn(['streams', 'proposals', action.shortCode])
        .deleteIn(['errors', 'proposals', action.shortCode]);

    case 'FAILURE_PROPOSAL':
      return state.setIn(['status', 'proposals', action.shortCode], 'error')
        .deleteIn(['streams', 'proposals', action.shortCode])
        .setIn(['errors', 'proposals', action.shortCode], payload.set('time', action.time));

    case 'SUCCESS_PROPOSAL':
      return state.setIn(['status', 'proposals', action.shortCode], 'ready')
        .setIn(['streams', 'proposals', action.shortCode, 'channel'], action.stream)
        .setIn(['streams', 'proposals', action.shortCode, 'value'],
          payload.set('time', action.time))
        .deleteIn(['errors', 'proposals', action.shortCode]);

    case 'DELETE_STREAMS':
      return state.deleteIn(['status', 'proposals'])
        .deleteIn(['streams', 'proposals'])
        .deleteIn(['errors', 'proposals']);

    case 'PENDING_BUY':
      return state.setIn(['status', 'buy', action.shortCode], 'pending')
        .deleteIn(['errors', 'buy', action.shortCode]);

    case 'FAILURE_BUY':
      return state.setIn(['status', 'buy', action.shortCode], 'error')
        .setIn(['errors', 'buy', action.shortCode], payload);

    case 'SUCCESS_BUY':
      return state.setIn(['status', 'buy', action.shortCode], 'ready')
        .deleteIn(['errors', 'buy', action.shortCode]);

    case 'DELETE_BUY':
      return state.deleteIn(['status', 'buy', action.shortCode])
        .deleteIn(['errors', 'buy', action.shortCode]);

    case 'PENDING_USER':
      return state.setIn(['status', 'user'], 'pending')
        .deleteIn(['errors', 'user']);

    case 'FAILURE_USER':
      return state.setIn(['status', 'user'], 'error')
        .setIn(['errors', 'user'], payload);

    case 'SUCCESS_USER':
      return state.setIn(['status', 'user'], 'ready')
        .set('user', payload)
        .deleteIn(['errors', 'user']);

    case 'DELETE_USER':
      return state.deleteIn(['status', 'user'])
        .delete('user')
        .deleteIn(['errors', 'user']);

    default:
      return state;
  }
}
