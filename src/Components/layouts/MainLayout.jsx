import React, { useState } from 'react';
import classnames from 'classnames';
import { LoginForm } from '../utility/Login';
import MembersList from '../views/members/MembersList';
import Bookings from '../views/bookings/BookingsM';
import { BusLists } from '../views/BusListsM';
import { PaymentsMST } from '../views/PaymentsMST';
import { LoadingStatus } from '../views/LoadingStatus';
import { ReportPortal } from '../utility/reportPortal';
import { Modal } from './modal';

import { useStoreState, useStoreActions, debug } from 'easy-peasy'; // 👈 import the hook

import logo from '../../images/St.Edwards.col4.png';

import Logit from 'logit';
var packageJson = require('../../../package.json');
var logit = Logit('components/layouts/MainLayout');
let loadingStatus;
// //┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// //┃   UIState                                                ┃
// //┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
// const uiStateModel = types
//   .model({
//     showLoading: types.optional(types.boolean, false),
//   })
//   .actions((self) => ({
//     toggleShowLoading: () => (self.showLoading = !self.showLoading),
//   }));
// const uiState = uiStateModel.create({});

const version = packageJson.version;

const loadPage = (curPage, loading, loaded) => {
  logit('load page', curPage, loading, loaded);
  if (loading) {
    return (
      <span>
        <LoadingStatus loadingStatus={loadingStatus} />
      </span>
    );
  }
  if (!loaded) {
    return <div>Welcome to St.Edwards Booking System - please login.</div>;
  }

  switch (curPage) {
    case 'membersList':
      return <MembersList />;
    case 'bookings':
      return <Bookings />;
    case 'payments':
      return <PaymentsMST />;
    case 'buslists':
      return <BusLists />;
    // case "loading":
    //   return <LoadingStatus loadingStatus={loadingStatus} />;
    default:
      return <div>Welcome to St.Edwards Booking System - please pick a page.</div>;
  }
};

var myPages = [];
const Main = function Main(props) {
  //       👇  map the state from store
  const Report = useStoreState((s) => s.reports.component);
  const rprops = useStoreState((s) => s.reports.props);
  const display = useStoreState((s) => s.reports.display);
  const title = useStoreState((s) => s.reports.title);
  const reportReady = useStoreState((s) => s.reports.reportReady);
  const storeLoaded = useStoreState((s) => s.loaded);
  const setDisplay = useStoreActions((a) => a.reports.setDisplay);
  const setPage = useStoreActions((a) => a.router.setPage);
  const router = useStoreState((s) => s.router);

  logit('report state', debug(useStoreState((s) => s.reports)));

  // const [isModalOpen, setModalOpen] = useState(false);

  // const toggleModal = () => {
  //   setModalOpen(!isModalOpen);
  //   logit('isModalOpen', isModalOpen);
  // };

  myPages = [];
  const bookingsAdmin = useStoreState((s) => s.user.isBookingsAdmin);
  const membersAdmin = useStoreState((s) => s.user.isMembersAdmin);

  // let showLoading = true;

  // const [showLoading, setShowLoading] = useState(false);

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
  logit('currentPage', router.page, router);
  const closeReport = () => setDisplay(false);

  return (
    <div>
      <div
        style={{
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* <button onClick={toggleModal}>open modal</button>

        <Modal isOpen={isModalOpen} style={{ background: 'yellow', height: '30%' }}>
          <div>close modal</div>
          <footer>
            <button onClick={toggleModal}>close modal</button>
          </footer>
        </Modal> */}
      </div>
      <div className='mainPage'>
        <img className='logo' src={logo} width='40px' alt='' />
        <span className='version'>{`v${version}`}</span>
        <LoginForm />
        <div className='nav'>
          <Link page='bookings' name='Bookings' show={bookingsAdmin} />
          <Link page='buslists' name='Buslist' show={bookingsAdmin} />
          <Link page='payments' name='Payments' show={bookingsAdmin} />
          <Link page='membersList' name='Members' show={membersAdmin} />
        </div>

        <div style={{ padding: 5 }} className='maincontent'>
          {loadPage(router.page, false, storeLoaded)}
        </div>
      </div>

      {display && (
        <ReportPortal {...{ closeReport, reportReady, title }}>
          <Report {...rprops} />
        </ReportPortal>
      )}
    </div>
  );
};

export default Main;
