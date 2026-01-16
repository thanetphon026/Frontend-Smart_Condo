import React from 'react';

const TableRow = ({ children, className = '', onClick }) => {
  return (
    <tr className={className} onClick={onClick}>
      {children}
    </tr>
  );
};

export default TableRow;