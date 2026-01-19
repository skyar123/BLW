import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Button, Card } from '../components/ui';

export function LoginPage() {
  const { signIn } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = async () => {
    try {
      setLoading(true);
      setError(null);
      await signIn();
    } catch (err) {
      setError('Failed to sign in. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center p-4">
      <Card padding="lg" className="max-w-md w-full text-center">
        {/* Logo & Branding */}
        <div className="mb-8">
          <div className="text-6xl mb-4">🥑</div>
          <h1 className="text-3xl font-bold text-charcoal mb-2">First Bites</h1>
          <p className="text-gray-600">
            Your family's baby-led weaning journal
          </p>
        </div>

        {/* Features */}
        <div className="mb-8 text-left space-y-3">
          <div className="flex items-center gap-3">
            <span className="text-xl">👨‍👩‍👧‍👦</span>
            <span className="text-sm text-gray-600">
              Share with your partner - sync across devices
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xl">📱</span>
            <span className="text-sm text-gray-600">
              Log foods on any device, see updates instantly
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xl">🥜</span>
            <span className="text-sm text-gray-600">
              Track allergen introductions & maintenance
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xl">👶👶</span>
            <span className="text-sm text-gray-600">
              Perfect for twins - track each baby's journey
            </span>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Sign In Button */}
        <Button
          onClick={handleSignIn}
          size="lg"
          className="w-full flex items-center justify-center gap-3"
          disabled={loading}
        >
          {loading ? (
            <span>Signing in...</span>
          ) : (
            <>
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </>
          )}
        </Button>

        {/* Privacy Note */}
        <p className="mt-6 text-xs text-gray-400">
          By signing in, you agree to our Terms of Service and Privacy Policy.
          Your data is stored securely and only shared with family members you invite.
        </p>
      </Card>
    </div>
  );
}
