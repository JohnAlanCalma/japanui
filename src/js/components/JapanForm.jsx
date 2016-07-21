import React from 'react';
import { Map } from 'immutable';

import SymbolSelectContainer from './SymbolSelectContainer';
import CategorySelectContainer from './CategorySelectContainer';
import PeriodSelectContainer from './PeriodSelectContainer';
import PayoutSelectContainer from './PayoutSelectContainer';
import SpotContainer from './SpotContainer';

const JapanForm = ({ state, actions }) => (<section className='japan-form flex-box rows'>
  <div className='flex-box cols row'>
    <div className='col'>
      <SymbolSelectContainer
        state={state}
        className='symbol-select select'
        value={state.getIn(['values', 'symbol'])}
        onChange={(e) => actions.setSymbol({ symbol: e.target.value })}
        id='underlying' />
      <CategorySelectContainer
        state={state}
        className='category-select select'
        value={state.getIn(['values', 'category'])}
        onChange={(e) => actions.setCategory({ category: e.target.value })}
        id='category-select'/>
    </div>
    <div className='col'>
      <PeriodSelectContainer
        state={state}
        className='period-select select'
        value={state.getIn(['values', 'period'])}
        onChange={(e) => actions.setPeriod({ period: e.target.value })}/>
      <PayoutSelectContainer
        state={state}
        className='payout-select select'
        value={String(state.getIn(['values', 'payout']))}
        onChange={(e) => actions.setPayout({ payout: e.target.value })}/>
    </div>
  </div>
  <div className='row'><SpotContainer
    spot={state.getIn(['streams', 'ticks', 'value'], Map())} />
  </div>
</section>);

JapanForm.displayName = 'JapanForm';
JapanForm.propTypes = {
  actions: React.PropTypes.object.isRequired,
  state: React.PropTypes.instanceOf(Map).isRequired,
};

export default JapanForm;
