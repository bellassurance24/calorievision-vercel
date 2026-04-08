/**
 * LimitReachedModal.tsx
 * Shown when a user hits their daily (Starter) or monthly (Pro/Ultimate)
 * AI scan limit. Fully translated in all 11 supported languages.
 */

import { AlertCircle, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { LocalizedNavLink } from "@/components/LocalizedNavLink";
import { useLanguage } from "@/contexts/LanguageContext";
import type { PlanType } from "@/hooks/useSubscription";

interface LimitReachedModalProps {
  open: boolean;
  onClose: () => void;
  plan: PlanType;
  dailyScans: number;
  monthlyScans: number;
  dailyLimit: number;
  monthlyLimit: number;
}

export function LimitReachedModal({
  open,
  onClose,
  plan,
  dailyScans,
  monthlyScans,
  dailyLimit,
  monthlyLimit,
}: LimitReachedModalProps) {
  const { language } = useLanguage();

  // 11-language translation helper
  const t = (
    en: string, fr: string, es: string,
    pt: string, zh: string, ar: string,
    it: string, de: string, nl: string,
    ru: string, ja: string,
  ) => {
    const map: Record<string, string> = {
      en, fr, es, pt, zh, ar, it, de, nl, ru, ja,
    };
    return map[language] ?? en;
  };

  // ── Copy ─────────────────────────────────────────────────────────────────
  const title = t(
    "Scan Limit Reached",
    "Limite d'analyses atteinte",
    "Límite de análisis alcanzado",
    "Limite de análises atingido",
    "扫描次数已达上限",
    "تم الوصول إلى حد المسح",
    "Limite di scansioni raggiunto",
    "Scan-Limit erreicht",
    "Scanlimiet bereikt",
    "Лимит сканирований исчерпан",
    "スキャン上限に達しました",
  );

  // Plan-specific body message
  const starterBody = t(
    `You've used all ${dailyLimit} free scans for today. Your limit resets at midnight.`,
    `Vous avez utilisé vos ${dailyLimit} analyses gratuites du jour. Votre limite se réinitialise à minuit.`,
    `Has usado tus ${dailyLimit} análisis gratuitos de hoy. Tu límite se restablece a medianoche.`,
    `Você usou todas as suas ${dailyLimit} análises gratuitas de hoje. Seu limite é redefinido à meia-noite.`,
    `您今天的 ${dailyLimit} 次免费扫描已用完。限制将在午夜重置。`,
    `لقد استخدمت ${dailyLimit} عمليات المسح المجانية اليوم. تتجدد حصتك عند منتصف الليل.`,
    `Hai utilizzato tutte le ${dailyLimit} scansioni gratuite di oggi. Il limite si azzera a mezzanotte.`,
    `Du hast deine ${dailyLimit} kostenlosen Scans für heute verbraucht. Dein Limit wird um Mitternacht zurückgesetzt.`,
    `Je hebt je ${dailyLimit} gratis scans voor vandaag gebruikt. Je limiet wordt om middernacht gereset.`,
    `Вы использовали все ${dailyLimit} бесплатных сканирования сегодня. Лимит сбрасывается в полночь.`,
    `本日の無料スキャン ${dailyLimit} 回をすべて使い切りました。制限は深夜にリセットされます。`,
  );

  const proBody = t(
    `You've reached your ${monthlyLimit.toLocaleString()} scan limit for this month. Upgrade to Ultimate for a higher cap.`,
    `Vous avez atteint votre limite de ${monthlyLimit.toLocaleString()} analyses ce mois-ci. Passez à Ultimate pour une limite plus élevée.`,
    `Has alcanzado tu límite de ${monthlyLimit.toLocaleString()} análisis para este mes. Actualiza a Ultimate para un límite mayor.`,
    `Você atingiu seu limite de ${monthlyLimit.toLocaleString()} análises este mês. Atualize para o Ultimate para um limite maior.`,
    `您本月的 ${monthlyLimit.toLocaleString()} 次扫描已用完。升级至 Ultimate 可获更高限额。`,
    `لقد وصلت إلى حد ${monthlyLimit.toLocaleString()} عملية مسح هذا الشهر. قم بالترقية إلى Ultimate للحصول على حد أعلى.`,
    `Hai raggiunto il limite di ${monthlyLimit.toLocaleString()} scansioni per questo mese. Passa a Ultimate per un limite più alto.`,
    `Du hast dein Limit von ${monthlyLimit.toLocaleString()} Scans für diesen Monat erreicht. Upgrade zu Ultimate für ein höheres Limit.`,
    `Je hebt je limiet van ${monthlyLimit.toLocaleString()} scans voor deze maand bereikt. Upgrade naar Ultimate voor een hogere limiet.`,
    `Вы исчерпали лимит ${monthlyLimit.toLocaleString()} сканирований в этом месяце. Перейдите на Ultimate для более высокого лимита.`,
    `今月の ${monthlyLimit.toLocaleString()} 回のスキャン上限に達しました。Ultimateにアップグレードすると上限が上がります。`,
  );

  const ultimateBody = t(
    `You've reached the ${monthlyLimit.toLocaleString()}-scan soft-cap for this month. This limit protects service quality for all users and will reset next month.`,
    `Vous avez atteint le plafond de ${monthlyLimit.toLocaleString()} analyses ce mois-ci. Cette limite protège la qualité du service et se réinitialise le mois prochain.`,
    `Has alcanzado el límite de ${monthlyLimit.toLocaleString()} análisis este mes. Este límite protege la calidad del servicio y se restablece el próximo mes.`,
    `Você atingiu o limite de ${monthlyLimit.toLocaleString()} análises este mês. Este limite protege a qualidade do serviço e será redefinido no próximo mês.`,
    `您本月已达到 ${monthlyLimit.toLocaleString()} 次软上限。此限制旨在保护所有用户的服务质量，下月将重置。`,
    `لقد وصلت إلى الحد الأقصى ${monthlyLimit.toLocaleString()} هذا الشهر. هذا الحد يحمي جودة الخدمة ويتجدد الشهر القادم.`,
    `Hai raggiunto il limite di ${monthlyLimit.toLocaleString()} scansioni questo mese. Questo limite protegge la qualità del servizio e si azzera il mese prossimo.`,
    `Du hast das Soft-Limit von ${monthlyLimit.toLocaleString()} Scans diesen Monat erreicht. Dieses Limit schützt die Servicequalität und wird nächsten Monat zurückgesetzt.`,
    `Je hebt de soft-cap van ${monthlyLimit.toLocaleString()} scans deze maand bereikt. Deze limiet beschermt de servicekwaliteit en wordt volgende maand gereset.`,
    `Вы достигли мягкого лимита в ${monthlyLimit.toLocaleString()} сканирований за этот месяц. Лимит сбросится в следующем месяце.`,
    `今月の ${monthlyLimit.toLocaleString()} 回ソフトキャップに達しました。このサービス品質保護のための制限は来月リセットされます。`,
  );

  const bodyText =
    plan === "starter" ? starterBody :
    plan === "pro"     ? proBody     :
    ultimateBody;

  const upgradeLabel = t(
    "Upgrade Now",
    "Passer à la version supérieure",
    "Actualizar ahora",
    "Atualizar agora",
    "立即升级",
    "الترقية الآن",
    "Aggiorna ora",
    "Jetzt upgraden",
    "Nu upgraden",
    "Обновить сейчас",
    "今すぐアップグレード",
  );

  const dismissLabel = t(
    "Maybe later",
    "Plus tard",
    "Quizás más tarde",
    "Talvez mais tarde",
    "稍后再说",
    "ربما لاحقاً",
    "Forse dopo",
    "Vielleicht später",
    "Misschien later",
    "Позже",
    "後で",
  );

  const currentUsageLabel = t(
    "Current usage",
    "Utilisation actuelle",
    "Uso actual",
    "Uso atual",
    "当前使用情况",
    "الاستخدام الحالي",
    "Utilizzo attuale",
    "Aktuelle Nutzung",
    "Huidig gebruik",
    "Текущее использование",
    "現在の使用状況",
  );

  const scanWord = t("scans", "analyses", "análisis", "análises", "次扫描", "عملية مسح", "scansioni", "Scans", "scans", "сканирований", "回スキャン");

  const usageDisplay =
    plan === "starter"
      ? `${dailyScans} / ${dailyLimit} ${scanWord}`
      : `${monthlyScans.toLocaleString()} / ${monthlyLimit.toLocaleString()} ${scanWord}`;

  return (
    <Dialog open={open} onOpenChange={v => { if (!v) onClose(); }}>
      <DialogContent className="max-w-sm rounded-2xl p-6 text-center">
        <div className="flex justify-center mb-4">
          <img src="/gauge-logo.webp" className="h-14 w-14 object-contain" alt="CalorieVision" />
        </div>

        <DialogHeader className="mb-2">
          <DialogTitle className="text-xl font-bold">{title}</DialogTitle>
          <DialogDescription className="mt-2 text-sm text-muted-foreground leading-relaxed">
            {bodyText}
          </DialogDescription>
        </DialogHeader>

        {/* Usage pill */}
        <div className="mx-auto mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-muted/50 px-4 py-1.5 text-xs font-medium">
          <span className="text-muted-foreground">{currentUsageLabel}:</span>
          <span className="font-semibold text-foreground">{usageDisplay}</span>
        </div>

        {/* CTAs */}
        <div className="flex flex-col gap-3">
          {/* Only show upgrade button for starter and pro */}
          {plan !== "ultimate" && (
            <Button variant="hero" className="w-full gap-2" asChild>
              <LocalizedNavLink to="/pricing" onClick={onClose}>
                <Zap className="h-4 w-4" aria-hidden="true" />
                {upgradeLabel}
              </LocalizedNavLink>
            </Button>
          )}
          <Button variant="outline" className="w-full" onClick={onClose}>
            {dismissLabel}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
