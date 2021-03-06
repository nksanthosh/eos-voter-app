import * as types from '../types';
import * as AccountActions from '../accounts';
import * as Api from '../../api/ApiDelegate'

export function undelegatebw(delegator, receiver, netAmount, cpuAmount) {
  return (dispatch: () => void, getState) => {
    const {
      connection,
      api
    } = getState();

    dispatch({
      type: types.SYSTEM_UNDELEGATEBW_PENDING
    });

    return api.request(connection, Api.UNDELEGATEBW, {delegator, receiver, netAmount, cpuAmount}).then((tx) => {
      dispatch(AccountActions.getAccount(delegator));
      return dispatch({
        payload: { tx },
        type: types.SYSTEM_UNDELEGATEBW_SUCCESS
      });
    }).catch((err) => dispatch({
      payload: { err },
      type: types.SYSTEM_UNDELEGATEBW_FAILURE
    }));
  };
}

export function undelegatebwParams(delegator, receiver, netAmount, cpuAmount) {
  const unstakeNetAmount = netAmount || 0;
  const unstakeCpuAmount = cpuAmount || 0;

  return {
    from: delegator,
    receiver,
    unstake_net_quantity: `${unstakeNetAmount.toFixed(4)} EOS`,
    unstake_cpu_quantity: `${unstakeCpuAmount.toFixed(4)} EOS`,
    transfer: 0
  };
}

export default {
  undelegatebw,
  undelegatebwParams
};
