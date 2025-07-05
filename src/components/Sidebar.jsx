import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from './Button';
import { 
  FiHome, 
  FiUsers, 
  FiShield, 
  FiBriefcase, 
  FiUser, 
  FiLogOut,
  FiChevronRight,
} from 'react-icons/fi';

const navConfig = {
  admin: [
    { to: '/dashboard', label: 'Dashboard', icon: <FiHome /> },
    { to: '/users', label: 'All Users', icon: <FiUsers /> },
    { to: '/user/admins', label: 'Admins', icon: <FiShield /> },
    { to: '/user/managers', label: 'Managers', icon: <FiBriefcase /> },
    { to: '/user/employees', label: 'Employees', icon: <FiUser /> },
  ],
  manager: [
    { to: '/dashboard', label: 'Dashboard', icon: <FiHome /> },
    { to: '/team', label: 'My Team', icon: <FiUsers /> },
  ],
  employee: [
    { to: '/dashboard', label: 'Dashboard', icon: <FiHome /> },
    { to: '/tasks', label: 'My Tasks', icon: <FiBriefcase /> },
  ],
  user: [
    { to: '/dashboard', label: 'Dashboard', icon: <FiHome /> },
    // { to: '/profile', label: 'Profile', icon: <FiUser /> },
  ],
};

const Sidebar = () => {
  const { user, role, logout } = useAuth();
  const links = navConfig[role] || navConfig.user;

  return (
    <aside className="h-screen w-64 bg-white border-r border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-6 pb-4">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-lg bg-blue-600 flex items-center justify-center text-white">
            <FiShield size={20} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">AccessGuard</h2>
            <p className="text-xs text-gray-500">User Management System</p>
          </div>
        </div>
      </div>

      {/* User Profile */}
      <div className="px-6 py-4 border-t border-b border-gray-100 bg-gray-50">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium">
            {user?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user?.name || user?.email}
            </p>
            <p className="text-xs text-gray-500 capitalize">{role}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 overflow-y-auto">
        <ul className="space-y-1">
          {links.map((link) => (
            <li key={link.to}>
              <NavLink
                to={link.to}
                className={({ isActive }) =>
                  `flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all ${
                    isActive 
                      ? 'bg-blue-50 text-blue-700' 
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`
                }
                end
              >
                <span className="mr-3 opacity-80">{link.icon}</span>
                <span className="flex-1">{link.label}</span>
                <FiChevronRight className="h-4 w-4 text-gray-400" />
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <div className="mb-2">
        </div>
        <Button
          variant="ghost"
          className="w-full justify-start text-gray-700 hover:bg-gray-100"
          onClick={logout}
        >
          <FiLogOut className="mr-3" />
          Logout
        </Button>
      </div>
    </aside>
  );
};

export default Sidebar;