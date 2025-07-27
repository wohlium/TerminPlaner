
import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  children: React.ReactNode;
}

const Select: React.FC<SelectProps> = ({ label, id, children, ...props }) => {
  const selectId = id || props.name;
  return (
    <div>
      {label && <label htmlFor={selectId} className="block text-sm font-medium text-slate-700 mb-1">{label}</label>}
      <select
        id={selectId}
        {...props}
        className={`block w-full pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-brand-blue-500 focus:border-brand-blue-500 sm:text-sm rounded-md ${props.className || ''}`}
      >
        {children}
      </select>
    </div>
  );
};

export default Select;