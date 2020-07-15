import React from 'react';
import { ReactComponent as Logo } from '../images/St.EdwardsLogoSimple.svg';
import { useStoreState, useStoreActions } from 'easy-peasy';
import _ from 'lodash';
import { paidUp, getSubsStatus } from '../store/model/members';
import { pcexp } from '../Components/utility/normalizersH';

import { useFetchData } from '../store/use-data-api';
import useFitText from 'use-fit-text';

import { format } from 'date-fns';
import Logit from '../logit';
var logit = Logit('reports/membershipListRpt');
// Create styles
const timestamp = format(new Date(), 'yyyy-MM-dd HH:mm');
const borderTop = {
  borderTopColor: '#808080',
  borderTopStyle: 'solid',
  borderTopWidth: 1,
  marginTop: 5,
  paddingTop: 5,
  marginRight: 3,
};

function showSubs(mem) {
  const statusMap = { Member: '', HLM: 'hlm', Guest: 'gst', '?': '' };
  const subsMap = {
    OK: { color: 'green' },
    due: { color: 'orange', fontWeight: 'bold' },
    late: { color: 'red', fontWeight: 'bold' },
  };
  let stat = statusMap[mem.memberStatus || '?'];
  if (mem.memberId === 'M2031') logit('mem', mem, stat);
  if (stat !== '') return [stat, {}];

  let subs = getSubsStatus(mem);
  // let subs = mem.subsStatus;
  stat = `${mem.subscription ? "'" + (parseInt(mem.subscription) % 100) : '---'}`;
  let atts = subsMap[subs?.status];
  if (mem.memberId === 'M2031') logit('subs', subs, stat, atts);
  return [stat, atts];
}

const Document = (props) => {
  const style = {
    width: '297mm',
    height: '210mm',
    boxSizing: 'border-box',
  };
  return <div style={style}>{props.children}</div>;
};
const Page = (props) => {
  const style = {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    justifyContent: 'flex-start',
    fontSize: 14,
    breakBefore: props.page === 1 ? 'never' : 'page',
  };
  return <div style={{ ...style, ...props.style }}>{props.children}</div>;
};

const ReportBody = (props) => {
  const style = {
    fontSize: 10,
    flexDirection: 'column',
    marginLeft: 10,
    marginRight: 0,
    paddingRight: 10,
  };
  return <div style={{ ...style, ...props.style }}>{props.children}</div>;
};
const Banner = ({ page, of, className }) => {
  const style = {
    justifyContent: 'space-between',
    fontSize: 10,
    display: 'grid',
    gridTemplateColumns: '95px 1fr 95px',
  };
  return (
    <div className={className} style={style}>
      <Logo style={{ padding: 3, height: 30, width: 30 }} />
      {/* <Logos style={{ padding: 3, height: 30, width: 30 }}>
        <use xlinkHref="#St_EdwardsLogoSimple" />
      </Logos> */}
      <div style={{ fontWeight: 'bold', justifySelf: 'center', fontSize: 20 }}>
        St.Edwards Fellwalkers: Membership List
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', fontSize: 9 }}>
        <div>{timestamp}</div>
        <div>
          Page {page} of {of}
        </div>
      </div>
    </div>
  );
};

const DataRow = (props) => {
  const style = {
    ...borderTop,
    fontSize: 13,
    display: 'grid',
    height: 36,
    gridTemplateColumns: '127px 37px 233px 105px 37px 195px 218px 113px',
    gridColumnGap: 5,
  };
  return <div style={{ ...style, ...props.style }}>{props.children}</div>;
};

