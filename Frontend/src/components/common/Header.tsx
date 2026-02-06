import { Menu, Search, Bell, BellOff, BellRing, Sun, Moon, LogOut, User as UserIcon, Home } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNotifications } from '../../contexts/NotificationContext';
import type { User } from '../../types';

interface HeaderProps {
  user: User;
  setSidebarOpen: (open: boolean) => void;
  toggleTheme: () => void;
  isDarkMode: boolean;
  onLogout: () => void;
  onHouseholdSettings: () => void;
}

const Header = ({ user, setSidebarOpen, toggleTheme, isDarkMode, onLogout, onHouseholdSettings }: HeaderProps): JSX.Element => {
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const [showNotifDropdown, setShowNotifDropdown] = useState<boolean>(false);
  const { permissionGranted, requestPermission } = useNotifications();

  // Auto-close notification dropdown after 3 seconds
  useEffect(() => {
    if (showNotifDropdown) {
      const timer = setTimeout(() => {
        setShowNotifDropdown(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showNotifDropdown]);

  const handleLogout = (): void => {
    setShowDropdown(false);
    onLogout();
  };

  const handleNotificationClick = async (): Promise<void> => {
    if (!permissionGranted) {
      const granted = await requestPermission();
      if (granted) {
        // Show confirmation dropdown briefly
        setShowNotifDropdown(true);
      }
    } else {
      setShowNotifDropdown(!showNotifDropdown);
    }
  };

  return (
    <header className="flex-shrink-0 flex items-center justify-between p-4 border-b dark:border-gray-700 bg-white dark:bg-gray-800 relative">
      {/* App title on mobile, hidden on desktop */}
      <h1 className="text-lg font-bold text-teal-700 dark:text-teal-400 lg:hidden">HarmonyHomes</h1>
      <div className="relative w-full max-w-xs hidden lg:block">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search..."
          className="w-full pl-10 pr-4 py-2 rounded-lg border bg-gray-100 dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
      </div>
      <div className="flex items-center space-x-4">
        <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
          {isDarkMode ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-gray-600" />}
        </button>
        <div className="relative">
          <button 
            onClick={handleNotificationClick}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 relative"
            title={permissionGranted ? 'Notifications enabled' : 'Click to enable notifications'}
          >
            {permissionGranted ? (
              <Bell className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            ) : (
              <BellOff className="w-5 h-5 text-gray-400" />
            )}
            {!permissionGranted && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            )}
          </button>
          {showNotifDropdown && permissionGranted && (
            <div className="absolute right-0 top-12 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 p-4">
              <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                <BellRing className="w-5 h-5" />
                <span className="text-sm font-medium">Notifications enabled!</span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                You'll receive notifications when roommates add chores, expenses, or events.
              </p>
            </div>
          )}
        </div>
        <div className="relative">
          <button 
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <img src={user.avatarUrl || ''} alt={user.name} className="w-8 h-8 rounded-full" />
            <span className="hidden md:block font-semibold">{user.name}</span>
          </button>
          
          {showDropdown && (
            <div className="absolute right-0 top-12 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
              <div className="p-3 border-b dark:border-gray-700">
                <div className="flex items-center space-x-3">
                  <img src={user.avatarUrl || ''} alt={user.name} className="w-10 h-10 rounded-full" />
                  <div>
                    <p className="font-semibold text-sm">{user.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Roommate</p>
                  </div>
                </div>
              </div>
              <div className="p-2">
                <button 
                  onClick={() => { setShowDropdown(false); onHouseholdSettings(); }}
                  className="flex items-center w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Household Settings
                </button>
                <button className="flex items-center w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md">
                  <UserIcon className="w-4 h-4 mr-2" />
                  Profile Settings
                </button>
                <button 
                  onClick={handleLogout}
                  className="flex items-center w-full px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Overlay to close dropdown when clicking outside */}
      {showDropdown && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowDropdown(false)}
        />
      )}
    </header>
  );
};

export default Header;