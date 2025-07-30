import { useShapesAuth } from '@/hooks/useShapesAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function Auth() {
  const {
    oneTimeCode,
    setOneTimeCode,
    loading: shapesLoading,
    showCodeInput,
    redirectToShapesAuth,
    exchangeCodeForToken,
  } = useShapesAuth();

  return (
    <div className="min-h-screen bg-[var(--color-background)] flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-[var(--color-secondary)] text-[var(--color-text)] border-[var(--color-border)] shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-[var(--color-text)]">
            Sign In
          </CardTitle>
          <CardDescription className="text-[var(--color-placeholder-text)]">
            Sign in to your account using Shapes.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="space-y-3">
            <Button
              onClick={redirectToShapesAuth}
              className="w-full bg-[var(--color-button-bg-primary)] text-[var(--color-button-text-primary)] hover:bg-[var(--color-button-bg-primary)] flex items-center gap-3 border border-[var(--color-border)]"
              disabled={shapesLoading}
            >
              <img
                src="/assets/64386f12-2503-4cf8-b538-54e33bb22e8d.png"
                alt="Shapes"
                className="w-5 h-5"
              />
              Sign in with Shapes
            </Button>
          </div>
          
          {showCodeInput && (
            <div className="space-y-3 pt-4">
              <div>
                <Input
                  type="text"
                  placeholder="Enter one-time code from Shapes"
                  value={oneTimeCode}
                  onChange={(e) => setOneTimeCode(e.target.value)}
                  className="bg-[var(--color-input-bg)] text-[var(--color-input-text)] placeholder-[var(--color-placeholder-text)] border-[var(--color-border)] focus-visible:ring-1 focus-visible:ring-ring"
                />
              </div>
              <Button
                onClick={exchangeCodeForToken}
                disabled={shapesLoading || !oneTimeCode.trim()}
                className="w-full bg-[var(--color-button-bg-primary)] text-[var(--color-button-text-primary)] hover:bg-[var(--color-button-bg-primary)] border border-[var(--color-border)]"
              >
                {shapesLoading ? 'Verifying...' : 'Verify & Sign In'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}