import React from 'react';

const variants = {
  primary: 'bg-blue-600 text-white hover:bg-blue-700',
  secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300',
  danger: 'bg-red-600 text-white hover:bg-red-700',
};

const Button = ({
  children,
  type = 'button',
  variant = 'primary',
  loading = false,
  disabled = false,
  className = '',
  ...props
}) => (
  <button
    type={type}
    className={`inline-flex items-center justify-center px-4 py-2 rounded font-medium transition focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60 disabled:cursor-not-allowed ${
      variants[variant] || variants.primary
    } ${className}`}
    disabled={disabled || loading}
    {...props}
  >
    {loading ? (
      <span className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
    ) : null}
    {children}
  </button>
);

export default Button; 