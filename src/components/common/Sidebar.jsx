
import { LayoutDashboard, Wallet, ListChecks, MessageCircle, Shield, Calendar, X } from 'lucide-react';

const Sidebar = ({ activeModule, setActiveModule, isSidebarOpen, setSidebarOpen }) => {
  const navItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'finance', icon: Wallet, label: 'Finance' },
    { id: 'chores', icon: ListChecks, label: 'Chores' },
    { id: 'communication', icon: MessageCircle, label: 'Comms' },
    { id: 'landlord', icon: Shield, label: 'Landlord' },
    { id: 'events', icon: Calendar, label: 'Events' },
  ];

  const NavLink = ({ item }) => (
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

  return (
    <>
      <div className={`fixed inset-0 bg-black/50 z-30 lg:hidden transition-opacity ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setSidebarOpen(false)}></div>
      <aside className={`absolute lg:relative flex-shrink-0 w-64 bg-white dark:bg-gray-800 border-r dark:border-gray-700 flex flex-col p-4 z-40 transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-teal-700 dark:text-teal-400">HarmonyHomes</h1>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1">
            <X className="w-6 h-6"/>
          </button>
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