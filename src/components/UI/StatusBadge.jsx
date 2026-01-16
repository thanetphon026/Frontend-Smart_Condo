import React from 'react';
import { statusBadge } from '../../utils/helpers';

const StatusBadge = ({ status }) => {
  const meta = statusBadge(status);

  return (
    <span className={`badge-status text-nowrap ${meta.class}`}>
      <i className={`bi ${meta.icon} me-1`}></i>
      {meta.text}
    </span>
  );
};

export default StatusBadge;