import React from 'react';
import { List, Map } from 'immutable';

import JapanPricesBlockContainer from './JapanPricesBlockContainer';

const JapanTable = ({
  table,
  values,
  actions,
}) => (<div className='japan-table flex-box cols'>
  {table.map((item, key) => (<JapanPricesBlockContainer
    key={key}
    table={item}
    values={values}
    actions={actions} />))}
</div>);

JapanTable.displayName = 'JapanTable';
JapanTable.propTypes = {
  table: React.PropTypes.instanceOf(List).isRequired,
  values: React.PropTypes.instanceOf(Map).isRequired,
  actions: React.PropTypes.object.isRequired,
};

export default JapanTable;
