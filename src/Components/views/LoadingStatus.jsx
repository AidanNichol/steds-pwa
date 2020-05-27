/* jshint quotmark: false */
import React from 'react';
import _ from 'lodash';
import { Panel } from '../utility/AJNPanel';
import styled from 'styled-components';
// import { IconsLoad } from '../../fontAwesome2';

// import Logit from 'logit';
// var logit = Logit('components/views/bookings/PaymentStatusLog');

export const LoadingStatus = LoadingStatusR;
const Wrapper = styled.div`
  flex-direction: column;
  display: grid;
  grid-template-rows: auto minmax(0, 1fr) auto;
  grid-template-columns: auto auto;
  overflow: scroll;
  display: grid;
  min-height: 0;
  grid-template-areas:
    'select logs'
    'status logs'
    'pymts pymts';
  height: 100%;
  .select {
    grid-area: select;
  }
  .status {
    grid-area: status;
  }
  .logs {
    grid-area: logs;
    overflow: auto;
  }
  .payment {
    grid-area: pymts;
  }
`;

const Footer = styled.div`
  height: 50px;
  width: 100%;
  background-color: red;
  /* grid-area: pymts; */
`;

const Right = styled.div`
  /* height: min-content;
  max-height: min-content; */
  background-color: yellow;
  overflow: scroll;
  min-height: 0;
  max-height: 100%;
  /* flex-grow: 1; */
  /* grid-area: logs; */
`;
const Search = styled.div`
  height: 60px;
  background-color: teal;
  /* grid-area: select; */
`;
const Status = styled.div`
  flex-grow: 1;
  background-color: brown;
  /* grid-area: status; */
`;

function LoadingStatusR(props) {
  return (
    <Panel header={'test Layout'} id=''>
      <Wrapper>
        {/* <Main> */}
        {/* <Left> */}
        <Search className='select'>Search</Search>
        <Right className='logs'>
          {_.range(1, 100).map((n) => (
            <div key={n}>{'line ' + n}</div>
          ))}
        </Right>
        <Status className='status'>Status</Status>
        {/* </Left> */}
        {/* </Main> */}
        <Footer className='payment'>Footer </Footer>
      </Wrapper>
    </Panel>
    // <div>
    //   <h3 style={{ width: '100%', textAlign: 'right' }}>Loading StatusX</h3>
    //   {props.loadingStatus.map((l) => {
    //     const bits = l.split('∞');
    //     return (
    //       <div style={{ paddingBottom: 10 }} key={l}>
    //         {bits[0]}
    //         {bits.length === 2 ? (
    //           <img src={infinity} alt='' style={{ height: '1.5em' }} />
    //         ) : null}
    //         {bits[1] && bits[1]}
    //       </div>
    //     );
    //   })}
    // </div>
  );
}
