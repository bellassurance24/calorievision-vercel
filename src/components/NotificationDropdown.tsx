import { useState, useEffect, useCallback } from "react";
import { Bell, Check, ExternalLink, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNotifications } from "@/contexts/NotificationContext";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { fr, enUS, es, pt, zhCN, ar, it, de, nl } from "date-fns/locale";
import { LocalizedNavLink } from "@/components/LocalizedNavLink";

interface NotificationItem {
  id: string;
  title: string;
  body: string;
  category: string;
  sent_at: string | null;
  opened_at: string | null;
  data: Record<string, unknown> | null;
}

const translations = {
  en: {
    notifications: "Notifications",
    noNotifications: "No notifications yet",
    markAllRead: "Mark all as read",
    viewAll: "View all settings",
    justNow: "Just now",
    enableNotifications: "Enable notifications to receive updates",
    enableButton: "Enable",
  },
  fr: {
    notifications: "Notifications",
    noNotifications: "Aucune notification",
    markAllRead: "Tout marquer comme lu",
    viewAll: "Voir tous les paramètres",
    justNow: "À l'instant",
    enableNotifications: "Activez les notifications pour recevoir des mises à jour",
    enableButton: "Activer",
  },
  es: {
    notifications: "Notificaciones",
    noNotifications: "Sin notificaciones",
    markAllRead: "Marcar todo como leído",
    viewAll: "Ver todos los ajustes",
    justNow: "Ahora mismo",
    enableNotifications: "Activa las notificaciones para recibir actualizaciones",
    enableButton: "Activar",
  },
  pt: {
    notifications: "Notificações",
    noNotifications: "Sem notificações",
    markAllRead: "Marcar tudo como lido",
    viewAll: "Ver todas as configurações",
    justNow: "Agora mesmo",
    enableNotifications: "Ative as notificações para receber atualizações",
    enableButton: "Ativar",
  },
  zh: {
    notifications: "通知",
    noNotifications: "暂无通知",
    markAllRead: "全部标记为已读",
    viewAll: "查看所有设置",
    justNow: "刚刚",
    enableNotifications: "启用通知以接收更新",
    enableButton: "启用",
  },
  ar: {
    notifications: "الإشعارات",
    noNotifications: "لا توجد إشعارات",
    markAllRead: "تحديد الكل كمقروء",
    viewAll: "عرض جميع الإعدادات",
    justNow: "الآن",
    enableNotifications: "فعّل الإشعارات لتلقي التحديثات",
    enableButton: "تفعيل",
  },
  it: {
    notifications: "Notifiche",
    noNotifications: "Nessuna notifica",
    markAllRead: "Segna tutto come letto",
    viewAll: "Vedi tutte le impostazioni",
    justNow: "Proprio ora",
    enableNotifications: "Attiva le notifiche per ricevere aggiornamenti",
    enableButton: "Attiva",
  },
  de: {
    notifications: "Benachrichtigungen",
    noNotifications: "Keine Benachrichtigungen",
    markAllRead: "Alle als gelesen markieren",
    viewAll: "Alle Einstellungen anzeigen",
    justNow: "Gerade eben",
    enableNotifications: "Aktivieren Sie Benachrichtigungen für Updates",
    enableButton: "Aktivieren",
  },
  nl: {
    notifications: "Meldingen",
    noNotifications: "Geen meldingen",
    markAllRead: "Alles als gelezen markeren",
    viewAll: "Alle instellingen bekijken",
    justNow: "Zojuist",
    enableNotifications: "Schakel meldingen in voor updates",
    enableButton: "Inschakelen",
  },
  ru: {
    notifications: "Уведомления",
    noNotifications: "Нет уведомлений",
    markAllRead: "Отметить все как прочитанные",
    viewAll: "Все настройки",
    justNow: "Только что",
    enableNotifications: "Включите уведомления, чтобы получать обновления",
    enableButton: "Включить",
  },
  ja: {
    notifications: "通知",
    noNotifications: "通知はありません",
    markAllRead: "すべて既読にする",
    viewAll: "すべての設定を見る",
    justNow: "たった今",
    enableNotifications: "更新を受け取るために通知を有効にしてください",
    enableButton: "有効にする",
  },
} as const;

const dateLocales: Record<string, typeof enUS> = {
  en: enUS,
  fr: fr,
  es: es,
  pt: pt,
  zh: zhCN,
  ar: ar,
  it: it,
  de: de,
  nl: nl,
  ru: enUS, // date-fns doesn't export ru/ja directly from this path; fallback to enUS
  ja: enUS,
};

const categoryIcons: Record<string, string> = {
  meal_reminder: "🍽️",
  calorie_alert: "⚠️",
  weekly_summary: "📊",
  motivation: "💪",
  system: "🔔",
  promotional: "🎉",
};

