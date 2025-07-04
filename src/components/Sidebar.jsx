import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from './Button';

const navConfig = {
  admin: [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/users', label: 'All Users' },
    { to: '/user/admins', label: 'Admins' },
    { to: '/user/managers', label: 'Managers' },
    { to: '/user/employees', label: 'Employees' },
    // { to: '/users/users', label: 'Users' },
  ],
  manager: [
    { to: '/dashboard', label: 'Dashboard' },
    // Add more manager links here
  ],
  employee: [
    { to: '/dashboard', label: 'Dashboard' },
    // Add more employee links here
  ],
  user: [
    { to: '/dashboard', label: 'Dashboard' },
    // Add more user links here
  ],
};

const Sidebar = () => {
  const { user, role, logout } = useAuth();
  const links = navConfig[role] || navConfig.user;

  return (
    <aside className="h-screen w-64 bg-white border-r flex flex-col py-6 px-4 shadow-sm">
      <div className="mb-8">
        <h2 className="text-xl font-bold text-blue-600">AccessGuard</h2>
        <div className="text-sm text-gray-500 mt-1">{user?.name || user?.email}</div>
        <div className="text-xs text-gray-400">{role}</div>
      </div>
      <nav className="flex-1">
        <ul className="space-y-2">
          {links.map((link) => (
            <li key={link.to}>
              <NavLink
                to={link.to}
                className={({ isActive }) =>
                  `block px-4 py-2 rounded transition font-medium ${
                    isActive ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-50'
                  }`
                }
                end
              >
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <div className="mt-8">
        <Button variant="secondary" className="w-full" onClick={logout}>
          Logout
        </Button>
      </div>
    </aside>
  );
};

export default Sidebar; 