import React from 'react';
import classnames from 'classnames';
import { observer, inject } from 'mobx-react';
import { SigninForm } from '../../ducks/signin-mobx.js';
// import { setRouterPage } from '../../ducks/router-mobx.js';
import MembersList from '../views/members/MembersList.js';
import Bookings from '../views/bookings/BookingsM.js';
import { BusLists } from '../views/BusListsM.js';
import { PaymentsMST } from '../views/PaymentsMST';
import { LoadingStatus } from '../views/LoadingStatus';
import { ReportPortal } from '../../ducks/reportPortal';

import Logit from 'logit';
var packageJson = require('../../../package.json');
let loadingStatus;
let loading, loaded;

const version = packageJson.version;
var logit = Logit('components/layouts/MainLayout');

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
    default:
      return <div>Welcome to St.Edwards Booking System - please login.</div>;
  }
};

var myPages = [];
const comp = observer(
  class EditMemberData extends React.Component {
    componentDidMount() {
      // this.props.store.loadCascade();
    }
    render() {
      const { store } = this.props;
      myPages = [];
      const bookingsAdmin = store.signin.isBookingsAdmin;
      const membersAdmin = store.signin.isMembersAdmin;
      const router = store.router;
      const Report = store.ReportComponent;
      const rprops = store.reportProps;

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
          <div className="mainPage">
            <img
              className="logo"
              src={'../assets/St.Edwards.col4.png'}
              width="40px"
              alt=""
            />
            <span className="version">v {version}</span>
            <SigninForm />
            <div className="nav">
              <Link page="bookings" name="Bookings" show={bookingsAdmin} />
              <Link page="buslists" name="Buslist" show={bookingsAdmin} />
              <Link page="payments" name="Payments" show={bookingsAdmin} />
              <Link page="membersList" name="Members" show={membersAdmin} />
            </div>

            <div style={{ padding: 5 }} className="maincontent">
              {loadPage(router.page, loading, loaded)}
            </div>
          </div>
          )}
          {store.showReportPortal && (
            <ReportPortal onclose={store.toggleReportPortal} title={store.reportTitle}>
              <Report {...rprops} />
            </ReportPortal>
          )}
        </div>
      );
    }
  }
);

export default inject('store')(observer(comp));
