import React from 'react';
export const icon_Wn = ({ pos, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    {...props}
    width="16"
    height="16"
    style={{
      fillRule: 'evenodd',
      clipRule: 'evenodd',
      strokeLinejoin: 'round',
      strokeMiterlimit: '1.41421'
    }}
    version="1.1"
    viewBox="0 0 21 21"
    xmlSpace="preserve"
  >
    <g transform="matrix(1,0,0,1,-1.5,-1.5)">
      <g id="Bookings">
        <g id="icon-Wn">
          <path
            d="M12.5,7L11,7L11,13L16.25,16.15L17,14.92L12.5,12.25L12.5,7Z"
            style={{
              fill: 'rgb(200, 200, 200)',
              fillRule: 'nonzero',
              stroke: 'rgb(200, 200, 200)',
              strokeWidth: 1
            }}
          />
          <path
            d="M11.99,2C6.47,2 2,6.48 2,12C2,17.52 6.47,22 11.99,22C17.52,22 22,17.52 22,12C22,6.48 17.52,2 11.99,2ZM12,20C7.58,20 4,16.42 4,12C4,7.58 7.58,4 12,4C16.42,4 20,7.58 20,12C20,16.42 16.42,20 12,20Z"
            style={{
              fill: 'rgb(200, 200, 200)',
              fillRule: 'nonzero',
              stroke: 'rgb(200, 200, 200)',
              strokeWidth: 1
            }}
          />
          <g>
            <text
              x="12px"
              y="20px"
              style={{
                textAnchor: 'middle',
                // fontFamily: 'Arial-BoldMT, Arial, sans-serif',
                fontWeight: 700,
                fontSize: 20,
                fill: 'rgb(255, 0, 0)',
                stroke: 'white',
                strokeWidth: 0.4
              }}
            >
              {pos || '?'}
            </text>
          </g>
        </g>
      </g>
    </g>
  </svg>
);
