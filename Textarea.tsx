
import React from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}

const Textarea: React.FC<TextareaProps> = ({ label, id, ...props }) => {
  const textareaId = id || props.name;
  return (
    <div>
      {label && <label htmlFor={textareaId} className="block text-sm font-medium text-slate-700 mb-1">{label}</label>}
      <textarea
        id={textareaId}
        {...props}
        className={`block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-brand-blue-500 focus:border-brand-blue-500 sm:text-sm ${props.className || ''}`}
      />
    </div>
  );
};

export default Textarea;