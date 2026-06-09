import { useNotesStore } from '../../store/notesStore';
import { useTasksStore } from '../../store/tasksStore';
import { NotesPage } from '../../pages/NotesPage';
import { TasksPage } from '../../pages/TasksPage';
import { SearchPage } from '../../pages/SearchPage';
import { MenuPage } from '../../pages/MenuPage';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';
import { SyncSubscriber } from '../sync/SyncSubscriber';
import { useNavigate } from 'react-router-dom';

export function AppShell() {
  const activeTab = useNotesStore((s) => s.activeTab);
  const setActiveTab = useNotesStore((s) => s.setActiveTab);
  const setPendingNewTask = useTasksStore((s) => s.setPendingNewTask);
  const navigate = useNavigate();

  const renderContent = () => {
    switch (activeTab) {
      case 'tasks':
        return <TasksPage />;
      case 'search':
        return <SearchPage />;
      case 'menu':
        return <MenuPage />;
      default:
        return <NotesPage />;
    }
  };

  return (
    <>
      <Sidebar
        onNewNote={() => navigate('/note/new')}
        onNewTask={() => {
          setPendingNewTask(true);
          setActiveTab('tasks');
        }}
      />
      <BottomNav />
      <main className="md:ml-60 pb-16 md:pb-0 min-h-screen">
        {renderContent()}
      </main>
      <SyncSubscriber />
    </>
  );
}
