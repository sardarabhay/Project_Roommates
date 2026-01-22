import React, { useState } from 'react';
import AuthPage from './components/auth/AuthPage';
import SuccessMessage from './components/auth/SuccessMessage';
import Header from './components/common/Header';
import Sidebar from './components/common/Sidebar';
import Modal from './components/common/Modal';
import DashboardModule from './components/modules/DashboardModule';
import FinanceModule from './components/modules/FinanceModule';
import ChoresModule from './components/modules/ChoresModule';
import CommunicationModule from './components/modules/CommunicationModule';
import LandlordModule from './components/modules/LandlordModule';
import EventsModule from './components/modules/EventsModule';
import AddExpenseForm from './components/forms/AddExpenseForm';
import AddTaskForm from './components/forms/AddTaskForm';
import ReportIssueForm from './components/forms/ReportIssueForm';
import CreateEventForm from './components/forms/CreateEventForm';
import BalancesModal from './components/forms/BalancesModal';
import { useBalances } from './hooks/useBalances';
import { mockUser } from './data/mockData';

export default function App() {
  const [authState, setAuthState] = useState('login'); 
  const [activeModule, setActiveModule] = useState('dashboard');
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isDarkMode, setDarkMode] = useState(false);
  const [activeModal, setActiveModal] = useState(null);

  const balances = useBalances();

  const handleLogin = () => setAuthState('logged-in');
  const handleSignupSuccess = () => setAuthState('signup-success');
  const handleLogout = () => setAuthState('login');
  const handleContinueToLogin = () => setAuthState('login');

  const toggleTheme = () => {
    const newIsDarkMode = !isDarkMode;
    setDarkMode(newIsDarkMode);
    if (newIsDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const openModal = (modalType) => setActiveModal(modalType);
  const closeModal = () => setActiveModal(null);

  const renderModule = () => {
    switch (activeModule) {
      case 'dashboard': return <DashboardModule setActiveModule={setActiveModule} balances={balances} />;
      case 'finance': return <FinanceModule onAddExpense={() => openModal('addExpense')} onSettleUp={() => openModal('settleUp')} balances={balances} />;
      case 'chores': return <ChoresModule onAddTask={() => openModal('addTask')} />;
      case 'communication': return <CommunicationModule />;
      case 'landlord': return <LandlordModule onReportIssue={() => openModal('reportIssue')} />;
      case 'events': return <EventsModule onCreateEvent={() => openModal('createEvent')} />;
      default: return <DashboardModule setActiveModule={setActiveModule} balances={balances} />;
    }
  };

  const renderModalContent = () => {
    switch (activeModal) {
      case 'addExpense': return <AddExpenseForm onClose={closeModal} />;
      case 'addTask': return <AddTaskForm onClose={closeModal} />;
      case 'reportIssue': return <ReportIssueForm onClose={closeModal} />;
      case 'createEvent': return <CreateEventForm onClose={closeModal} />;
      case 'settleUp': return <BalancesModal onClose={closeModal} balances={balances} />;
      default: return null;
    }
  };

  
  if (authState === 'login') {
    return <AuthPage onLogin={handleLogin} onSignupSuccess={handleSignupSuccess} />;
  }

  if (authState === 'signup-success') {
    return <SuccessMessage onContinue={handleContinueToLogin} />;
  }

  return (
    <div className={`flex h-screen font-sans ${isDarkMode ? 'dark bg-gray-900 text-gray-100' : 'bg-gray-50'}`}>
      <Sidebar activeModule={activeModule} setActiveModule={setActiveModule} isSidebarOpen={isSidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          user={mockUser} 
          setSidebarOpen={setSidebarOpen} 
          toggleTheme={toggleTheme} 
          isDarkMode={isDarkMode} 
          onLogout={handleLogout}
        />
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 sm:p-6 lg:p-8">
          {renderModule()}
        </main>
      </div>
      {activeModal && (
        <Modal isOpen={!!activeModal} onClose={closeModal}>
          {renderModalContent()}
        </Modal>
      )}
    </div>
  );
}