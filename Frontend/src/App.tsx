import { useState, useEffect } from 'react';
import AuthPage from './components/auth/AuthPage';
import SuccessMessage from './components/auth/SuccessMessage';
import HouseholdSetup from './components/household/HouseholdSetup';
import HouseholdSettings from './components/household/HouseholdSettings';
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
import EditExpenseModal from './components/forms/EditExpenseModal';
import { useBalances } from './hooks/useBalances';
import { getUser, clearAuth, authApi, setUser } from './services/api';
import type { User, ModuleType, ModalType, AuthState, Expense } from './types';

export default function App(): JSX.Element {
  const [authState, setAuthState] = useState<AuthState>('loading'); 
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeModule, setActiveModule] = useState<ModuleType>('dashboard');
  const [isSidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [isDarkMode, setDarkMode] = useState<boolean>(false);
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [refreshKey, setRefreshKey] = useState<number>(0);

  const balances = useBalances(currentUser);

  const handleExpenseAdded = (): void => {
    balances.refreshBalances();
    setRefreshKey(k => k + 1);
  };

  const handleChoreAdded = (): void => {
    setRefreshKey(k => k + 1);
  };

  const handleEventCreated = (): void => {
    setRefreshKey(k => k + 1);
  };

  const handleIssueReported = (): void => {
    setRefreshKey(k => k + 1);
  };

  // Check for existing auth on mount
  useEffect(() => {
    const checkAuth = async (): Promise<void> => {
      const storedUser = getUser();
      if (storedUser) {
        try {
          // Verify token is still valid
          const user = await authApi.getCurrentUser();
          setCurrentUser(user);
          // Check if user has a household
          if (!user.householdId) {
            setAuthState('needs-household');
          } else {
            setAuthState('logged-in');
          }
        } catch {
          // Token invalid, clear and show login
          clearAuth();
          setAuthState('login');
        }
      } else {
        setAuthState('login');
      }
    };
    checkAuth();
  }, []);

  const handleLogin = (): void => {
    const user = getUser();
    setCurrentUser(user);
    // Check if user has a household
    if (!user?.householdId) {
      setAuthState('needs-household');
    } else {
      setAuthState('logged-in');
    }
  };

  const handleHouseholdComplete = async (): Promise<void> => {
    // Refresh user data after household creation/join
    const user = await authApi.getCurrentUser();
    setUser(user); // Update localStorage
    setCurrentUser(user);
    setAuthState('logged-in');
  };

  const handleSignupSuccess = (): void => setAuthState('signup-success');
  
  const handleLogout = (): void => {
    clearAuth();
    setCurrentUser(null);
    setAuthState('login');
  };
  
  const handleContinueToLogin = (): void => setAuthState('login');

  const toggleTheme = (): void => {
    const newIsDarkMode = !isDarkMode;
    setDarkMode(newIsDarkMode);
    if (newIsDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const openModal = (modalType: ModalType): void => setActiveModal(modalType);
  const closeModal = (): void => {
    setActiveModal(null);
    setSelectedExpense(null);
  };

  const handleEditExpense = (expense: Expense): void => {
    setSelectedExpense(expense);
    setActiveModal('editExpense');
  };

  const renderModule = (): JSX.Element => {
    switch (activeModule) {
      case 'dashboard': return <DashboardModule setActiveModule={setActiveModule} balances={balances} user={currentUser} />;
      case 'finance': return <FinanceModule onAddExpense={() => openModal('addExpense')} onSettleUp={() => openModal('settleUp')} balances={balances} refreshKey={refreshKey} onEditExpense={handleEditExpense} />;
      case 'chores': return <ChoresModule onAddTask={() => openModal('addTask')} user={currentUser} refreshKey={refreshKey} />;
      case 'communication': return <CommunicationModule user={currentUser} />;
      case 'landlord': return <LandlordModule onReportIssue={() => openModal('reportIssue')} refreshKey={refreshKey} />;
      case 'events': return <EventsModule onCreateEvent={() => openModal('createEvent')} user={currentUser} refreshKey={refreshKey} />;
      default: return <DashboardModule setActiveModule={setActiveModule} balances={balances} user={currentUser} />;
    }
  };

  const renderModalContent = (): JSX.Element | null => {
    switch (activeModal) {
      case 'addExpense': return <AddExpenseForm onClose={closeModal} onSuccess={handleExpenseAdded} />;
      case 'editExpense': return selectedExpense ? <EditExpenseModal expense={selectedExpense} onClose={closeModal} onSuccess={handleExpenseAdded} /> : null;
      case 'addTask': return <AddTaskForm onClose={closeModal} onSuccess={handleChoreAdded} />;
      case 'reportIssue': return <ReportIssueForm onClose={closeModal} onSuccess={handleIssueReported} />;
      case 'createEvent': return <CreateEventForm onClose={closeModal} onSuccess={handleEventCreated} />;
      case 'settleUp': return <BalancesModal onClose={closeModal} balances={balances} onSettle={handleExpenseAdded} />;
      case 'householdSettings': return <HouseholdSettings onClose={closeModal} currentUser={currentUser} />;
      default: return null;
    }
  };

  
  if (authState === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (authState === 'login') {
    return <AuthPage onLogin={handleLogin} onSignupSuccess={handleSignupSuccess} />;
  }

  if (authState === 'signup-success') {
    return <SuccessMessage onContinue={handleContinueToLogin} />;
  }

  if (authState === 'needs-household') {
    return <HouseholdSetup onComplete={handleHouseholdComplete} />;
  }

  // Create user object for header (use currentUser from API)
  const user: User = currentUser || { id: 0, name: 'User', email: '', avatarUrl: 'https://placehold.co/100x100/A8D5BA/004643?text=U', householdId: null, role: null };

  return (
    <div className={`flex h-screen font-sans ${isDarkMode ? 'dark bg-gray-900 text-gray-100' : 'bg-gray-50'}`}>
      <Sidebar activeModule={activeModule} setActiveModule={setActiveModule} isSidebarOpen={isSidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          user={user} 
          setSidebarOpen={setSidebarOpen} 
          toggleTheme={toggleTheme} 
          isDarkMode={isDarkMode} 
          onLogout={handleLogout}
          onHouseholdSettings={() => openModal('householdSettings')}
        />
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 sm:p-6 lg:p-8 pb-24 lg:pb-8">
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