export function NotificationDropdown() {
  const { user } = useAuth();
  const { language } = useLanguage();
  const { unreadCount, markAsRead, refreshUnreadCount, permissionStatus, registerDevice, isLoading: isRegistering } = useNotifications();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const t = translations[language as keyof typeof translations] || translations.en;
  const dateLocale = dateLocales[language] || enUS;

  const fetchNotifications = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("notification_logs")
        .select("id, title, body, category, sent_at, opened_at, data")
        .eq("user_id", user.id)
        .in("status", ["sent", "delivered"])
        .order("sent_at", { ascending: false })
        .limit(10);

      if (!error && data) {
        setNotifications(data as NotificationItem[]);
      }
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Fetch notifications and mark as read when dropdown opens
  useEffect(() => {
    if (isOpen && user) {
      fetchNotifications();
      // Mark all as read when dropdown opens (only if there are unread ones)
      if (unreadCount > 0) {
        // Use a slight delay to ensure the dropdown is visible first
        const timer = setTimeout(() => {
          markAsRead();
        }, 100);
        return () => clearTimeout(timer);
      }
    }
  }, [isOpen, user]); // Only depend on isOpen and user to avoid loops

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await supabase
        .from("notification_logs")
        .update({ opened_at: new Date().toISOString() })
        .eq("id", notificationId);

      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId ? { ...n, opened_at: new Date().toISOString() } : n
        )
      );
      await refreshUnreadCount();
    } catch (err) {
      console.error("Failed to mark as read:", err);
    }
  };

  const handleMarkAllAsRead = async () => {
    await markAsRead();
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, opened_at: new Date().toISOString() }))
    );
  };

  const formatTime = (dateStr: string | null) => {
    if (!dateStr) return t.justNow;
    try {
      return formatDistanceToNow(new Date(dateStr), {
        addSuffix: true,
        locale: dateLocale,
      });
    } catch {
      return t.justNow;
    }
  };

  const handleEnableNotifications = async () => {
    await registerDevice();
  };

  // Always show the bell icon
  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="relative text-primary-foreground hover:bg-primary-foreground/10 min-w-[44px] min-h-[44px]"
          aria-label={t.notifications}
        >
          <Bell className="h-5 w-5" aria-hidden="true" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground shadow-sm animate-pulse">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-80 bg-card border border-border shadow-xl z-[9999]"
        sideOffset={8}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <h3 className="font-semibold text-foreground">{t.notifications}</h3>
          {user && unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-1 text-xs text-muted-foreground hover:text-foreground"
              onClick={handleMarkAllAsRead}
            >
              <Check className="h-3 w-3 mr-1" />
              {t.markAllRead}
            </Button>
          )}
        </div>

        {/* Content - Enable notifications prompt or notifications list */}
        {permissionStatus !== "granted" ? (
          <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
            <Bell className="h-10 w-10 mb-3 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground mb-4">{t.enableNotifications}</p>
            <Button
              onClick={handleEnableNotifications}
              size="sm"
              className="gap-2"
              disabled={isRegistering}
            >
              <Bell className="h-4 w-4" />
              {t.enableButton}
            </Button>
          </div>
        ) : (
          <>
            {/* Notification list */}
            <ScrollArea className="max-h-[320px]">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                  <Bell className="h-8 w-8 mb-2 opacity-50" />
                  <p className="text-sm">{t.noNotifications}</p>
                </div>
              ) : (
                <div className="py-1">
                  {notifications.map((notification) => (
                    <DropdownMenuItem
                      key={notification.id}
                      className={cn(
                        "flex flex-col items-start gap-1 px-4 py-3 cursor-pointer focus:bg-muted",
                        !notification.opened_at && "bg-primary/5"
                      )}
                      onClick={() => {
                        if (!notification.opened_at) {
                          handleMarkAsRead(notification.id);
                        }
                      }}
                    >
                      <div className="flex items-start gap-2 w-full">
                        <span className="text-lg shrink-0">
                          {categoryIcons[notification.category] || "🔔"}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className={cn(
                              "text-sm truncate",
                              !notification.opened_at ? "font-semibold text-foreground" : "text-foreground"
                            )}>
                              {notification.title}
                            </p>
                            {!notification.opened_at && (
                              <span className="h-2 w-2 rounded-full bg-primary shrink-0" />
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                            {notification.body}
                          </p>
                          <p className="text-[10px] text-muted-foreground/70 mt-1">
                            {formatTime(notification.sent_at)}
                          </p>
                        </div>
                      </div>
                    </DropdownMenuItem>
                  ))}
                </div>
              )}
            </ScrollArea>
            {/* Footer */}
            <DropdownMenuSeparator />
            <div className="p-2">
              <LocalizedNavLink to="/notification-settings" className="w-full">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-center text-sm text-muted-foreground hover:text-foreground"
                  onClick={() => setIsOpen(false)}
                >
                  <ExternalLink className="h-3 w-3 mr-2" />
                  {t.viewAll}
                </Button>
              </LocalizedNavLink>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
