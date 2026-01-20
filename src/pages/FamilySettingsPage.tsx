import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Input } from '../components/ui';
import { FamilyInvites } from '../components/Family';
import { useAuth } from '../context/AuthContext';
import { useFamily } from '../hooks/useFamily';

export function FamilySettingsPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { family, updateFamilyName } = useFamily();

  const [editingName, setEditingName] = useState(false);
  const [newFamilyName, setNewFamilyName] = useState(family?.name || '');

  const handleUpdateName = async () => {
    if (!newFamilyName.trim()) return;

    try {
      await updateFamilyName(newFamilyName);
      setEditingName(false);
    } catch (err) {
      console.error('Failed to update family name:', err);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-cream dark:bg-gray-900">
      {/* Header */}
      <header className="bg-sage-400 text-white">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/')}
              className="p-2 -ml-2 hover:bg-sage-500 rounded-full transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="text-xl font-bold">Family Settings</h1>
              <p className="text-sage-100 text-sm">Manage your family account</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* Current User */}
        <Card padding="md">
          <div className="flex items-center gap-4">
            {user?.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName || 'User'}
                className="w-12 h-12 rounded-full"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-sage-200 dark:bg-gray-700 flex items-center justify-center">
                <span className="text-xl">👤</span>
              </div>
            )}
            <div className="flex-1">
              <p className="font-semibold text-charcoal dark:text-white">{user?.displayName}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
            </div>
          </div>
        </Card>

        {/* Family Name */}
        <Card padding="md">
          <h3 className="font-semibold text-charcoal dark:text-white mb-3">Family Name</h3>
          {editingName ? (
            <div className="flex gap-2">
              <Input
                value={newFamilyName}
                onChange={(e) => setNewFamilyName(e.target.value)}
                placeholder="Family name"
                className="flex-1"
              />
              <Button onClick={handleUpdateName} size="sm">Save</Button>
              <Button variant="ghost" size="sm" onClick={() => setEditingName(false)}>
                Cancel
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <span className="text-charcoal dark:text-white">{family?.name}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setNewFamilyName(family?.name || '');
                  setEditingName(true);
                }}
              >
                Edit
              </Button>
            </div>
          )}
        </Card>

        {/* Family Members */}
        <Card padding="md">
          <h3 className="font-semibold text-charcoal dark:text-white mb-3">Family Members</h3>
          <div className="space-y-2">
            {family?.members.map((email) => (
              <div
                key={email}
                className="flex items-center gap-3 py-2 px-3 bg-sage-50 dark:bg-gray-700/50 rounded-lg"
              >
                <span className="text-lg">👤</span>
                <span className="text-sm text-charcoal dark:text-gray-200">{email}</span>
                {email === user?.email && (
                  <span className="text-xs bg-sage-200 dark:bg-sage-800 text-sage-700 dark:text-sage-300 px-2 py-0.5 rounded-full ml-auto">
                    You
                  </span>
                )}
              </div>
            ))}
          </div>
        </Card>

        {/* Family Invites - New Component */}
        <FamilyInvites />

        {/* Logout */}
        <Card padding="md">
          <Button
            variant="ghost"
            className="w-full text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
            onClick={handleLogout}
          >
            Sign Out
          </Button>
        </Card>
      </main>
    </div>
  );
}
