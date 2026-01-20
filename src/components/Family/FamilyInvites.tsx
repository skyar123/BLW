import { useState } from 'react';
import { Button, Card } from '../ui';
import { useFamilyInvites, type FamilyInvite } from '../../hooks/useFamilyInvites';

export function FamilyInvites() {
  const { pendingInvites, loading, sendInvite, resendInvite, cancelInvite } = useFamilyInvites();
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [resendingId, setResendingId] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setSending(true);
    setMessage(null);

    const result = await sendInvite(email.trim());
    setMessage({
      type: result.success ? 'success' : 'error',
      text: result.message,
    });

    if (result.success) {
      setEmail('');
    }
    setSending(false);
  };

  const handleResend = async (inviteId: string) => {
    setResendingId(inviteId);
    const result = await resendInvite(inviteId);
    setMessage({
      type: result.success ? 'success' : 'error',
      text: result.message,
    });
    setResendingId(null);
  };

  const handleCancel = async (inviteId: string) => {
    if (confirm('Cancel this invitation?')) {
      const success = await cancelInvite(inviteId);
      if (success) {
        setMessage({ type: 'success', text: 'Invitation cancelled' });
      }
    }
  };

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const isExpired = (expiresAt: string) => {
    return new Date(expiresAt) < new Date();
  };

  if (loading) {
    return (
      <Card padding="md">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
      </Card>
    );
  }

  return (
    <Card padding="md" className="space-y-4">
      <div>
        <h3 className="font-semibold text-charcoal dark:text-white flex items-center gap-2">
          <span>👨‍👩‍👧‍👦</span>
          Family Sharing
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Invite family members to view and log foods together
        </p>
      </div>

      {/* Message */}
      {message && (
        <div
          className={`p-3 rounded-lg text-sm ${
            message.type === 'success'
              ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800'
              : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Invite Form */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="partner@email.com"
          required
          className="flex-1 px-4 py-2.5 rounded-xl border border-sage-200 dark:border-gray-600
                   bg-white dark:bg-gray-700 text-charcoal dark:text-white
                   placeholder:text-gray-400 dark:placeholder:text-gray-500
                   focus:outline-none focus:ring-2 focus:ring-sage-400 focus:border-sage-400
                   transition-colors text-sm"
        />
        <Button type="submit" disabled={sending || !email.trim()} size="md">
          {sending ? '...' : 'Invite'}
        </Button>
      </form>

      {/* Pending Invites */}
      {pendingInvites.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Pending Invitations
          </h4>
          {pendingInvites.map((invite) => (
            <InviteRow
              key={invite.id}
              invite={invite}
              onResend={() => handleResend(invite.id)}
              onCancel={() => handleCancel(invite.id)}
              isResending={resendingId === invite.id}
              formatDate={formatDate}
              isExpired={isExpired(invite.expiresAt)}
            />
          ))}
        </div>
      )}

      {/* Info */}
      <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1 pt-2 border-t border-gray-100 dark:border-gray-700">
        <p>• Invitations expire after 7 days</p>
        <p>• Share the invite code with your family member</p>
        <p>• They'll need to sign in with Google and enter the code</p>
      </div>
    </Card>
  );
}

interface InviteRowProps {
  invite: FamilyInvite;
  onResend: () => void;
  onCancel: () => void;
  isResending: boolean;
  formatDate: (date: string) => string;
  isExpired: boolean;
}

function InviteRow({ invite, onResend, onCancel, isResending, formatDate, isExpired }: InviteRowProps) {
  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-charcoal dark:text-white truncate">
          {invite.email}
        </p>
        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
          <span>Code: <code className="bg-sage-100 dark:bg-sage-900 px-1 rounded">{invite.code}</code></span>
          <span>•</span>
          <span>Sent {formatDate(invite.sentAt)}</span>
          {invite.resentCount > 0 && (
            <>
              <span>•</span>
              <span>Resent {invite.resentCount}x</span>
            </>
          )}
        </div>
        {isExpired && (
          <p className="text-xs text-coral-500 mt-1">Expired - resend to refresh</p>
        )}
      </div>
      <div className="flex items-center gap-2 ml-2">
        <button
          onClick={onResend}
          disabled={isResending}
          className="px-3 py-1.5 text-xs font-medium text-sage-600 dark:text-sage-400
                   hover:bg-sage-100 dark:hover:bg-sage-900/50 rounded-lg transition-colors"
        >
          {isResending ? '...' : 'Resend'}
        </button>
        <button
          onClick={onCancel}
          className="px-3 py-1.5 text-xs font-medium text-red-600 dark:text-red-400
                   hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
