export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      analytics_events: {
        Row: {
          browser: string | null
          city: string | null
          country: string | null
          created_at: string
          device_type: string | null
          event_type: string
          id: string
          ip_hash: string | null
          language: string | null
          metadata: Json | null
          os: string | null
          page_path: string | null
          referrer: string | null
          screen_height: number | null
          screen_width: number | null
          session_id: string | null
          user_agent: string | null
          utm_campaign: string | null
          utm_medium: string | null
          utm_source: string | null
          visitor_id: string | null
        }
        Insert: {
          browser?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          device_type?: string | null
          event_type: string
          id?: string
          ip_hash?: string | null
          language?: string | null
          metadata?: Json | null
          os?: string | null
          page_path?: string | null
          referrer?: string | null
          screen_height?: number | null
          screen_width?: number | null
          session_id?: string | null
          user_agent?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          visitor_id?: string | null
        }
        Update: {
          browser?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          device_type?: string | null
          event_type?: string
          id?: string
          ip_hash?: string | null
          language?: string | null
          metadata?: Json | null
          os?: string | null
          page_path?: string | null
          referrer?: string | null
          screen_height?: number | null
          screen_width?: number | null
          session_id?: string | null
          user_agent?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          visitor_id?: string | null
        }
        Relationships: []
      }
      blog_categories: {
        Row: {
          created_at: string
          id: string
          name: string
          slug: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          slug: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      blog_images: {
        Row: {
          blog_post_id: string | null
          created_at: string
          file_size: number
          height: number | null
          id: string
          is_optimized: boolean | null
          mime_type: string
          original_name: string
          storage_path: string
          updated_at: string
          uploaded_by: string
          width: number | null
        }
        Insert: {
          blog_post_id?: string | null
          created_at?: string
          file_size: number
          height?: number | null
          id?: string
          is_optimized?: boolean | null
          mime_type: string
          original_name: string
          storage_path: string
          updated_at?: string
          uploaded_by: string
          width?: number | null
        }
        Update: {
          blog_post_id?: string | null
          created_at?: string
          file_size?: number
          height?: number | null
          id?: string
          is_optimized?: boolean | null
          mime_type?: string
          original_name?: string
          storage_path?: string
          updated_at?: string
          uploaded_by?: string
          width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "blog_images_blog_post_id_fkey"
            columns: ["blog_post_id"]
            isOneToOne: false
            referencedRelation: "blog_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_post_tags: {
        Row: {
          post_id: string
          tag_id: string
        }
        Insert: {
          post_id: string
          tag_id: string
        }
        Update: {
          post_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "blog_post_tags_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "blog_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blog_post_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "blog_tags"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_posts: {
        Row: {
          author_id: string
          category_id: string | null
          content: string
          created_at: string
          featured_image_alt: string | null
          featured_image_url: string | null
          id: string
          meta_description: string | null
          meta_title: string | null
          published_at: string | null
          slug: string
          status: Database["public"]["Enums"]["post_status"]
          title: string
          updated_at: string
        }
        Insert: {
          author_id: string
          category_id?: string | null
          content: string
          created_at?: string
          featured_image_alt?: string | null
          featured_image_url?: string | null
          id?: string
          meta_description?: string | null
          meta_title?: string | null
          published_at?: string | null
          slug: string
          status?: Database["public"]["Enums"]["post_status"]
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string
          category_id?: string | null
          content?: string
          created_at?: string
          featured_image_alt?: string | null
          featured_image_url?: string | null
          id?: string
          meta_description?: string | null
          meta_title?: string | null
          published_at?: string | null
          slug?: string
          status?: Database["public"]["Enums"]["post_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "blog_posts_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "blog_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_tags: {
        Row: {
          created_at: string
          id: string
          name: string
          slug: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          slug: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      device_tokens: {
        Row: {
          created_at: string | null
          device_name: string | null
          id: string
          is_active: boolean | null
          last_used_at: string | null
          platform: Database["public"]["Enums"]["device_platform"]
          token: string
          updated_at: string | null
          user_id: string | null
          visitor_id: string | null
        }
        Insert: {
          created_at?: string | null
          device_name?: string | null
          id?: string
          is_active?: boolean | null
          last_used_at?: string | null
          platform: Database["public"]["Enums"]["device_platform"]
          token: string
          updated_at?: string | null
          user_id?: string | null
          visitor_id?: string | null
        }
        Update: {
          created_at?: string | null
          device_name?: string | null
          id?: string
          is_active?: boolean | null
          last_used_at?: string | null
          platform?: Database["public"]["Enums"]["device_platform"]
          token?: string
          updated_at?: string | null
          user_id?: string | null
          visitor_id?: string | null
        }
        Relationships: []
      }
      home_media: {
        Row: {
          aspect_ratio: string | null
          created_at: string
          duration_seconds: number | null
          file_name: string
          file_size: number
          height: number | null
          id: string
          is_active: boolean | null
          media_type: string
          mime_type: string
          storage_path: string
          updated_at: string
          uploaded_by: string | null
          width: number | null
        }
        Insert: {
          aspect_ratio?: string | null
          created_at?: string
          duration_seconds?: number | null
          file_name: string
          file_size: number
          height?: number | null
          id?: string
          is_active?: boolean | null
          media_type: string
          mime_type: string
          storage_path: string
          updated_at?: string
          uploaded_by?: string | null
          width?: number | null
        }
        Update: {
          aspect_ratio?: string | null
          created_at?: string
          duration_seconds?: number | null
          file_name?: string
          file_size?: number
          height?: number | null
          id?: string
          is_active?: boolean | null
          media_type?: string
          mime_type?: string
          storage_path?: string
          updated_at?: string
          uploaded_by?: string | null
          width?: number | null
        }
        Relationships: []
      }
      homepage_colors: {
        Row: {
          color_category: string | null
          color_key: string
          color_value: string
          created_at: string
          id: string
          updated_at: string
        }
        Insert: {
          color_category?: string | null
          color_key: string
          color_value: string
          created_at?: string
          id?: string
          updated_at?: string
        }
        Update: {
          color_category?: string | null
          color_key?: string
          color_value?: string
          created_at?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      homepage_customization: {
        Row: {
          body_font: string | null
          created_at: string
          heading_font: string | null
          id: string
          logo_url: string | null
          primary_color: string | null
          secondary_color: string | null
          updated_at: string
        }
        Insert: {
          body_font?: string | null
          created_at?: string
          heading_font?: string | null
          id?: string
          logo_url?: string | null
          primary_color?: string | null
          secondary_color?: string | null
          updated_at?: string
        }
        Update: {
          body_font?: string | null
          created_at?: string
          heading_font?: string | null
          id?: string
          logo_url?: string | null
          primary_color?: string | null
          secondary_color?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      homepage_images: {
        Row: {
          alt_text: string | null
          compression_enabled: boolean | null
          compression_quality: number | null
          created_at: string
          deleted_at: string | null
          id: string
          image_auto_scale: boolean | null
          image_height: number | null
          image_position: string | null
          image_type: string | null
          image_url: string
          image_width: number | null
          section_key: string
          updated_at: string
        }
        Insert: {
          alt_text?: string | null
          compression_enabled?: boolean | null
          compression_quality?: number | null
          created_at?: string
          deleted_at?: string | null
          id?: string
          image_auto_scale?: boolean | null
          image_height?: number | null
          image_position?: string | null
          image_type?: string | null
          image_url: string
          image_width?: number | null
          section_key: string
          updated_at?: string
        }
        Update: {
          alt_text?: string | null
          compression_enabled?: boolean | null
          compression_quality?: number | null
          created_at?: string
          deleted_at?: string | null
          id?: string
          image_auto_scale?: boolean | null
          image_height?: number | null
          image_position?: string | null
          image_type?: string | null
          image_url?: string
          image_width?: number | null
          section_key?: string
          updated_at?: string
        }
        Relationships: []
      }
      homepage_section_items: {
        Row: {
          created_at: string
          deleted_at: string | null
          description: string | null
          display_order: number | null
          icon_url: string | null
          id: string
          image_auto_scale: boolean | null
          image_height: number | null
          image_position: string | null
          image_url: string | null
          image_width: number | null
          metadata: Json | null
          section_id: string | null
          text_align: string | null
          title: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          display_order?: number | null
          icon_url?: string | null
          id?: string
          image_auto_scale?: boolean | null
          image_height?: number | null
          image_position?: string | null
          image_url?: string | null
          image_width?: number | null
          metadata?: Json | null
          section_id?: string | null
          text_align?: string | null
          title?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          display_order?: number | null
          icon_url?: string | null
          id?: string
          image_auto_scale?: boolean | null
          image_height?: number | null
          image_position?: string | null
          image_url?: string | null
          image_width?: number | null
          metadata?: Json | null
          section_id?: string | null
          text_align?: string | null
          title?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "homepage_section_items_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "homepage_sections"
            referencedColumns: ["id"]
          },
        ]
      }
      homepage_sections: {
        Row: {
          created_at: string
          description: string | null
          display_order: number | null
          id: string
          is_visible: boolean | null
          metadata: Json | null
          section_key: string
          subtitle: string | null
          title: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_order?: number | null
          id?: string
          is_visible?: boolean | null
          metadata?: Json | null
          section_key: string
          subtitle?: string | null
          title?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          display_order?: number | null
          id?: string
          is_visible?: boolean | null
          metadata?: Json | null
          section_key?: string
          subtitle?: string | null
          title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      media_showcase_items: {
        Row: {
          aspect_ratio: string | null
          compression_enabled: boolean | null
          compression_quality: number | null
          created_at: string
          deleted_at: string | null
          description: string | null
          display_order: number | null
          id: string
          image_auto_scale: boolean | null
          image_height: number | null
          image_height_custom: number | null
          image_position: string | null
          image_width: number | null
          image_width_custom: number | null
          is_visible: boolean | null
          media_type: string
          media_url: string
          text_align: string | null
          thumbnail_url: string | null
          title: string | null
          updated_at: string
        }
        Insert: {
          aspect_ratio?: string | null
          compression_enabled?: boolean | null
          compression_quality?: number | null
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          image_auto_scale?: boolean | null
          image_height?: number | null
          image_height_custom?: number | null
          image_position?: string | null
          image_width?: number | null
          image_width_custom?: number | null
          is_visible?: boolean | null
          media_type: string
          media_url: string
          text_align?: string | null
          thumbnail_url?: string | null
          title?: string | null
          updated_at?: string
        }
        Update: {
          aspect_ratio?: string | null
          compression_enabled?: boolean | null
          compression_quality?: number | null
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          image_auto_scale?: boolean | null
          image_height?: number | null
          image_height_custom?: number | null
          image_position?: string | null
          image_width?: number | null
          image_width_custom?: number | null
          is_visible?: boolean | null
          media_type?: string
          media_url?: string
          text_align?: string | null
          thumbnail_url?: string | null
          title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      notification_logs: {
        Row: {
          batch_id: string | null
          body: string
          campaign_id: string | null
          category: Database["public"]["Enums"]["notification_category"]
          data: Json | null
          delivered_at: string | null
          device_token_id: string | null
          error_message: string | null
          id: string
          opened_at: string | null
          provider_response: Json | null
          sent_at: string | null
          status: Database["public"]["Enums"]["notification_status"]
          title: string
          user_id: string | null
          visitor_id: string | null
        }
        Insert: {
          batch_id?: string | null
          body: string
          campaign_id?: string | null
          category: Database["public"]["Enums"]["notification_category"]
          data?: Json | null
          delivered_at?: string | null
          device_token_id?: string | null
          error_message?: string | null
          id?: string
          opened_at?: string | null
          provider_response?: Json | null
          sent_at?: string | null
          status: Database["public"]["Enums"]["notification_status"]
          title: string
          user_id?: string | null
          visitor_id?: string | null
        }
        Update: {
          batch_id?: string | null
          body?: string
          campaign_id?: string | null
          category?: Database["public"]["Enums"]["notification_category"]
          data?: Json | null
          delivered_at?: string | null
          device_token_id?: string | null
          error_message?: string | null
          id?: string
          opened_at?: string | null
          provider_response?: Json | null
          sent_at?: string | null
          status?: Database["public"]["Enums"]["notification_status"]
          title?: string
          user_id?: string | null
          visitor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notification_logs_device_token_id_fkey"
            columns: ["device_token_id"]
            isOneToOne: false
            referencedRelation: "device_tokens"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_preferences: {
        Row: {
          breakfast_reminder_time: string | null
          calorie_alert_enabled: boolean | null
          created_at: string | null
          dinner_reminder_time: string | null
          gdpr_consent_date: string | null
          gdpr_consent_given: boolean | null
          id: string
          lunch_reminder_time: string | null
          meal_reminder_enabled: boolean | null
          motivation_enabled: boolean | null
          promotional_enabled: boolean | null
          quiet_hours_end: string | null
          quiet_hours_start: string | null
          system_enabled: boolean | null
          timezone: string | null
          updated_at: string | null
          user_id: string
          weekly_summary_enabled: boolean | null
        }
        Insert: {
          breakfast_reminder_time?: string | null
          calorie_alert_enabled?: boolean | null
          created_at?: string | null
          dinner_reminder_time?: string | null
          gdpr_consent_date?: string | null
          gdpr_consent_given?: boolean | null
          id?: string
          lunch_reminder_time?: string | null
          meal_reminder_enabled?: boolean | null
          motivation_enabled?: boolean | null
          promotional_enabled?: boolean | null
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          system_enabled?: boolean | null
          timezone?: string | null
          updated_at?: string | null
          user_id: string
          weekly_summary_enabled?: boolean | null
        }
        Update: {
          breakfast_reminder_time?: string | null
          calorie_alert_enabled?: boolean | null
          created_at?: string | null
          dinner_reminder_time?: string | null
          gdpr_consent_date?: string | null
          gdpr_consent_given?: boolean | null
          id?: string
          lunch_reminder_time?: string | null
          meal_reminder_enabled?: boolean | null
          motivation_enabled?: boolean | null
          promotional_enabled?: boolean | null
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          system_enabled?: boolean | null
          timezone?: string | null
          updated_at?: string | null
          user_id?: string
          weekly_summary_enabled?: boolean | null
        }
        Relationships: []
      }
      notification_queue: {
        Row: {
          attempts: number | null
          body: string
          category: Database["public"]["Enums"]["notification_category"]
          created_at: string | null
          data: Json | null
          error_message: string | null
          id: string
          max_attempts: number | null
          priority: number | null
          processed_at: string | null
          scheduled_for: string
          status: Database["public"]["Enums"]["notification_status"] | null
          title: string
          user_id: string
        }
        Insert: {
          attempts?: number | null
          body: string
          category: Database["public"]["Enums"]["notification_category"]
          created_at?: string | null
          data?: Json | null
          error_message?: string | null
          id?: string
          max_attempts?: number | null
          priority?: number | null
          processed_at?: string | null
          scheduled_for: string
          status?: Database["public"]["Enums"]["notification_status"] | null
          title: string
          user_id: string
        }
        Update: {
          attempts?: number | null
          body?: string
          category?: Database["public"]["Enums"]["notification_category"]
          created_at?: string | null
          data?: Json | null
          error_message?: string | null
          id?: string
          max_attempts?: number | null
          priority?: number | null
          processed_at?: string | null
          scheduled_for?: string
          status?: Database["public"]["Enums"]["notification_status"] | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      notification_rate_limits: {
        Row: {
          daily_count: number | null
          last_notification_at: string | null
          last_reset_at: string | null
          user_id: string
          weekly_count: number | null
        }
        Insert: {
          daily_count?: number | null
          last_notification_at?: string | null
          last_reset_at?: string | null
          user_id: string
          weekly_count?: number | null
        }
        Update: {
          daily_count?: number | null
          last_notification_at?: string | null
          last_reset_at?: string | null
          user_id?: string
          weekly_count?: number | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      settings: {
        Row: {
          created_at: string
          description: string | null
          id: string
          key: string
          updated_at: string
          value: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          key: string
          updated_at?: string
          value: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          key?: string
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          color_accent: string | null
          color_background: string | null
          color_button: string | null
          color_button_hover: string | null
          color_button_text: string | null
          color_link: string | null
          color_link_hover: string | null
          color_primary: string | null
          color_secondary: string | null
          color_text: string | null
          created_at: string
          font_body_family: string | null
          font_body_line_height: number | null
          font_body_size: number | null
          font_body_weight: number | null
          font_button_family: string | null
          font_button_size: number | null
          font_button_transform: string | null
          font_button_weight: number | null
          font_h1_size: number | null
          font_h2_size: number | null
          font_h3_size: number | null
          font_heading_family: string | null
          font_heading_weight: number | null
          footer_bg_color: string | null
          footer_copyright: string | null
          footer_description: string | null
          footer_link_color: string | null
          footer_link_hover_color: string | null
          footer_logo_url: string | null
          footer_menu_items: Json | null
          footer_padding: number | null
          footer_social_links: Json | null
          footer_text_color: string | null
          header_bg_color: string | null
          header_height: number | null
          header_language_selector_position: string | null
          header_logo_alt: string | null
          header_logo_url: string | null
          header_logo_width: number | null
          header_menu_font_size: number | null
          header_menu_hover_color: string | null
          header_menu_items: Json | null
          header_menu_text_color: string | null
          header_show_language_selector: boolean | null
          header_sticky: boolean | null
          header_transparent: boolean | null
          hero_bg_color: string | null
          hero_bg_image_url: string | null
          hero_bg_type: string | null
          hero_bg_video_url: string | null
          hero_description: string | null
          hero_height: string | null
          hero_overlay_color: string | null
          hero_overlay_opacity: number | null
          hero_primary_button_link: string | null
          hero_primary_button_text: string | null
          hero_secondary_button_link: string | null
          hero_secondary_button_text: string | null
          hero_show_buttons: boolean | null
          hero_show_section: boolean | null
          hero_subtitle: string | null
          hero_text_alignment: string | null
          hero_title: string | null
          homepage_sections: Json | null
          id: string
          media_showcase_description: string | null
          media_showcase_show_section: boolean | null
          media_showcase_title: string | null
          ui_button_border_radius: number | null
          ui_button_hover_animation: string | null
          ui_button_padding_x: number | null
          ui_button_padding_y: number | null
          ui_button_shadow: boolean | null
          ui_card_bg_color: string | null
          ui_card_border_color: string | null
          ui_card_border_radius: number | null
          ui_card_shadow: boolean | null
          updated_at: string
        }
        Insert: {
          color_accent?: string | null
          color_background?: string | null
          color_button?: string | null
          color_button_hover?: string | null
          color_button_text?: string | null
          color_link?: string | null
          color_link_hover?: string | null
          color_primary?: string | null
          color_secondary?: string | null
          color_text?: string | null
          created_at?: string
          font_body_family?: string | null
          font_body_line_height?: number | null
          font_body_size?: number | null
          font_body_weight?: number | null
          font_button_family?: string | null
          font_button_size?: number | null
          font_button_transform?: string | null
          font_button_weight?: number | null
          font_h1_size?: number | null
          font_h2_size?: number | null
          font_h3_size?: number | null
          font_heading_family?: string | null
          font_heading_weight?: number | null
          footer_bg_color?: string | null
          footer_copyright?: string | null
          footer_description?: string | null
          footer_link_color?: string | null
          footer_link_hover_color?: string | null
          footer_logo_url?: string | null
          footer_menu_items?: Json | null
          footer_padding?: number | null
          footer_social_links?: Json | null
          footer_text_color?: string | null
          header_bg_color?: string | null
          header_height?: number | null
          header_language_selector_position?: string | null
          header_logo_alt?: string | null
          header_logo_url?: string | null
          header_logo_width?: number | null
          header_menu_font_size?: number | null
          header_menu_hover_color?: string | null
          header_menu_items?: Json | null
          header_menu_text_color?: string | null
          header_show_language_selector?: boolean | null
          header_sticky?: boolean | null
          header_transparent?: boolean | null
          hero_bg_color?: string | null
          hero_bg_image_url?: string | null
          hero_bg_type?: string | null
          hero_bg_video_url?: string | null
          hero_description?: string | null
          hero_height?: string | null
          hero_overlay_color?: string | null
          hero_overlay_opacity?: number | null
          hero_primary_button_link?: string | null
          hero_primary_button_text?: string | null
          hero_secondary_button_link?: string | null
          hero_secondary_button_text?: string | null
          hero_show_buttons?: boolean | null
          hero_show_section?: boolean | null
          hero_subtitle?: string | null
          hero_text_alignment?: string | null
          hero_title?: string | null
          homepage_sections?: Json | null
          id?: string
          media_showcase_description?: string | null
          media_showcase_show_section?: boolean | null
          media_showcase_title?: string | null
          ui_button_border_radius?: number | null
          ui_button_hover_animation?: string | null
          ui_button_padding_x?: number | null
          ui_button_padding_y?: number | null
          ui_button_shadow?: boolean | null
          ui_card_bg_color?: string | null
          ui_card_border_color?: string | null
          ui_card_border_radius?: number | null
          ui_card_shadow?: boolean | null
          updated_at?: string
        }
        Update: {
          color_accent?: string | null
          color_background?: string | null
          color_button?: string | null
          color_button_hover?: string | null
          color_button_text?: string | null
          color_link?: string | null
          color_link_hover?: string | null
          color_primary?: string | null
          color_secondary?: string | null
          color_text?: string | null
          created_at?: string
          font_body_family?: string | null
          font_body_line_height?: number | null
          font_body_size?: number | null
          font_body_weight?: number | null
          font_button_family?: string | null
          font_button_size?: number | null
          font_button_transform?: string | null
          font_button_weight?: number | null
          font_h1_size?: number | null
          font_h2_size?: number | null
          font_h3_size?: number | null
          font_heading_family?: string | null
          font_heading_weight?: number | null
          footer_bg_color?: string | null
          footer_copyright?: string | null
          footer_description?: string | null
          footer_link_color?: string | null
          footer_link_hover_color?: string | null
          footer_logo_url?: string | null
          footer_menu_items?: Json | null
          footer_padding?: number | null
          footer_social_links?: Json | null
          footer_text_color?: string | null
          header_bg_color?: string | null
          header_height?: number | null
          header_language_selector_position?: string | null
          header_logo_alt?: string | null
          header_logo_url?: string | null
          header_logo_width?: number | null
          header_menu_font_size?: number | null
          header_menu_hover_color?: string | null
          header_menu_items?: Json | null
          header_menu_text_color?: string | null
          header_show_language_selector?: boolean | null
          header_sticky?: boolean | null
          header_transparent?: boolean | null
          hero_bg_color?: string | null
          hero_bg_image_url?: string | null
          hero_bg_type?: string | null
          hero_bg_video_url?: string | null
          hero_description?: string | null
          hero_height?: string | null
          hero_overlay_color?: string | null
          hero_overlay_opacity?: number | null
          hero_primary_button_link?: string | null
          hero_primary_button_text?: string | null
          hero_secondary_button_link?: string | null
          hero_secondary_button_text?: string | null
          hero_show_buttons?: boolean | null
          hero_show_section?: boolean | null
          hero_subtitle?: string | null
          hero_text_alignment?: string | null
          hero_title?: string | null
          homepage_sections?: Json | null
          id?: string
          media_showcase_description?: string | null
          media_showcase_show_section?: boolean | null
          media_showcase_title?: string | null
          ui_button_border_radius?: number | null
          ui_button_hover_animation?: string | null
          ui_button_padding_x?: number | null
          ui_button_padding_y?: number | null
          ui_button_shadow?: boolean | null
          ui_card_bg_color?: string | null
          ui_card_border_color?: string | null
          ui_card_border_radius?: number | null
          ui_card_shadow?: boolean | null
          updated_at?: string
        }
        Relationships: []
      }
      translation_cache: {
        Row: {
          created_at: string
          id: string
          language: string
          page_id: string
          source_hash: string
          translated_content: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          language: string
          page_id: string
          source_hash: string
          translated_content: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          language?: string
          page_id?: string
          source_hash?: string
          translated_content?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_scans: {
        Row: {
          browser: string | null
          city: string | null
          country: string | null
          created_at: string
          device_brand: string | null
          device_type: string | null
          expires_at: string
          id: string
          language: string | null
          storage_path: string
        }
        Insert: {
          browser?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          device_brand?: string | null
          device_type?: string | null
          expires_at?: string
          id?: string
          language?: string | null
          storage_path: string
        }
        Update: {
          browser?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          device_brand?: string | null
          device_type?: string | null
          expires_at?: string
          id?: string
          language?: string | null
          storage_path?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_notification_count: {
        Args: { p_user_id: string }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "user"
      device_platform: "ios" | "android" | "web"
      notification_category:
        | "meal_reminder"
        | "calorie_alert"
        | "weekly_summary"
        | "motivation"
        | "system"
        | "promotional"
      notification_status:
        | "pending"
        | "sent"
        | "delivered"
        | "failed"
        | "cancelled"
      post_status: "draft" | "published"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
      device_platform: ["ios", "android", "web"],
      notification_category: [
        "meal_reminder",
        "calorie_alert",
        "weekly_summary",
        "motivation",
        "system",
        "promotional",
      ],
      notification_status: [
        "pending",
        "sent",
        "delivered",
        "failed",
        "cancelled",
      ],
      post_status: ["draft", "published"],
    },
  },
} as const
