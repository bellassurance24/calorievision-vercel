import { usePageMetadata } from "@/hooks/usePageMetadata";
import { usePageTranslation } from "@/hooks/usePageTranslation";
import { useState, useEffect, useRef } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Smartphone, Apple, Monitor } from "lucide-react";

const Install = () => {
  usePageMetadata({
    title: "Install CalorieVision - Add to Your Home Screen",
    description: "Learn how to install CalorieVision as an app on your iPhone, Android, or desktop for quick access to AI-powered meal analysis."
  });

  const { translateHtml, isTranslating, currentLanguage } = usePageTranslation('install-page');
  const [translatedHtml, setTranslatedHtml] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const originalContent = `
    <h1 class="text-4xl font-bold text-center mb-4 text-foreground">Install CalorieVision</h1>
    <p class="text-xl text-center text-muted-foreground mb-8">
      <strong>Add CalorieVision to your home screen for instant access — no app store needed!</strong>
    </p>

    <hr class="my-8 border-border" />

    <div class="grid md:grid-cols-2 gap-8 mb-8">
      <div class="bg-card border border-border rounded-xl p-6">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
            <svg class="w-6 h-6 text-primary" fill="currentColor" viewBox="0 0 24 24"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
          </div>
          <h2 class="text-2xl font-semibold text-foreground">iPhone / iPad</h2>
        </div>
        <ol class="list-decimal pl-6 text-muted-foreground space-y-3">
          <li>Open <strong>Safari</strong> and go to <a href="https://calorievision.online" class="text-primary hover:underline">calorievision.online</a></li>
          <li>Tap the <strong>Share button</strong> (square with arrow) at the bottom of the screen</li>
          <li>Scroll down and tap <strong>"Add to Home Screen"</strong></li>
          <li>Tap <strong>"Add"</strong> in the top right corner</li>
          <li>CalorieVision will now appear on your home screen!</li>
        </ol>
        <div class="mt-4 p-4 bg-muted rounded-lg">
          <p class="text-sm text-muted-foreground">
            <strong>💡 Tip:</strong> You must use Safari. Chrome and other browsers on iOS don't support home screen installation.
          </p>
        </div>
      </div>

      <div class="bg-card border border-border rounded-xl p-6">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
            <svg class="w-6 h-6 text-primary" fill="currentColor" viewBox="0 0 24 24"><path d="M17.523 15.341l-.001-.001c-.17-.179-.4-.267-.622-.255-.13.007-.262.04-.376.12l-.009.007-3.187 2.262V6.632l3.187 2.262.009.007c.114.08.246.113.376.12.222.012.451-.076.622-.255l.001-.001c.196-.207.306-.491.306-.772a1.09 1.09 0 0 0-.306-.772l-.001-.001-4.49-4.71a1.05 1.05 0 0 0-.337-.248.87.87 0 0 0-.39-.083.87.87 0 0 0-.39.083 1.05 1.05 0 0 0-.337.248l-4.49 4.71-.001.001a1.09 1.09 0 0 0-.306.772c0 .281.11.565.306.772l.001.001c.17.179.4.267.622.255.13-.007.262-.04.376-.12l.009-.007 3.187-2.262v10.842l-3.187-2.262-.009-.007a.828.828 0 0 0-.376-.12c-.222-.012-.451.076-.622.255l-.001.001a1.09 1.09 0 0 0-.306.772c0 .281.11.565.306.772l.001.001 4.49 4.71c.085.111.2.19.337.248a.87.87 0 0 0 .39.083.87.87 0 0 0 .39-.083 1.05 1.05 0 0 0 .337-.248l4.49-4.71.001-.001a1.09 1.09 0 0 0 .306-.772 1.09 1.09 0 0 0-.306-.772z"/></svg>
          </div>
          <h2 class="text-2xl font-semibold text-foreground">Android</h2>
        </div>
        <ol class="list-decimal pl-6 text-muted-foreground space-y-3">
          <li>Open <strong>Chrome</strong> and go to <a href="https://calorievision.online" class="text-primary hover:underline">calorievision.online</a></li>
          <li>Tap the <strong>three-dot menu</strong> (⋮) in the top right</li>
          <li>Tap <strong>"Add to Home screen"</strong> or <strong>"Install app"</strong></li>
          <li>Confirm by tapping <strong>"Add"</strong> or <strong>"Install"</strong></li>
          <li>CalorieVision will now appear on your home screen!</li>
        </ol>
        <div class="mt-4 p-4 bg-muted rounded-lg">
          <p class="text-sm text-muted-foreground">
            <strong>💡 Tip:</strong> If you see "Install app" instead of "Add to Home screen", you'll get the full app experience with notifications.
          </p>
        </div>
      </div>
    </div>

    <div class="bg-card border border-border rounded-xl p-6 mb-8">
      <div class="flex items-center gap-3 mb-4">
        <div class="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
          <svg class="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
        </div>
        <h2 class="text-2xl font-semibold text-foreground">Desktop (Chrome, Edge)</h2>
      </div>
      <ol class="list-decimal pl-6 text-muted-foreground space-y-3">
        <li>Open <strong>Chrome or Edge</strong> and go to <a href="https://calorievision.online" class="text-primary hover:underline">calorievision.online</a></li>
        <li>Look for the <strong>install icon</strong> (⊕) in the address bar, or click the menu</li>
        <li>Click <strong>"Install CalorieVision"</strong></li>
        <li>The app will open in its own window and be added to your apps!</li>
      </ol>
    </div>

    <hr class="my-8 border-border" />

    <h2 class="text-2xl font-semibold mt-10 mb-4 text-foreground">Why Install CalorieVision?</h2>
    <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <div class="bg-muted rounded-lg p-4">
        <h3 class="font-semibold text-foreground mb-2">⚡ Instant Access</h3>
        <p class="text-sm text-muted-foreground">Launch CalorieVision with one tap from your home screen — no need to open a browser.</p>
      </div>
      <div class="bg-muted rounded-lg p-4">
        <h3 class="font-semibold text-foreground mb-2">📱 Full Screen</h3>
        <p class="text-sm text-muted-foreground">Enjoy a clean, app-like experience without browser tabs or address bars.</p>
      </div>
      <div class="bg-muted rounded-lg p-4">
        <h3 class="font-semibold text-foreground mb-2">🔔 Notifications</h3>
        <p class="text-sm text-muted-foreground">Receive meal reminders and tips directly on your device (optional).</p>
      </div>
      <div class="bg-muted rounded-lg p-4">
        <h3 class="font-semibold text-foreground mb-2">💾 No Storage</h3>
        <p class="text-sm text-muted-foreground">Unlike app store apps, this takes almost no space on your device.</p>
      </div>
      <div class="bg-muted rounded-lg p-4">
        <h3 class="font-semibold text-foreground mb-2">🔄 Always Updated</h3>
        <p class="text-sm text-muted-foreground">You always get the latest version automatically — no manual updates needed.</p>
      </div>
      <div class="bg-muted rounded-lg p-4">
        <h3 class="font-semibold text-foreground mb-2">🌐 Works Offline</h3>
        <p class="text-sm text-muted-foreground">Basic features work even with poor connectivity.</p>
      </div>
    </div>

    <hr class="my-8 border-border" />

    <h2 class="text-2xl font-semibold mt-10 mb-4 text-foreground">Troubleshooting</h2>
    
    <h3 class="text-lg font-semibold mt-4 mb-2 text-foreground">I don't see "Add to Home Screen" on iPhone</h3>
    <p class="text-muted-foreground mb-4">
      Make sure you're using <strong>Safari</strong>. Other browsers like Chrome or Firefox on iOS don't support PWA installation. Also scroll down in the share menu — the option is usually lower in the list.
    </p>

    <h3 class="text-lg font-semibold mt-4 mb-2 text-foreground">The app shows the wrong name or icon</h3>
    <p class="text-muted-foreground mb-4">
      If you installed an older version, uninstall the app from your home screen, clear your browser cache, and reinstall fresh from calorievision.online.
    </p>

    <h3 class="text-lg font-semibold mt-4 mb-2 text-foreground">I can't find the install option on Android</h3>
    <p class="text-muted-foreground mb-4">
      Some Android browsers have different menu names. Look for "Install app", "Add to Home screen", or "Add shortcut". Chrome and Samsung Internet have the best support.
    </p>

    <hr class="my-8 border-border" />

    <div class="text-center py-8">
      <p class="text-lg text-muted-foreground mb-4">
        Ready to get started? Visit <a href="https://calorievision.online" class="text-primary hover:underline font-semibold">calorievision.online</a> on your device and follow the steps above!
      </p>
    </div>
  `;

  useEffect(() => {
    const performTranslation = async () => {
      if (currentLanguage === 'en') {
        setTranslatedHtml(null);
        return;
      }
      
      setIsLoading(true);
      try {
        const translated = await translateHtml(originalContent);
        setTranslatedHtml(translated);
      } catch (error) {
        console.error('Translation error:', error);
        setTranslatedHtml(null);
      } finally {
        setIsLoading(false);
      }
    };

    performTranslation();
  }, [currentLanguage, translateHtml]);

  const displayContent = translatedHtml || originalContent;
  const showSkeleton = isLoading || isTranslating;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {showSkeleton ? (
        <div className="space-y-4">
          <Skeleton className="h-12 w-3/4 mx-auto" />
          <Skeleton className="h-6 w-1/2 mx-auto" />
          <Skeleton className="h-px w-full my-8" />
          <div className="grid md:grid-cols-2 gap-8">
            <Skeleton className="h-80 w-full rounded-xl" />
            <Skeleton className="h-80 w-full rounded-xl" />
          </div>
          <Skeleton className="h-48 w-full rounded-xl" />
          <Skeleton className="h-px w-full my-8" />
          <Skeleton className="h-8 w-1/3" />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-24 w-full rounded-lg" />
            ))}
          </div>
        </div>
      ) : (
        <div 
          ref={contentRef}
          className="prose prose-slate dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: displayContent }}
        />
      )}
    </div>
  );
};

export default Install;
