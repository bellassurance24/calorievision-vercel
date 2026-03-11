import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ProcessImageRequest {
  action: "compress" | "resize" | "convert" | "get-dimensions";
  storagePath?: string;
  imageData?: string; // Base64 image data for new uploads
  options?: {
    quality?: number; // 0-100 for compression
    maxWidth?: number;
    maxHeight?: number;
    format?: "webp" | "jpeg" | "png";
    maintainAspectRatio?: boolean;
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Verify user is admin
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check admin role
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);
    const { data: roleData } = await adminClient
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .single();

    if (!roleData) {
      return new Response(
        JSON.stringify({ error: "Admin access required" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body: ProcessImageRequest = await req.json();
    const { action, storagePath, imageData, options = {} } = body;

    console.log(`Processing image action: ${action}, path: ${storagePath}`);

    // For get-dimensions, we need to fetch the image and analyze it
    if (action === "get-dimensions") {
      if (!imageData && !storagePath) {
        return new Response(
          JSON.stringify({ error: "Either imageData or storagePath required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      let base64Data = imageData;
      
      if (storagePath && !imageData) {
        // Download image from storage
        const { data: fileData, error: downloadError } = await adminClient
          .storage
          .from("blog-images")
          .download(storagePath);

        if (downloadError) {
          console.error("Download error:", downloadError);
          return new Response(
            JSON.stringify({ error: "Failed to download image" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const arrayBuffer = await fileData.arrayBuffer();
        base64Data = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
      }

      // Use a simple approach to get image dimensions from base64
      // This is a simplified version - in production you'd use a proper image library
      const dimensions = await getImageDimensions(base64Data!);
      
      return new Response(
        JSON.stringify({ success: true, dimensions }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // For other actions, we'll use the browser-compatible canvas approach via client
    // Since Deno edge functions don't have canvas, we'll handle simpler operations
    
    if (action === "compress" || action === "resize" || action === "convert") {
      // These operations will be handled client-side using canvas
      // This endpoint will just handle the storage operations
      
      if (!imageData) {
        return new Response(
          JSON.stringify({ error: "imageData required for processing" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Decode base64
      const base64Match = imageData.match(/^data:image\/([a-z]+);base64,(.+)$/i);
      if (!base64Match) {
        return new Response(
          JSON.stringify({ error: "Invalid image data format" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const mimeType = base64Match[1];
      const base64Content = base64Match[2];
      const binaryData = Uint8Array.from(atob(base64Content), c => c.charCodeAt(0));

      // Generate new path if needed or use existing
      const targetPath = storagePath || `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${options.format || mimeType}`;
      
      // Upload processed image
      const { error: uploadError } = await adminClient
        .storage
        .from("blog-images")
        .upload(targetPath, binaryData, {
          contentType: `image/${options.format || mimeType}`,
          upsert: true,
        });

      if (uploadError) {
        console.error("Upload error:", uploadError);
        return new Response(
          JSON.stringify({ error: "Failed to upload processed image" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Get public URL
      const { data: urlData } = adminClient
        .storage
        .from("blog-images")
        .getPublicUrl(targetPath);

      return new Response(
        JSON.stringify({ 
          success: true, 
          path: targetPath,
          url: urlData.publicUrl,
          size: binaryData.length 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Invalid action" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Error processing image:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

// Simple function to extract dimensions from common image formats
async function getImageDimensions(base64Data: string): Promise<{ width: number; height: number } | null> {
  try {
    // Remove data URL prefix if present
    const cleanBase64 = base64Data.replace(/^data:image\/[a-z]+;base64,/i, "");
    const binaryString = atob(cleanBase64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // Check for PNG (dimensions at bytes 16-23)
    if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4E && bytes[3] === 0x47) {
      const width = (bytes[16] << 24) | (bytes[17] << 16) | (bytes[18] << 8) | bytes[19];
      const height = (bytes[20] << 24) | (bytes[21] << 16) | (bytes[22] << 8) | bytes[23];
      return { width, height };
    }

    // Check for JPEG
    if (bytes[0] === 0xFF && bytes[1] === 0xD8) {
      let offset = 2;
      while (offset < bytes.length) {
        if (bytes[offset] !== 0xFF) break;
        const marker = bytes[offset + 1];
        if (marker === 0xC0 || marker === 0xC2) {
          const height = (bytes[offset + 5] << 8) | bytes[offset + 6];
          const width = (bytes[offset + 7] << 8) | bytes[offset + 8];
          return { width, height };
        }
        const segmentLength = (bytes[offset + 2] << 8) | bytes[offset + 3];
        offset += segmentLength + 2;
      }
    }

    // Check for WebP
    if (bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46) {
      // VP8 format
      if (bytes[12] === 0x56 && bytes[13] === 0x50 && bytes[14] === 0x38) {
        if (bytes[15] === 0x20) { // VP8
          const width = ((bytes[26] | (bytes[27] << 8)) & 0x3FFF);
          const height = ((bytes[28] | (bytes[29] << 8)) & 0x3FFF);
          return { width, height };
        } else if (bytes[15] === 0x4C) { // VP8L
          const bits = bytes[21] | (bytes[22] << 8) | (bytes[23] << 16) | (bytes[24] << 24);
          const width = (bits & 0x3FFF) + 1;
          const height = ((bits >> 14) & 0x3FFF) + 1;
          return { width, height };
        }
      }
    }

    // Check for GIF
    if (bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46) {
      const width = bytes[6] | (bytes[7] << 8);
      const height = bytes[8] | (bytes[9] << 8);
      return { width, height };
    }

    return null;
  } catch (error) {
    console.error("Error getting dimensions:", error);
    return null;
  }
}