// const DataRow = styled.div`
//   font-size: 10px;
//   display: grid;
//   grid-template-columns: 85fr 25fr 155fr 70fr 25fr 130fr 145fr 75fr;
//   grid-column-gap: 5px;
// `;
const HeaderRow = () => (
  <DataRow style={{ fontWeight: 'bold' }}>
    <div>Name</div>
    <div style={{ justifySelf: 'center' }}>£</div>
    <div>Address</div>
    <div>Phone</div>
    <div style={{ justifySelf: 'flex-end' }}>No</div>
    <div>Email</div>
    <div>Next of Kin</div>
    <div>Medical</div>
  </DataRow>
);
const prepAddr = (addr) => {
  let result = pcexp.exec(addr);
  if (!result) return addr;
  return result[1] + result[2].toUpperCase() + ' ' + result[4].toUpperCase();
};

const DataCell = React.forwardRef((props, ref) => {
  const { children, style, ...rest } = props;
  return (
    <div ref={ref} style={{ height: 36, ...style }} {...rest}>
      {children}
    </div>
  );
});

const MemberRow = ({ mem }) => {
  const [subs, atts] = showSubs(mem);
  const { fontSize: fsM, ref: refM } = useFitText();
  const { fontSize: fsK, ref: refK } = useFitText();
  const { fontSize: fsN, ref: refN } = useFitText();
  const { fontSize: fsA, ref: refA } = useFitText();
  const { fontSize: fsE, ref: refE } = useFitText();
  const { fontSize: fsP, ref: refP } = useFitText();

  return (
    <DataRow key={mem._id} style={{ ...borderTop }}>
      <DataCell ref={refN} style={{ fontSize: fsN }}>
        {mem.sortName}
      </DataCell>
      <div style={{ justifySelf: 'center', ...atts }}>{subs}</div>
      <DataCell ref={refA} style={{ fontSize: fsA }}>
        {prepAddr(mem.address)}
      </DataCell>
      <DataCell ref={refP} style={{ fontSize: fsP }}>
        {'H:' + mem.phone + '\nM:' + mem.mobile.replace('/', '\n  ')}
        {/* <div>H:{mem.phone}</div>
        <div>M:{mem.mobile}</div> */}
      </DataCell>
      <div style={{ justifySelf: 'flex-end', fontSize: 12 }}>
        {mem.memberId.substr(1)}
      </div>
      <DataCell ref={refE} style={{ fontSize: fsE }}>
        {mem.email}
      </DataCell>
      <div ref={refK} style={{ fontSize: fsK }}>
        {mem.nextOfKin}
      </div>
      <DataCell ref={refM} style={{ fontSize: fsM }}>
        {mem.medical.replace(/,/, ', ')}
      </DataCell>
    </DataRow>
  );
};
// Create Document Component
export const MembershipListReport = () => {
  const sortBy = useStoreState((s) => s.members.sortBy);
  const showAll = useStoreState((s) => s.members.showAll);
  const ready = useStoreState((a) => a.reports.ready);
  const imReady = useStoreActions((a) => a.reports.imReady);

  // const [pages, setPages] = useState([]);

  const resp = useFetchData(`allMembers`);
  logit('allMembers fetchData returned', resp);
  if ((resp?.data?.length ?? 0) <= 0) return null;
  let members = _.sortBy(
    resp.data?.filter((m) => showAll || paidUp(m)),
    [sortBy],
  );
  const memPerPage = 15;
  // partition the members into pages
  const pages = [];
  for (let strt = 0; strt < members.length; strt += memPerPage) {
    pages.push(members.slice(strt, strt + memPerPage));
  }
  logit('pages', pages);
  logit('report.ready', ready);
  // following lines triggers a render which makes the useFitText hook work
  imReady('membersReport');

  return (
    <Document
      title="St.Edward's Members"
      author='Booking System'
      subject='Membership List'
    >
      {pages.map((page, no) => (
        <Page key={page[0].memberId} page={page}>
          <Banner page={no + 1} of={pages.length} />
          <ReportBody>
            <HeaderRow />
            {page.map((mem) => (
              <MemberRow key={mem.memberId} mem={mem} />
            ))}
          </ReportBody>
        </Page>
      ))}
    </Document>
  );
};
