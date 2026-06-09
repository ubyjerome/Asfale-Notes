import { useNavigate } from 'react-router-dom';
import { MenuHome } from '../components/menu/MenuHome';
import { useNotes } from '../hooks/useNotes';
import { useAuthStore } from '../store/authStore';

export function MenuPage() {
  const navigate = useNavigate();
  const { restoreNote, permanentlyDeleteNote } = useNotes();
  const logout = useAuthStore((s) => s.logout);

  const handleClearAllData = async () => {
    const db = (await import('../db/db')).db;
    await db.delete();
    await db.open();
    window.location.reload();
  };

  const handleLogout = async () => {
    const db = (await import('../db/db')).db;
    await db.notes.clear();
    await db.prefs.clear();
    await db.syncMeta.clear();
    sessionStorage.clear();
    logout();
    navigate('/onboarding');
  };

  return (
    <div className="fade-in">
      <h1 className="text-lg font-medium text-[var(--color-ink)] px-4 py-3 lg:text-xl">Menu</h1>
      <MenuHome
        onClearAllData={handleClearAllData}
        onLogout={handleLogout}
        onRestoreNote={restoreNote}
        onPermanentDelete={permanentlyDeleteNote}
        onArchiveSelect={(id) => navigate(`/note/${id}`)}
      />
    </div>
  );
}
