import React from 'react';
import classNames from 'classnames';
import { Map } from 'immutable';

import JapanTableRow from './JapanTableRow';

const JapanTableRowContainer = ({ price, isHeading }) => {
  const buyClasses = {};
  const sellClasses = {};

  let buy;
  let sell;

  if (!isHeading) {
    buyClasses.inactive = !price.getIn(['ask', 'isActive']);
    buyClasses.up = price.getIn(['ask', 'dynamics']) > 0;
    buyClasses.down = price.getIn(['ask', 'dynamics']) < 0;

    sellClasses.inactive = !price.getIn(['bid', 'isActive']);
    sellClasses.up = price.getIn(['bid', 'dynamics']) > 0;
    sellClasses.down = price.getIn(['bid', 'dynamics']) < 0;

    buy = <button onClick={price.get('cb')}>{price.getIn(['ask', 'val'])}</button>;
    sell = String(price.getIn(['bid', 'val']));
  } else {
    buy = price.get('buy');
    sell = price.get('sell');
  }

  return (<JapanTableRow
    barrier={price.get('barrier')}
    buy={buy}
    buyClasses={classNames(buyClasses)}
    sell={sell}
    sellClasses={classNames(sellClasses)}
    isHeading={isHeading} />);
};

JapanTableRowContainer.displayName = 'JapanTableRowContainer';
JapanTableRowContainer.propTypes = {
  price: React.PropTypes.instanceOf(Map).isRequired,
  isHeading: React.PropTypes.bool,
};

export default JapanTableRowContainer;
