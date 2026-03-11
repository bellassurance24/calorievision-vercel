import { WifiOff, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

const Offline = () => {
  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="text-center max-w-md mx-auto">
        <div className="w-24 h-24 mx-auto mb-8 rounded-full bg-muted flex items-center justify-center">
          <WifiOff className="w-12 h-12 text-muted-foreground" />
        </div>
        
        <h1 className="text-3xl font-bold text-foreground mb-4">
          You're Offline
        </h1>
        
        <p className="text-muted-foreground mb-8 text-lg">
          It looks like you've lost your internet connection. Please check your network settings and try again.
        </p>
        
        <Button 
          onClick={handleRetry}
          size="lg"
          className="gap-2"
        >
          <RefreshCw className="w-5 h-5" />
          Try Again
        </Button>
        
        <div className="mt-12 p-6 bg-muted/50 rounded-xl">
          <h2 className="font-semibold text-foreground mb-3">
            Tips to reconnect:
          </h2>
          <ul className="text-sm text-muted-foreground space-y-2 text-left">
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              Check if Wi-Fi or mobile data is enabled
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              Move closer to your router
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              Try turning airplane mode on and off
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              Restart your device
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Offline;
