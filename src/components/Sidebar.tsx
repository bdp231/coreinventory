import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  ArrowDownToLine, 
  ArrowUpFromLine, 
  ArrowRightLeft, 
  Settings2, 
  History, 
  Building2, 
  User, 
  LogOut 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { clsx } from 'clsx';

export default function Sidebar() {
  const { user, logout } = useAuth();

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Products', path: '/products', icon: Package },
    { name: 'Receipts', path: '/receipts', icon: ArrowDownToLine },
    { name: 'Deliveries', path: '/deliveries', icon: ArrowUpFromLine },
    { name: 'Internal Transfers', path: '/transfers', icon: ArrowRightLeft },
    { name: 'Inventory Adjustment', path: '/adjustments', icon: Settings2 },
    { name: 'Move History', path: '/history', icon: History },
  ];

  if (user?.role === 'Inventory Manager') {
    navItems.push({ name: 'Warehouse Settings', path: '/warehouses', icon: Building2 });
  }

  return (
    <div className="w-64 bg-slate-900 text-white flex flex-col h-screen">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-emerald-400 flex items-center gap-2">
          <Package className="w-8 h-8" />
          CoreInventory
        </h1>
      </div>
      
      <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 px-4 py-3 rounded-xl transition-colors',
                isActive 
                  ? 'bg-emerald-500/10 text-emerald-400' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              )
            }
          >
            <item.icon className="w-5 h-5" />
            <span className="font-medium">{item.name}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <NavLink
          to="/profile"
          className={({ isActive }) =>
            clsx(
              'flex items-center gap-3 px-4 py-3 rounded-xl transition-colors mb-2',
              isActive 
                ? 'bg-emerald-500/10 text-emerald-400' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            )
          }
        >
          <User className="w-5 h-5" />
          <span className="font-medium">Profile</span>
        </NavLink>
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
}
