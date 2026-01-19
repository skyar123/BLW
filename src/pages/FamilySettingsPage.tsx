import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Input } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { useFamily } from '../hooks/useFamily';

export function FamilySettingsPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { family, inviteMember, updateFamilyName } = useFamily();

  const [inviteEmail, setInviteEmail] = useState('');
  const [inviting, setInviting] = useState(false);
  const [inviteSuccess, setInviteSuccess] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);

  const [editingName, setEditingName] = useState(false);
  const [newFamilyName, setNewFamilyName] = useState(family?.name || '');

  const handleInvite = async () => {
    if (!inviteEmail.trim()) return;

    try {
      setInviting(true);
      setInviteError(null);
      setInviteSuccess(false);

      await inviteMember(inviteEmail);
      setInviteSuccess(true);
      setInviteEmail('');
    } catch (err) {
      setInviteError(err instanceof Error ? err.message : 'Failed to invite member');
    } finally {
      setInviting(false);
    }
  };

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
    <div className="min-h-screen bg-cream">
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
              <div className="w-12 h-12 rounded-full bg-sage-200 flex items-center justify-center">
                <span className="text-xl">👤</span>
              </div>
            )}
            <div className="flex-1">
              <p className="font-semibold text-charcoal">{user?.displayName}</p>
              <p className="text-sm text-gray-500">{user?.email}</p>
            </div>
          </div>
        </Card>

        {/* Family Name */}
        <Card padding="md">
          <h3 className="font-semibold text-charcoal mb-3">Family Name</h3>
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
              <span className="text-charcoal">{family?.name}</span>
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
          <h3 className="font-semibold text-charcoal mb-3">Family Members</h3>
          <div className="space-y-2 mb-4">
            {family?.members.map((email) => (
              <div
                key={email}
                className="flex items-center gap-3 py-2 px-3 bg-sage-50 rounded-lg"
              >
                <span className="text-lg">👤</span>
                <span className="text-sm text-charcoal">{email}</span>
                {email === user?.email && (
                  <span className="text-xs bg-sage-200 text-sage-700 px-2 py-0.5 rounded-full ml-auto">
                    You
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Invite Form */}
          <div className="border-t border-gray-100 pt-4">
            <h4 className="font-medium text-charcoal mb-2">Invite Family Member</h4>
            <p className="text-sm text-gray-500 mb-3">
              Enter their Gmail address to give them access to your family's data.
            </p>

            {inviteSuccess && (
              <div className="mb-3 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
                Invitation sent! They can now sign in to see your family's data.
              </div>
            )}

            {inviteError && (
              <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {inviteError}
              </div>
            )}

            <div className="flex gap-2">
              <Input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="partner@gmail.com"
                className="flex-1"
              />
              <Button onClick={handleInvite} disabled={inviting || !inviteEmail.trim()}>
                {inviting ? 'Inviting...' : 'Invite'}
              </Button>
            </div>
          </div>
        </Card>

        {/* Logout */}
        <Card padding="md">
          <Button
            variant="ghost"
            className="w-full text-red-600 hover:bg-red-50"
            onClick={handleLogout}
          >
            Sign Out
          </Button>
        </Card>
      </main>
    </div>
  );
}
