import React, { Suspense } from "react";
import classnames from "classnames";
import { LoginForm } from "../utility/Login";
import MembersList from "../views/members/MembersList";
import Bookings from "../views/bookings/BookingsM";
import { BusLists } from "../views/BusListsM";
import { PaymentsMST } from "../views/PaymentsMST";
import { LoadingStatus } from "../views/LoadingStatus";
import { DebugOptions } from "../utility/debugOptions";
import NewWindow from "react-new-window";
import { Loading } from "../utility/Icon";

import { useStoreState, useStoreActions, debug } from "easy-peasy"; // 👈 import the hook

import logo from "../../images/St.EdwardsLogoSimple.svg";

import Logit from "../../logit";
var packageJson = require("../../../package.json");
var logit = Logit("components/layouts/MainLayout");
let loadingStatus;
const version = packageJson.version;

const loadPage = (curPage, loading, loaded, root) => {
  logit("load page", curPage, loading, loaded);
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
    case "membersList":
      return <MembersList />;
    case "bookings":
      return <Bookings />;
    case "payments":
      return <PaymentsMST />;
    case "buslists":
      return <BusLists />;
    case "debugSettings":
      return <DebugOptions {...{ root }} />;
    // case "loading":
    //   return <LoadingStatus loadingStatus={loadingStatus} />;
    default:
      return <div>
        Welcome to St.Edwards Booking System - please pick a page.
      </div>;
  }
};

var myPages = [];
const Main = function Main(props) {
  //       👇  map the state from store
  const Report = useStoreState((s) => s.reports.component);
  const rprops = useStoreState((s) => s.reports.props);
  const display = useStoreState((s) => s.reports.display);
  const title = useStoreState((s) => s.reports.title);
  const storeLoaded = useStoreState((s) => s.loaded);
  const setDisplay = useStoreActions((a) => a.reports.setDisplay);
  const setPage = useStoreActions((a) => a.router.setPage);
  const router = useStoreState((s) => s.router);
  const printWindow = React.useRef(null);
  const [showDebug, setShowDebug] = React.useState(false);
  const root = useStoreState((state) => state.debugSettings.nodes);

  logit("report state", debug(useStoreState((s) => s.reports)));

  myPages = [];
  const bookingsAdmin = useStoreState((s) => s.user.isBookingsAdmin);
  const membersAdmin = useStoreState((s) => s.user.isMembersAdmin);

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
  logit("currentPage", router.page, router);

  const PrintButton = ({ wRef }) => (
    <button onClick={() => wRef.current.window.print()} className="screenOnly">
      Print
    </button>
  );
  return (
    <div>
      <div
        style={{
          position: "relative",
          overflow: "hidden",
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
      <div className="mainPage">
        <img
          className="logo"
          src={logo}
          width="40px"
          alt=""
          onClick={() => {
            setPage("debugSettings");
          }}
        /> // onClick={() => {setShowDebug(!showDebug)}}
        <span className="version">{`v${version}`}</span>
        <LoginForm />
        <div className="nav">
          <Link page="bookings" name="Bookings" show={bookingsAdmin} />
          <Link page="buslists" name="Buslist" show={bookingsAdmin} />
          <Link page="payments" name="Payments" show={bookingsAdmin} />
          <Link page="membersList" name="Members" show={membersAdmin} />
        </div>

        <div style={{ padding: 5 }} className="maincontent">
          {loadPage(router.page, false, storeLoaded, root)}
        </div>
      </div>

      {/* {display && (
        <ReportPortal {...{ closeReport, reportReady, title }}>
          <Report {...rprops} />
        </ReportPortal>
      )} */}
      {display && (
        <NewWindow
          ref={printWindow}
          title={title}
          copyStyles={true}
          center={"screen"}
          onUnload={() => setDisplay(false)}
          features={{
            width: Math.min(window.screen.width, 1200),
            height: Math.min(window.screen.height, 850),
          }}
        >
          <Suspense fallback={<Loading style={{ padding: "45%" }} />}>
            {/* <h1>Hi 👋</h1> */}
            <PrintButton wRef={printWindow} />
            <Report {...rprops} />
          </Suspense>
        </NewWindow>
      )}
      {showDebug && (
        <NewWindow
          ref={printWindow}
          title={title}
          copyStyles={true}
          center={"screen"}
          onUnload={() => setShowDebug(false)}
          features={{
            width: Math.min(window.screen.width, 1200),
            height: Math.min(window.screen.height, 850),
          }}
        >
          <DebugOptions />
        </NewWindow>
      )}
    </div>
  );
};

export default Main;
