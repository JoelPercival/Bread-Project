import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BarChart, Clock, ClipboardList, PlusCircle, Croissant } from 'lucide-react';
import { motion } from 'framer-motion';

const Navbar: React.FC = () => {
  const location = useLocation();

  const navItems = [
    { path: '/recipes', label: 'Recipes', icon: ClipboardList },
    { path: '/timings', label: 'Timings', icon: Clock },
    { path: '/analysis', label: 'Analysis', icon: BarChart },
    { path: '/new-bake', label: 'New Bake', icon: PlusCircle },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 sm:top-0 sm:bottom-auto sm:border-t-0 sm:border-b z-10">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between sm:h-16">
          <div className="hidden sm:flex items-center">
            <Link to="/" className="flex items-center">
              <Croissant size={28} className="text-bread-crust mr-2" />
              <span className="font-serif text-xl font-semibold text-bread-crust">BreadMaster</span>
            </Link>
          </div>
          
          <div className="flex justify-around sm:justify-end w-full sm:w-auto">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex flex-col items-center py-2 px-4 relative ${
                    isActive ? 'text-bread-crust' : 'text-gray-500 hover:text-bread-brown-600'
                  }`}
                >
                  <Icon size={20} />
                  <span className="text-xs mt-1">{item.label}</span>
                  
                  {isActive && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute bottom-0 left-0 right-0 h-1 sm:h-full sm:w-1 sm:left-0 sm:right-auto bg-bread-crust rounded-t-full sm:rounded-l-full sm:rounded-tr-none"
                      initial={false}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;