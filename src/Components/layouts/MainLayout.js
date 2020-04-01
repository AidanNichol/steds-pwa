import React from 'react';
import classnames from 'classnames';
import { observer, inject } from 'mobx-react';
import { SigninForm } from '../../ducks/signin-mobx.js';
// import { setRouterPage } from '../../ducks/router-mobx.js';
import MembersList from '../views/members/MembersList.js';
import Bookings from '../views/bookings/BookingsM.js';
import { BusLists } from '../views/BusListsM.js';
import { Audit } from '../views/Audit.js';
import { PaymentsMST } from '../views/PaymentsMST';
import { LoadingStatus } from '../views/LoadingStatus';
import { ReportPortal } from '../../ducks/reportPortal';
import { types } from 'mobx-state-tree';

import Logit from 'logit';
var packageJson = require('../../../package.json');
var logit = Logit('components/layouts/MainLayout');
let loadingStatus;
let loading, loaded;
//┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
//┃   UIState                                                ┃
//┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
const uiStateModel = types
  .model({
    showLoading: types.optional(types.boolean, false),
  })
  .actions(self => ({
    toggleShowLoading: () => (self.showLoading = !self.showLoading),
  }));
const uiState = uiStateModel.create({});

const version = packageJson.version;

const loadPage = (curPage, loading, loaded) => {
  logit('load page', curPage, loading, loaded);

  if (loading)
    return (
      <span>
        <LoadingStatus loadingStatus={loadingStatus} />
      </span>
    );
  if (!loaded) return <div>Welcome to St.Edwards Booking System - please login.</div>;

  switch (curPage) {
    case 'membersList':
      return <MembersList />;
    case 'bookings':
      return <Bookings />;
    case 'payments':
      return <PaymentsMST />;
    case 'buslists':
      return <BusLists />;
    case 'loading':
      return <LoadingStatus loadingStatus={loadingStatus} />;
    case 'audit':
      return <Audit />;

    default:
      return <div>Welcome to St.Edwards Booking System - please login.</div>;
  }
};

var myPages = [];
// const comp = observer(
//   class MainLayout extends React.Component {
//     componentDidMount() {
//       // this.props.store.loadCascade();
//     }
//     render() {
const comp = props => {
  const { store } = props;
  myPages = [];
  const bookingsAdmin = store.signin.isBookingsAdmin;
  const membersAdmin = store.signin.isMembersAdmin;
  const router = store.router;
  const Report = store.ReportComponent;
  const rprops = store.reportProps;
  // let showLoading = true;

  // const [showLoading, setShowLoading] = useState(false);

  const setPage = page => store.router.setPage({ page });
  const Link = ({ page, show, name }) => {
    if (!show) return null;
    myPages.push(page);
    var cl = classnames({ link: true, selected: router.page === page });
    return (
      <span onClick={() => setPage(page)} className={cl}>
        {name}
      </span>
    );
  };
  loading = store.loading;
  loaded = store.loaded;
  loadingStatus = store.loadingStatus;
  logit('currentPage', router.page, loading, LoadingStatus);

  return (
    <div>
      <div className='mainPage'>
        <img
          className='logo'
          src={'../assets/St.Edwards.col4.png'}
          width='40px'
          alt=''
          onClick={uiState.toggleShowLoading}
        />
        <span className='version' onClick={uiState.toggleShowLoading}>
          v {version}
        </span>
        <SigninForm />
        <div className='nav'>
          <Link page='bookings' name='Bookings' show={bookingsAdmin} />
          <Link page='buslists' name='Buslist' show={bookingsAdmin} />
          <Link page='payments' name='Payments' show={bookingsAdmin} />
          <Link page='membersList' name='Members' show={membersAdmin} />
          <Link page='loading' name='Loading' show={uiState.showLoading} />
          <Link page='audit' name='Audit' show={true} />
        </div>

        <div style={{ padding: 5 }} className='maincontent'>
          {loadPage(router.page, loading, loaded)}
        </div>
      </div>

      {store.showReportPortal && (
        <ReportPortal onclose={store.toggleReportPortal} title={store.reportTitle}>
          <Report {...rprops} />
        </ReportPortal>
      )}
    </div>
  );
};

export default inject('store')(observer(comp));
