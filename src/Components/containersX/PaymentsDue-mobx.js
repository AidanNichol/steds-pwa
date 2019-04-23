import { inject, observer } from 'mobx-react';
import Payments from '../views/PaymentsDue';
// import { showStats} from './PaymentsFunctions'
import { setRouterPage } from '../../ducks/router-mobx.js';
import Logit from 'logit';
var logit = Logit('components/containers/PaymentsDue');

const mapStateToProps = function(store) {
  var debts = store.AS.allDebts.debts;
  // showStats();
  logit('debts', debts);
  var nprops = {
    debts,
    showMemberBookings: accId =>
      setRouterPage({ page: 'bookings', memberId: accId, accountId: accId })
  };
  return nprops;
};
export default inject(mapStateToProps)(observer(Payments));
