import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { LanguageProvider, SUPPORTED_LANGUAGES } from "@/contexts/LanguageContext";
import { BrandingProvider } from "@/contexts/BrandingContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import LanguageRedirect from "@/components/LanguageRedirect";
import HreflangTags from "@/components/HreflangTags";
import AnalyticsTracker from "@/components/AnalyticsTracker";

import AdminRoute from "./components/AdminRoute";
import { ErrorBoundary } from "./components/ErrorBoundary";
// Critical pages - loaded immediately
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Analyze from "./pages/Analyze";

// Lazy loaded pages for better initial bundle size
const HowItWorks = lazy(() => import("./pages/HowItWorks"));
const Faq = lazy(() => import("./pages/Faq"));
const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const Terms = lazy(() => import("./pages/Terms"));
const Disclaimer = lazy(() => import("./pages/Disclaimer"));
const CookiePolicy = lazy(() => import("./pages/CookiePolicy"));
const BrandingSettings = lazy(() => import("./pages/BrandingSettings"));
const Auth = lazy(() => import("./pages/Auth"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const AdminAnalytics = lazy(() => import("./pages/AdminAnalytics"));
const AdminSettings = lazy(() => import("./pages/AdminSettings"));
const Blog = lazy(() => import("./pages/Blog"));
const BlogPost = lazy(() => import("./pages/BlogPost"));
const BlogCategory = lazy(() => import("./pages/BlogCategory"));
const BlogTag = lazy(() => import("./pages/BlogTag"));
const AdminBlog = lazy(() => import("./pages/AdminBlog"));
const AdminMedia = lazy(() => import("./pages/AdminMedia"));
const AdminAssets = lazy(() => import("./pages/AdminAssets"));
const AdminHomepageEditor = lazy(() => import("./pages/AdminHomepageEditor"));
const AuthCallback = lazy(() => import("./pages/AuthCallback"));
const ChangePassword = lazy(() => import("./pages/ChangePassword"));
const NotificationSettings = lazy(() => import("./pages/NotificationSettings"));
const Install = lazy(() => import("./pages/Install"));
const Pricing = lazy(() => import("./pages/Pricing"));

const queryClient = new QueryClient();

const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[50vh]">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
);

const LazyPage = ({ children }: { children: React.ReactNode }) => (
  <ErrorBoundary>
    <Suspense fallback={<PageLoader />}>
      {children}
    </Suspense>
  </ErrorBoundary>
);

// Public localized routes — none of these require authentication
const LocalizedRoutes = () => (
  <>
    {SUPPORTED_LANGUAGES.map((lang) => (
      <Route key={lang} path={`/${lang}`}>
        <Route index element={<MainLayout><ErrorBoundary><Index /></ErrorBoundary></MainLayout>} />
        <Route path="analyze" element={<MainLayout><ErrorBoundary><Analyze /></ErrorBoundary></MainLayout>} />
        <Route path="how-it-works" element={<MainLayout><LazyPage><HowItWorks /></LazyPage></MainLayout>} />
        <Route path="faq" element={<MainLayout><LazyPage><Faq /></LazyPage></MainLayout>} />
        <Route path="about" element={<MainLayout><LazyPage><About /></LazyPage></MainLayout>} />
        <Route path="contact" element={<MainLayout><LazyPage><Contact /></LazyPage></MainLayout>} />
        <Route path="install" element={<MainLayout><LazyPage><Install /></LazyPage></MainLayout>} />
        {/* Pricing is PUBLIC — no auth guard */}
        <Route path="pricing" element={<MainLayout><LazyPage><Pricing /></LazyPage></MainLayout>} />
        <Route path="privacy-policy" element={<MainLayout><LazyPage><PrivacyPolicy /></LazyPage></MainLayout>} />
        <Route path="terms" element={<MainLayout><LazyPage><Terms /></LazyPage></MainLayout>} />
        <Route path="disclaimer" element={<MainLayout><LazyPage><Disclaimer /></LazyPage></MainLayout>} />
        <Route path="cookie-policy" element={<MainLayout><LazyPage><CookiePolicy /></LazyPage></MainLayout>} />
        <Route path="branding-settings" element={<MainLayout><LazyPage><BrandingSettings /></LazyPage></MainLayout>} />
        <Route path="notification-settings" element={<MainLayout><LazyPage><NotificationSettings /></LazyPage></MainLayout>} />
        <Route path="blog" element={<MainLayout><LazyPage><Blog /></LazyPage></MainLayout>} />
        <Route path="blog/:slug" element={<MainLayout><LazyPage><BlogPost /></LazyPage></MainLayout>} />
        <Route path="blog/category/:categorySlug" element={<MainLayout><LazyPage><BlogCategory /></LazyPage></MainLayout>} />
        <Route path="blog/tag/:tagSlug" element={<MainLayout><LazyPage><BlogTag /></LazyPage></MainLayout>} />
        {/* /:lang/admin* and /:lang/auth redirect to canonical unlocalized paths */}
        <Route path="admin" element={<Navigate to="/admin" replace />} />
        <Route path="admin/*" element={<Navigate to="/admin" replace />} />
        <Route path="auth" element={<Navigate to="/auth" replace />} />
        <Route path="*" element={<MainLayout><NotFound /></MainLayout>} />
      </Route>
    ))}
  </>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <LanguageProvider>
        <BrandingProvider>
          <AuthProvider>
            <NotificationProvider>
              <TooltipProvider>
                <Toaster />
                <Sonner />
                <LanguageRedirect />
                <HreflangTags />
                <AnalyticsTracker />
                <Routes>
                  {/* Public localized routes (pricing and analyze are here, not in AdminRoute) */}
                  {LocalizedRoutes()}

                  {/* Auth pages — no language prefix */}
                  <Route path="/auth" element={<LazyPage><Auth /></LazyPage>} />
                  <Route path="/auth/callback" element={<LazyPage><AuthCallback /></LazyPage>} />

                  {/* Admin routes — ALL protected by AdminRoute layout guard */}
                  <Route element={<AdminRoute />}>
                    <Route path="/admin" element={<LazyPage><AdminDashboard /></LazyPage>} />
                    <Route path="/admin/blog" element={<LazyPage><AdminBlog /></LazyPage>} />
                    <Route path="/admin/media" element={<LazyPage><AdminMedia /></LazyPage>} />
                    <Route path="/admin/assets" element={<LazyPage><AdminAssets /></LazyPage>} />
                    <Route path="/admin/homepage-editor" element={<LazyPage><AdminHomepageEditor /></LazyPage>} />
                    <Route path="/admin/analytics" element={<LazyPage><AdminAnalytics /></LazyPage>} />
                    <Route path="/admin/settings" element={<LazyPage><AdminSettings /></LazyPage>} />
                    <Route path="/admin/change-password" element={<LazyPage><ChangePassword /></LazyPage>} />
                  </Route>

                  {/* Root — handled by LanguageRedirect */}
                  <Route path="/" element={null} />

                  {/* Catch-all 404 */}
                  <Route path="*" element={<MainLayout><NotFound /></MainLayout>} />
                </Routes>
              </TooltipProvider>
            </NotificationProvider>
          </AuthProvider>
        </BrandingProvider>
      </LanguageProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
