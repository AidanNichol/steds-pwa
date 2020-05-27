import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import styled from 'styled-components';

// 'modal-root' is a sibling to 'app-root'
const modalRoot = document.getElementById('modal-root');

export function Modal({ isOpen, children, ...rest }) {
  // element to which the modal will be rendered
  const el = document.createElement('div');

  useEffect(() => {
    // append to root when the children of Modal are mounted
    modalRoot.appendChild(el);

    // do a cleanup
    return () => {
      modalRoot.removeChild(el);
    };
  }, [el]);
  return (
    isOpen &&
    createPortal(
      // child element
      <Wallpaper>
        <Panel {...rest}>{children}</Panel>
      </Wallpaper>,
      // target container
      el,
    )
  );
}
const Wallpaper = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
  padding: 100px;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-content: center;
  justify-content: center;
`;
const Panel = styled.div`
  width: 50%;
  height: 25%;
  background: white;
  padding: 50px;
  text-align: center;
  align-self: center;
  justify-self: center;
  /* min-height: 100vh; */
  display: flex;
  flex-direction: column;
  footer,
  .footer {
    place-items: center;
    margin-top: auto;
  }
`;
