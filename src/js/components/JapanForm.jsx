import React from 'react';
import { Map } from 'immutable';

import SymbolSelectContainer from './SymbolSelectContainer';
import CategorySelectContainer from './CategorySelectContainer';
import PeriodSelectContainer from './PeriodSelectContainer';
import PayoutSelectContainer from './PayoutSelectContainer';
import SpotContainer from './SpotContainer';
import ContractEndTimerContainer from './ContractEndTimerContainer';

const JapanForm = ({ state, actions }) => (<section className='japan-form gr-row'>
    <div className='gr-6 gr-12-m gr-12-p gr-no-gutter'>
        <div className='gr-row'>
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
    </div>
    <div className='gr-6 gr-12-m gr-12-p gr-no-gutter'>
        <div className='gr-row'>
          <PeriodSelectContainer
            state={state}
            className='period-select select'
            value={state.getIn(['values', 'period'])}
            onChange={(e) => actions.setPeriod({ period: e.target.value })}/>
          <PayoutSelectContainer
            state={state}
            className='payout-select select'
            value={String(state.getIn(['values', 'payout'], ''))}
            type='text'
            onClick={(e) => e.target.setSelectionRange(0, e.target.value.length)}
            onChange={(e) => actions.setPayout({ payout: e.target.value })}/>
        </div>
  </div>
  <div className='gr-12 gr-no-gutter'>
    <div className='gr-row space-between'>
        <div className='gr-grow'>
            <SpotContainer spot={state.getIn(['streams', 'ticks', 'value'], Map())} />
        </div>
        <div className='gr-adapt'>
            <ContractEndTimerContainer timeLeft={state.getIn(['values', 'timeLeft'])} />
        </div>
    </div>
  </div>
</section>);

JapanForm.displayName = 'JapanForm';
JapanForm.propTypes = {
  actions: React.PropTypes.object.isRequired,
  state: React.PropTypes.instanceOf(Map).isRequired,
};

export default JapanForm;
