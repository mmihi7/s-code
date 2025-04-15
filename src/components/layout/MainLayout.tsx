
import React from "react";
import { Link, useLocation } from "react-router-dom";

interface MainLayoutProps {
  children: React.ReactNode;
  showNavigation?: boolean;
  premiseName?: string;
}

const MainLayout: React.FC<MainLayoutProps> = ({ 
  children, 
  showNavigation = true,
  premiseName
}) => {
  const location = useLocation();
  const isDashboard = location.pathname === "/dashboard";
  const isLoggedIn = isDashboard; // In a real app, this would come from an auth context
  
  return (
    <div className="min-h-screen bg-scode-black flex flex-col">
      {showNavigation && (
        <header className="w-full py-4 px-6 bg-black/30 backdrop-blur-sm border-b border-white/10">
          <nav className="max-w-7xl mx-auto flex justify-between items-center">
            <Link to="/" className="flex items-center space-x-2">
              <span className="text-xl font-bold text-gradient">S-CODE</span>
            </Link>
            
            {/* Only show these links if NOT logged in and NOT on dashboard */}
            {!isLoggedIn && !isDashboard && (
              <div className="flex items-center space-x-4">
                <Link 
                  to="/user-access" 
                  className="text-sm text-white/80 hover:text-white transition-colors"
                >
                  User Access
                </Link>
                <Link 
                  to="/register-premise" 
                  className="text-sm px-4 py-2 bg-scode-blue text-white rounded-md hover:bg-opacity-90 transition-colors"
                >
                  Register Premise
                </Link>
              </div>
            )}
            
            {/* If logged in, show different navigation options */}
            {isLoggedIn && (
              <div className="flex items-center space-x-4">
                <Link 
                  to="/settings" 
                  className="text-sm text-white/80 hover:text-white transition-colors"
                >
                  Settings
                </Link>
                <button 
                  className="text-sm px-4 py-2 bg-transparent border border-white/20 text-white rounded-md hover:bg-white/10 transition-colors"
                  onClick={() => {
                    // In a real app, this would call a logout function
                    window.location.href = "/";
                  }}
                >
                  Logout
                </button>
              </div>
            )}
          </nav>
        </header>
      )}
      
      <main className="flex-grow">
        {children}
      </main>
      
      <footer className="w-full py-6 px-6 border-t border-white/10 bg-black/30">
        <div className="max-w-7xl mx-auto text-center text-white/60 text-sm">
          <p>© {new Date().getFullYear()} S-Code. Transforming Visitor Management in Kenya.</p>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
