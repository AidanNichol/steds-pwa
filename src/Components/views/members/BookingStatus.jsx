import React from 'react';
import styled from 'styled-components/macro';
import { Icon } from '../../utility/Icon';
import { yearMonth } from '../../../store/dateFns';

export const isUndeleteable = (BS) => {
  const { credit, debt, activeBooking, activePayment } = BS;
  return debt || credit || activeBooking || activePayment;
};
const Thumb = ({ bool, size = '1x', color = bool ? 'red' : 'green' }) => (
  <Icon name={bool ? 'thumbs_down' : 'thumbs_up'} color={color} size={size} />
);
export const BookingState = (props) => {
  const undeletable = isUndeleteable(props);
  const { credit, debt, lastBooking, lastPayment, activeBooking, activePayment } = props;
  return (
    <InfoBox disabled>
      <Thumb bool={undeletable} size='4x' />
      <div className='message'>Deletable?</div>
      <div className='detail'>
        <Thumb bool={debt} />
        Debt: <span>£{debt ?? 0}</span>
      </div>

      <div className='detail'>
        <Thumb bool={credit} />
        Credit: <span>£{credit ?? 0}</span>
      </div>
      <div className='detail'>
        <Thumb bool={activeBooking} />
        Booking:<span>{yearMonth(lastBooking)}</span>
      </div>
      <div className='detail'>
        <Thumb bool={activePayment} />
        Payment:<span>{yearMonth(lastPayment)}</span>
      </div>
    </InfoBox>
  );
};
const InfoBox = styled.div`
  position: relative;
  background-color: yellow;
  margin-bottom: auto;
  transition: all 200ms ease-in;
  width: 100%;
  background-color: #e6e6e6;
  border: 1px solid #adadad;
  border-radius: 4px;
  padding: 5px;
  & .messsage {
    font-size: 14px;
  }
  & .detail {
    font-size: 0.7em;
    display: none;
    width: 100%;
    span {
      display: inline-block;
      margin-left: auto;
    }
  }
  &:hover {
    /* font-size: 0.9em; */
    width: 140%;
    z-index: 200;
    transform: scale(1.8);
    overflow: visible;
    & .message {
      display: none;
    }
    & .detail {
      display: flex;
      justify-content: flex-start;
    }
  }
`;
