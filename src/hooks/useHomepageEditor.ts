import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface HomepageSection {
  id: string;
  section_key: string;
  title: string | null;
  subtitle: string | null;
  description: string | null;
  is_visible: boolean;
  display_order: number;
  metadata: any;
}

export interface HomepageSectionItem {
  id: string;
  section_id: string;
  title: string | null;
  description: string | null;
  icon_url: string | null;
  image_url: string | null;
  display_order: number;
  metadata: any;
}

export interface HomepageImage {
  id: string;
  section_key: string;
  image_url: string;
  alt_text: string | null;
  image_type: string;
}

export interface HomepageColor {
  id: string;
  color_key: string;
  color_value: string;
  color_category: string;
}

export interface FontSettings {
  heading_family: string;
  heading_size: number;
  body_family: string;
  body_size: number;
}

export function useHomepageEditor() {
  const [sections, setSections] = useState<HomepageSection[]>([]);
  const [sectionItems, setSectionItems] = useState<HomepageSectionItem[]>([]);
  const [images, setImages] = useState<HomepageImage[]>([]);
  const [colors, setColors] = useState<HomepageColor[]>([]);
  const [siteSettings, setSiteSettings] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Local state for editing
  const [localColors, setLocalColors] = useState<Record<string, string>>({});
  const [localSections, setLocalSections] = useState<Record<string, HomepageSection>>({});
  const [localSiteSettings, setLocalSiteSettings] = useState<Record<string, any>>({});

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [sectionsRes, itemsRes, imagesRes, colorsRes, settingsRes] = await Promise.all([
        supabase.from("homepage_sections").select("*").order("display_order"),
        supabase.from("homepage_section_items").select("*").order("display_order"),
        supabase.from("homepage_images").select("*"),
        supabase.from("homepage_colors").select("*"),
        supabase.from("site_settings").select("*").limit(1).single(),
      ]);

      if (sectionsRes.data) {
        setSections(sectionsRes.data);
        const sectionsMap: Record<string, HomepageSection> = {};
        sectionsRes.data.forEach(s => {
          sectionsMap[s.section_key] = s;
        });
        setLocalSections(sectionsMap);
      }

      if (itemsRes.data) {
        setSectionItems(itemsRes.data);
      }

      if (imagesRes.data) {
        setImages(imagesRes.data);
      }

      if (colorsRes.data) {
        setColors(colorsRes.data);
        const colorsMap: Record<string, string> = {};
        colorsRes.data.forEach(c => {
          colorsMap[c.color_key] = c.color_value;
        });
        setLocalColors(colorsMap);
      }

      if (settingsRes.data) {
        setSiteSettings(settingsRes.data);
        setLocalSiteSettings(settingsRes.data);
      }
    } catch (error) {
      console.error("Error fetching homepage data:", error);
      toast.error("Failed to load homepage settings");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const updateColor = useCallback((key: string, value: string) => {
    setLocalColors(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  }, []);

  const updateSection = useCallback((sectionKey: string, updates: Partial<HomepageSection>) => {
    setLocalSections(prev => ({
      ...prev,
      [sectionKey]: { ...prev[sectionKey], ...updates }
    }));
    setHasChanges(true);
  }, []);

  const updateSiteSettings = useCallback((updates: Record<string, any>) => {
    setLocalSiteSettings(prev => ({ ...prev, ...updates }));
    setHasChanges(true);
  }, []);

  const markAsChanged = useCallback(() => {
    setHasChanges(true);
  }, []);

  const saveAllChanges = useCallback(async () => {
    setIsSaving(true);
    try {
      // Save colors
      const colorPromises = Object.entries(localColors).map(([key, value]) => 
        supabase
          .from("homepage_colors")
          .upsert({ color_key: key, color_value: value }, { onConflict: "color_key" })
      );

      // Save sections
      const sectionPromises = Object.values(localSections).map(section =>
        supabase
          .from("homepage_sections")
          .update({
            title: section.title,
            subtitle: section.subtitle,
            description: section.description,
            is_visible: section.is_visible,
            metadata: section.metadata
          })
          .eq("id", section.id)
      );

      // Save site settings
      const settingsPromise = supabase
        .from("site_settings")
        .update({
          header_logo_url: localSiteSettings.header_logo_url,
          footer_logo_url: localSiteSettings.footer_logo_url,
          font_heading_family: localSiteSettings.font_heading_family,
          font_h1_size: localSiteSettings.font_h1_size,
          font_body_family: localSiteSettings.font_body_family,
          font_body_size: localSiteSettings.font_body_size,
          hero_title: localSiteSettings.hero_title,
          hero_subtitle: localSiteSettings.hero_subtitle,
          hero_description: localSiteSettings.hero_description,
          hero_primary_button_text: localSiteSettings.hero_primary_button_text,
          hero_primary_button_link: localSiteSettings.hero_primary_button_link,
          hero_secondary_button_text: localSiteSettings.hero_secondary_button_text,
          hero_secondary_button_link: localSiteSettings.hero_secondary_button_link,
          hero_show_section: localSiteSettings.hero_show_section,
          hero_bg_image_url: localSiteSettings.hero_bg_image_url,
          hero_bg_video_url: localSiteSettings.hero_bg_video_url,
          // Media showcase settings
          media_showcase_show_section: localSiteSettings.media_showcase_show_section,
          media_showcase_title: localSiteSettings.media_showcase_title,
          media_showcase_description: localSiteSettings.media_showcase_description,
        })
        .eq("id", localSiteSettings.id);

      await Promise.all([...colorPromises, ...sectionPromises, settingsPromise]);

      setHasChanges(false);
      toast.success("All changes saved successfully!");
      await fetchData();
    } catch (error) {
      console.error("Error saving changes:", error);
      toast.error("Failed to save changes");
    } finally {
      setIsSaving(false);
    }
  }, [localColors, localSections, localSiteSettings, fetchData]);

  const resetToDefaults = useCallback(async () => {
    const confirmed = window.confirm("Are you sure you want to reset all settings to defaults? This cannot be undone.");
    if (!confirmed) return;

    setIsSaving(true);
    try {
      // Reset colors to defaults
      const defaultColors: Record<string, string> = {
        header_background: "#9b87f5",
        header_text: "#ffffff",
        nav_link: "#ffffff",
        nav_hover: "#e0e0e0",
        hero_background: "#1A1F2C",
        hero_overlay: "#000000",
        hero_title: "#ffffff",
        hero_subtitle: "#9b87f5",
        hero_description: "#94a3b8",
        primary_button_bg: "#9b87f5",
        primary_button_text: "#ffffff",
        primary_button_hover_bg: "#7E69AB",
        primary_button_hover_text: "#ffffff",
        secondary_button_bg: "transparent",
        secondary_button_text: "#9b87f5",
        secondary_button_hover_bg: "rgba(155, 135, 245, 0.1)",
        secondary_button_hover_text: "#9b87f5",
        section_background: "#1A1F2C",
        section_title: "#ffffff",
        section_subtitle: "#9b87f5",
        section_text: "#94a3b8",
        card_background: "#1E2330",
        card_border: "#333333",
        card_shadow: "rgba(0, 0, 0, 0.3)",
        card_hover_background: "#252a3a",
        link_color: "#9b87f5",
        link_hover: "#7E69AB",
        footer_background: "#9b87f5",
        footer_text: "#ffffff",
        footer_link: "#ffffff",
        footer_link_hover: "#e0e0e0",
        icon_color: "#9b87f5",
        border_color: "#333333",
        divider_color: "#333333",
        input_background: "#1E2330",
        input_border: "#333333",
        input_text: "#ffffff",
        input_focus_border: "#9b87f5",
      };

      const colorPromises = Object.entries(defaultColors).map(([key, value]) =>
        supabase
          .from("homepage_colors")
          .upsert({ color_key: key, color_value: value }, { onConflict: "color_key" })
      );

      await Promise.all(colorPromises);

      toast.success("Settings reset to defaults!");
      await fetchData();
      setHasChanges(false);
    } catch (error) {
      console.error("Error resetting to defaults:", error);
      toast.error("Failed to reset settings");
    } finally {
      setIsSaving(false);
    }
  }, [fetchData]);

  const uploadImage = useCallback(async (file: File, sectionKey: string, imageType: string = "background"): Promise<string | null> => {
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${sectionKey}-${imageType}-${Date.now()}.${fileExt}`;
      const filePath = `homepage/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("site-assets")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("site-assets")
        .getPublicUrl(filePath);

      // Save to homepage_images table
      await supabase.from("homepage_images").insert({
        section_key: sectionKey,
        image_url: publicUrl,
        image_type: imageType,
      });

      return publicUrl;
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Failed to upload image");
      return null;
    }
  }, []);

  const deleteImage = useCallback(async (imageId: string, imageUrl: string) => {
    try {
      // Extract file path from URL
      const urlParts = imageUrl.split("/");
      const fileName = urlParts[urlParts.length - 1];
      const filePath = `homepage/${fileName}`;

      // Delete from storage
      await supabase.storage.from("site-assets").remove([filePath]);

      // Delete from database
      await supabase.from("homepage_images").delete().eq("id", imageId);

      toast.success("Image deleted");
      await fetchData();
    } catch (error) {
      console.error("Error deleting image:", error);
      toast.error("Failed to delete image");
    }
  }, [fetchData]);

  // Section items management
  const addSectionItem = useCallback(async (sectionId: string) => {
    try {
      const maxOrder = sectionItems
        .filter(item => item.section_id === sectionId)
        .reduce((max, item) => Math.max(max, item.display_order), 0);

      const { error } = await supabase.from("homepage_section_items").insert({
        section_id: sectionId,
        title: "New Item",
        description: "",
        display_order: maxOrder + 1,
      });

      if (error) throw error;
      toast.success("Item added");
      await fetchData();
    } catch (error) {
      console.error("Error adding section item:", error);
      toast.error("Failed to add item");
    }
  }, [sectionItems, fetchData]);

  const updateSectionItem = useCallback(async (itemId: string, updates: Partial<HomepageSectionItem>) => {
    try {
      const { error } = await supabase
        .from("homepage_section_items")
        .update(updates)
        .eq("id", itemId);

      if (error) throw error;
      await fetchData();
    } catch (error) {
      console.error("Error updating section item:", error);
      toast.error("Failed to update item");
    }
  }, [fetchData]);

  const deleteSectionItem = useCallback(async (itemId: string) => {
    try {
      const { error } = await supabase
        .from("homepage_section_items")
        .delete()
        .eq("id", itemId);

      if (error) throw error;
      toast.success("Item deleted");
      await fetchData();
    } catch (error) {
      console.error("Error deleting section item:", error);
      toast.error("Failed to delete item");
    }
  }, [fetchData]);

  return {
    sections,
    sectionItems,
    images,
    colors,
    siteSettings,
    localColors,
    localSections,
    localSiteSettings,
    isLoading,
    isSaving,
    hasChanges,
    updateColor,
    updateSection,
    updateSiteSettings,
    saveAllChanges,
    resetToDefaults,
    uploadImage,
    deleteImage,
    addSectionItem,
    updateSectionItem,
    deleteSectionItem,
    markAsChanged,
    refetch: fetchData,
  };
}
