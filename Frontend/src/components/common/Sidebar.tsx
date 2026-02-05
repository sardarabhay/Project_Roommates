import { LayoutDashboard, Wallet, ListChecks, MessageCircle, Shield, Calendar, X, LucideIcon } from 'lucide-react';
import type { ModuleType } from '../../types';

interface SidebarProps {
  activeModule: ModuleType;
  setActiveModule: (module: ModuleType) => void;
  isSidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

interface NavItem {
  id: ModuleType;
  icon: LucideIcon;
  label: string;
}

const Sidebar = ({ activeModule, setActiveModule, isSidebarOpen, setSidebarOpen }: SidebarProps): JSX.Element => {
  const navItems: NavItem[] = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'finance', icon: Wallet, label: 'Finance' },
    { id: 'chores', icon: ListChecks, label: 'Chores' },
    { id: 'communication', icon: MessageCircle, label: 'Comms' },
    { id: 'landlord', icon: Shield, label: 'Landlord' },
    { id: 'events', icon: Calendar, label: 'Events' },
  ];

  // Desktop sidebar nav link
  const NavLink = ({ item }: { item: NavItem }): JSX.Element => (
    <button
      onClick={() => {
        setActiveModule(item.id);
        setSidebarOpen(false);
      }}
      className={`flex items-center w-full px-4 py-3 text-left rounded-lg transition-colors duration-200 ${
        activeModule === item.id
          ? 'bg-teal-600 text-white'
          : 'hover:bg-teal-50 dark:hover:bg-gray-700'
      }`}
    >
      <item.icon className="w-5 h-5 mr-3" />
      <span className="font-medium">{item.label}</span>
    </button>
  );

  // Mobile bottom dock nav item
  const DockItem = ({ item }: { item: NavItem }): JSX.Element => (
    <button
      onClick={() => setActiveModule(item.id)}
      className={`flex flex-col items-center justify-center py-2 px-1 min-w-[60px] transition-all duration-200 ${
        activeModule === item.id
          ? 'text-teal-600 dark:text-teal-400'
          : 'text-gray-500 dark:text-gray-400'
      }`}
    >
      <div className={`p-2 rounded-xl transition-all duration-200 ${
        activeModule === item.id 
          ? 'bg-teal-100 dark:bg-teal-900/50' 
          : ''
      }`}>
        <item.icon className={`w-5 h-5 ${activeModule === item.id ? 'scale-110' : ''} transition-transform`} />
      </div>
      <span className={`text-[10px] mt-1 font-medium ${activeModule === item.id ? 'font-semibold' : ''}`}>
        {item.label}
      </span>
    </button>
  );

  return (
    <>
      {/* Mobile Bottom Dock - visible only on small screens */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden">
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-t border-gray-200 dark:border-gray-700 px-2 pb-safe">
          <div className="flex items-center justify-around max-w-md mx-auto">
            {navItems.map(item => <DockItem key={item.id} item={item} />)}
          </div>
        </div>
      </nav>

      {/* Desktop Sidebar - hidden on mobile */}
      <aside className="hidden lg:flex flex-shrink-0 w-64 bg-white dark:bg-gray-800 border-r dark:border-gray-700 flex-col p-4">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-teal-700 dark:text-teal-400">HarmonyHomes</h1>
        </div>
        <nav className="flex-1 space-y-2">
          {navItems.map(item => <NavLink key={item.id} item={item} />)}
        </nav>
        <div className="mt-auto">
          <div className="p-4 rounded-lg bg-teal-50 dark:bg-gray-700 text-center">
            <h3 className="font-semibold text-teal-800 dark:text-teal-300">Invite Roommates</h3>
            <p className="text-sm text-teal-600 dark:text-teal-400 mt-1 mb-3">Get everyone on board to stay in sync!</p>
            <button className="w-full bg-teal-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-teal-700">Invite</button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;