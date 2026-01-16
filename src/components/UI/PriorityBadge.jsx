import React from 'react';
import { priorityBadge } from '../../utils/helpers';

const PriorityBadge = ({ priority }) => {
  const meta = priorityBadge(priority);
  
  return (
    <span className="priority-pill" style={{ background: meta.bg, color: meta.color }}>
      <span className="priority-dot" style={{ background: meta.color }}></span>
      {meta.label}
    </span>
  );
};

export default PriorityBadge;