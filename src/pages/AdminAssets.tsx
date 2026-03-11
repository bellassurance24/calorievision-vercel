import { useEffect, useState, useRef } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import AdminLayout from "@/components/layout/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Upload, Image, FileImage, Globe, Check, Loader2, Trash2 } from "lucide-react";

export default function AdminAssets() {
  const { user, isAdmin, isLoading: authLoading } = useAuth();
  const [uploading, setUploading] = useState<string | null>(null);
  const [faviconUrl, setFaviconUrl] = useState<string | null>(null);
  const [ogImageUrl, setOgImageUrl] = useState<string | null>(null);
  
  const faviconInputRef = useRef<HTMLInputElement>(null);
  const ogImageInputRef = useRef<HTMLInputElement>(null);

  // Fetch current assets on mount
  useEffect(() => {
    fetchCurrentAssets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchCurrentAssets() {
    try {
      // Check for existing favicon
      const { data: faviconData } = await supabase.storage
        .from('site-assets')
        .createSignedUrl('favicon.png', 60);
      if (faviconData?.signedUrl) {
        setFaviconUrl(faviconData.signedUrl);
      }

      // Check for existing OG image
      const { data: ogData } = await supabase.storage
        .from('site-assets')
        .createSignedUrl('og-image.png', 60);
      if (ogData?.signedUrl) {
        setOgImageUrl(ogData.signedUrl);
      }
    } catch (error) {
      console.error('Error fetching assets:', error);
    }
  }

  async function handleFaviconUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 1MB for favicon)
    if (file.size > 1024 * 1024) {
      toast.error('Favicon must be less than 1MB');
      return;
    }

    setUploading('favicon');
    try {
      // Generate unique filename with timestamp for cache-busting
      const timestamp = Date.now();
      const fileName = `favicon.png`;
      
      // Delete existing favicon if any
      await supabase.storage
        .from('site-assets')
        .remove([fileName]);

      // Upload new favicon
      const { error: uploadError } = await supabase.storage
        .from('site-assets')
        .upload(fileName, file, {
          cacheControl: '0',
          upsert: true,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('site-assets')
        .getPublicUrl(fileName);

      // Add cache-busting query param
      const cacheBustedUrl = `${urlData.publicUrl}?v=${timestamp}`;
      setFaviconUrl(cacheBustedUrl);

      // Update the settings table with new favicon version
      await supabase
        .from('settings')
        .upsert([
          {
            key: 'favicon_version',
            value: timestamp.toString(),
            description: 'Cache-busting version for favicon',
          },
          {
            key: 'favicon_deleted',
            value: 'false',
            description: 'Whether favicon is deleted',
          },
        ], { onConflict: 'key' });

      toast.success('Favicon uploaded successfully!');
    } catch (error) {
      console.error('Error uploading favicon:', error);
      toast.error('Failed to upload favicon');
    } finally {
      setUploading(null);
    }
  }

  async function handleFaviconDelete() {
    if (!faviconUrl) return;

    setUploading('favicon-delete');
    try {
      const timestamp = Date.now();
      const fileName = 'favicon.png';

      await supabase.storage.from('site-assets').remove([fileName]);

      await supabase
        .from('settings')
        .upsert([
          {
            key: 'favicon_version',
            value: timestamp.toString(),
            description: 'Cache-busting version for favicon',
          },
          {
            key: 'favicon_deleted',
            value: 'true',
            description: 'Whether favicon is deleted',
          },
        ], { onConflict: 'key' });

      setFaviconUrl(null);
      toast.success('Favicon deleted. Site will use the default favicon.');
    } catch (error) {
      console.error('Error deleting favicon:', error);
      toast.error('Failed to delete favicon');
    } finally {
      setUploading(null);
    }
  }

  async function handleOgImageUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 5MB for OG image)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('OG image must be less than 5MB');
      return;
    }

    setUploading('og-image');
    try {
      const timestamp = Date.now();
      const fileName = `og-image.png`;
      
      // Delete existing OG image if any
      await supabase.storage
        .from('site-assets')
        .remove([fileName]);

      // Upload new OG image
      const { error: uploadError } = await supabase.storage
        .from('site-assets')
        .upload(fileName, file, {
          cacheControl: '0',
          upsert: true,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('site-assets')
        .getPublicUrl(fileName);

      const cacheBustedUrl = `${urlData.publicUrl}?v=${timestamp}`;
      setOgImageUrl(cacheBustedUrl);

      // Update settings
      await supabase
        .from('settings')
        .upsert({
          key: 'og_image_version',
          value: timestamp.toString(),
          description: 'Cache-busting version for OG image'
        }, { onConflict: 'key' });

      toast.success('OG image uploaded successfully!');
    } catch (error) {
      console.error('Error uploading OG image:', error);
      toast.error('Failed to upload OG image');
    } finally {
      setUploading(null);
    }
  }

  // Auth guards
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/en" replace />;
  }

  return (
    <AdminLayout forceDark>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Site Assets</h1>
          <p className="text-muted-foreground mt-1">
            Manage favicon, OG image, and PWA manifest settings
          </p>
        </div>

        <Tabs defaultValue="favicon" className="space-y-6">
          <TabsList>
            <TabsTrigger value="favicon" className="gap-2">
              <Image className="h-4 w-4" />
              Favicon
            </TabsTrigger>
            <TabsTrigger value="og-image" className="gap-2">
              <FileImage className="h-4 w-4" />
              OG Image
            </TabsTrigger>
            <TabsTrigger value="manifest" className="gap-2">
              <Globe className="h-4 w-4" />
              Manifest
            </TabsTrigger>
          </TabsList>

          {/* Favicon Tab */}
          <TabsContent value="favicon">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Image className="h-5 w-5" />
                  Favicon
                </CardTitle>
                <CardDescription>
                  Upload your site favicon. Recommended size: 512x512px PNG with transparent background.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-start gap-6">
                  {/* Preview */}
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-24 h-24 rounded-lg border-2 border-dashed border-border flex items-center justify-center bg-muted overflow-hidden">
                      {faviconUrl ? (
                        <img 
                          src={faviconUrl} 
                          alt="Current favicon" 
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <Image className="h-8 w-8 text-muted-foreground" />
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">Current Favicon</span>
                  </div>

                  {/* Upload */}
                  <div className="flex-1 space-y-4">
                    <div>
                      <Label htmlFor="favicon-upload">Upload New Favicon</Label>
                      <div className="mt-2 flex gap-2">
                        <Input
                          ref={faviconInputRef}
                          id="favicon-upload"
                          type="file"
                          accept="image/png,image/x-icon,image/svg+xml"
                          onChange={handleFaviconUpload}
                          className="hidden"
                        />
                        <Button
                          onClick={() => faviconInputRef.current?.click()}
                          disabled={uploading !== null}
                          className="gap-2"
                        >
                          {uploading === 'favicon' ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Uploading...
                            </>
                          ) : (
                            <>
                              <Upload className="h-4 w-4" />
                              Choose File
                            </>
                          )}
                        </Button>

                        <Button
                          type="button"
                          variant="destructive"
                          onClick={handleFaviconDelete}
                          disabled={uploading !== null || !faviconUrl}
                          className="gap-2"
                        >
                          {uploading === 'favicon-delete' ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Deleting...
                            </>
                          ) : (
                            <>
                              <Trash2 className="h-4 w-4" />
                              Delete
                            </>
                          )}
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        PNG, ICO, or SVG. Max 1MB.
                      </p>
                    </div>

                    <div className="p-4 bg-muted rounded-lg">
                      <h4 className="font-medium text-sm mb-2">Cache-Busting</h4>
                      <p className="text-xs text-muted-foreground">
                        When you upload a new favicon, a version parameter is automatically added to force browsers to refresh the cached version.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* OG Image Tab */}
          <TabsContent value="og-image">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileImage className="h-5 w-5" />
                  Open Graph Image
                </CardTitle>
                <CardDescription>
                  This image appears when your site is shared on social media. Recommended size: 1200x630px.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-start gap-6">
                  {/* Preview */}
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-48 h-24 rounded-lg border-2 border-dashed border-border flex items-center justify-center bg-muted overflow-hidden">
                      {ogImageUrl ? (
                        <img 
                          src={ogImageUrl} 
                          alt="Current OG image" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <FileImage className="h-8 w-8 text-muted-foreground" />
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">Current OG Image</span>
                  </div>

                  {/* Upload */}
                  <div className="flex-1 space-y-4">
                    <div>
                      <Label htmlFor="og-upload">Upload New OG Image</Label>
                      <div className="mt-2 flex gap-2">
                        <Input
                          ref={ogImageInputRef}
                          id="og-upload"
                          type="file"
                          accept="image/png,image/jpeg,image/webp"
                          onChange={handleOgImageUpload}
                          className="hidden"
                        />
                        <Button
                          onClick={() => ogImageInputRef.current?.click()}
                          disabled={uploading === 'og-image'}
                          className="gap-2"
                        >
                          {uploading === 'og-image' ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Uploading...
                            </>
                          ) : (
                            <>
                              <Upload className="h-4 w-4" />
                              Choose File
                            </>
                          )}
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        PNG, JPEG, or WebP. Max 5MB. Recommended: 1200x630px.
                      </p>
                    </div>

                    <div className="p-4 bg-muted rounded-lg">
                      <h4 className="font-medium text-sm mb-2">Social Media Preview</h4>
                      <p className="text-xs text-muted-foreground">
                        This image will be displayed when your site is shared on Facebook, Twitter, LinkedIn, and other platforms.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Manifest Tab */}
          <TabsContent value="manifest">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  PWA Manifest
                </CardTitle>
                <CardDescription>
                  Configure your Progressive Web App settings. These values are defined in manifest.json.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>App Name</Label>
                    <Input value="Calorie Vision" disabled />
                    <p className="text-xs text-muted-foreground">
                      Full name displayed in app stores and install prompts.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>Short Name</Label>
                    <Input value="CalorieVision" disabled />
                    <p className="text-xs text-muted-foreground">
                      Shown on home screen when space is limited.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>Theme Color</Label>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded border" style={{ backgroundColor: '#16a34a' }} />
                      <Input value="#16a34a" disabled />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Browser toolbar and status bar color.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>Background Color</Label>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded border" style={{ backgroundColor: '#ffffff' }} />
                      <Input value="#ffffff" disabled />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Splash screen background color.
                    </p>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label>Description</Label>
                    <Input value="AI-powered calorie tracking from food photos" disabled />
                  </div>
                </div>

                <div className="p-4 bg-muted rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <h4 className="font-medium text-sm">PWA Icons</h4>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    PWA icons (192x192 and 512x512) are configured in the manifest and stored in /public/icons/. 
                    They use the unified branding design with crossed utensils on green background.
                  </p>
                </div>

                <div className="p-4 border border-border rounded-lg">
                  <h4 className="font-medium text-sm mb-2">To Modify Manifest Settings</h4>
                  <p className="text-xs text-muted-foreground">
                    The manifest.json file is located at <code className="bg-muted px-1 rounded">/public/manifest.json</code>. 
                    For changes beyond assets, edit this file directly or contact the development team.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
