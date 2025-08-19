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
    <div className="min-h-screen bg-[rgb(var(--bg))] flex items-center justify-center p-4">
      <Card className="w-96 h-48 shadow-lg bg-card text-card-foreground border-border">
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-2xl text-card-foreground">
            Sign In
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Sign in to your account using Shapes.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-4">
          <div className="space-y-3">
            <Button
              onClick={redirectToShapesAuth}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-3 border border-primary"
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
                  className="bg-input text-foreground placeholder-muted-foreground border-border focus-visible:ring-1 focus-visible:ring-ring"
                />
              </div>
              <Button
                onClick={exchangeCodeForToken}
                disabled={shapesLoading || !oneTimeCode.trim()}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 border border-primary"
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