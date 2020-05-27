import React from 'react';
import { ReactComponent as Logo } from '../images/St.EdwardsLogoSimple.svg';
// import { ReactComponent as Logos } from '../images/requestTypeIcons.svg';
import { format } from 'date-fns';
import Logit from 'logit';
var logit = Logit('reports/membershipListPDF');
// Create styles
const timestamp = format(new Date(), 'yyyy-MM-dd HH:mm');
const borderTop = {
  borderTopColor: '#808080',
  borderTopStyle: 'solid',
  borderTopWidth: 1,
  marginTop: 5,
  paddingTop: 5,
  marginRight: 3
};

function showSubs(mem) {
  const statusMap = { Member: '', HLM: 'hlm', Guest: 'gst', '?': '' };
  const subsMap = {
    OK: { color: 'green' },
    due: { color: 'orange', fontWeight: 'bold' },
    late: { color: 'red', fontWeight: 'bold' }
  };
  let stat = statusMap[mem.memberStatus || '?'];
  if (mem.memberId === 'M2031') logit('mem', mem, stat);
  if (stat !== '') return [stat, {}];

  // let subs = getSubsStatus(mem);
  let subs = mem.subsStatus;
  stat = `${mem.subscription ? "'" + (parseInt(mem.subscription) % 100) : '---'}`;
  let atts = subsMap[subs.status];
  if (mem.memberId === 'M2031') logit('subs', subs, stat, atts);
  return [stat, atts];
}

const Document = props => {
  const style = {
    width: '297mm',
    height: '210mm',
    boxSizing: 'border-box'
  };
  return <div style={style}>{props.children}</div>;
};
const Page = props => {
  const style = {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    justifyContent: 'flex-start',
    fontSize: 14,
    breakBefore: props.page === 1 ? 'never' : 'page'
  };
  return <div style={{ ...style, ...props.style }}>{props.children}</div>;
};

const ReportBody = props => {
  const style = {
    fontSize: 10,
    flexDirection: 'column',
    marginLeft: 10,
    marginRight: 0,
    paddingRight: 10
  };
  return <div style={{ ...style, ...props.style }}>{props.children}</div>;
};
const Banner = ({ page, of, className }) => {
  const style = {
    justifyContent: 'space-between',
    fontSize: 10,
    display: 'grid',
    gridTemplateColumns: '95px 1fr 95px'
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

const DataRow = props => {
  const style = {
    ...borderTop,
    fontSize: 14,
    display: 'grid',
    gridTemplateColumns: '85fr 25fr 155fr 70fr 25fr 130fr 145fr 75fr',
    gridColumnGap: 5
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
const MemberRow = ({ mem }) => (
  <DataRow key={mem._id} style={{ ...borderTop }}>
    <div>{mem.fullNameR}</div>
    <div style={{ justifySelf: 'center' }}>{showSubs(mem)[0]}</div>
    <div>{mem.address}</div>
    <div>
      <div>H:{mem.phone}</div>
      <div>M:{mem.mobile}</div>
    </div>
    <div style={{ justifySelf: 'flex-end' }}>{mem.memNo}</div>
    <div style={{ fontSize: 12 }}>{mem.email}</div>
    <div>{mem.nextOfKin}</div>
    <div style={{ fontSize: 12 }}>{mem.medical}</div>
  </DataRow>
);
// Create Document Component
export const MembershipListReport = ({ members }) => {
  logit('invoked', members.length, members);
  const memPerPage = 15;
  const noPages = Math.ceil(members.length / memPerPage);
  // partition the members into pages
  const pages = [];
  for (let strt = 0; strt < members.length; strt += memPerPage) {
    pages.push(members.slice(strt, strt + memPerPage));
  }
  logit('pages', pages);
  return (
    <Document
      title="St.Edward's Members"
      author="Booking System"
      subject="Membership List"
    >
      {pages.map((page, no) => (
        <Page key={page[0]._id} page={page}>
          <Banner page={no + 1} of={noPages} />
          <ReportBody>
            <HeaderRow />
            {page.map(mem => (
              <MemberRow key={mem._id} mem={mem} />
            ))}
          </ReportBody>
        </Page>
      ))}
    </Document>
  );
};

// let docname = '/Documents/My Documents/StEdwards/membersList.pdf';
