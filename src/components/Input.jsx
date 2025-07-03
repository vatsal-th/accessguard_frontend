import React from 'react';

const Input = React.forwardRef(({ label, error, className = '', ...props }, ref) => (
  <div className={`mb-4 ${className}`}>
    {label && (
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    )}
    <input
      ref={ref}
      className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-gray-900 bg-white border-gray-300 ${
        error ? 'border-red-500' : ''
      }`}
      {...props}
    />
    {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
  </div>
));

export default Input; 