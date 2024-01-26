import React, { FunctionComponent, useState } from 'react';

interface IToostMessageProps {
  toastMessage: string;
}

const Opt7ToastifyContainer: FunctionComponent<IToostMessageProps> = ({ toastMessage }) => {
  const [isOpen, setIsOpen] = useState(true);
  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <>
      {isOpen && (
        <div className="alert-box" style={{
          border: '1px solid #ebebeb',
          backgroundColor: '#fcfcfc',
          fontSize: '1.077rem',
          height: '3.6975rem',
          paddingBottom: 0,
          paddingLeft: '1rem',
          paddingRight: '1rem',
          paddingTop: '1.125rem',
          borderRadius: '5px',
          position: 'relative',
        }}>
          <span className="close-button" onClick={handleClose} style={{
            position: 'absolute',
            right: '15px',
            top: '5px',
            fontSize: '18px',
            fontWeight: 600,
          }}>&times;</span>
          <p>{toastMessage}</p>
        </div>
      )}
    </>
  );
};

export default Opt7ToastifyContainer;
