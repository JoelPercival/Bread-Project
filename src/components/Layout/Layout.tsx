import React from 'react';
import Navbar from './Navbar';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
}

const Layout: React.FC<LayoutProps> = ({ children, title }) => {
  return (
    <div className="min-h-screen bg-bread-brown-100 flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-4 pb-20 sm:pt-20 sm:pb-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {title && (
            <div className="mb-6">
              <h1 className="font-serif text-2xl sm:text-3xl text-bread-brown-800 font-semibold">
                {title}
              </h1>
              <div className="h-1 w-20 bg-bread-crust rounded mt-2"></div>
            </div>
          )}
          
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;