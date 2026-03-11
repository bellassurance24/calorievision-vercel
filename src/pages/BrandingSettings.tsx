import { FormEvent, useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useBranding } from "@/contexts/BrandingContext";
import { Language, useLanguage } from "@/contexts/LanguageContext";
import { usePageMetadata } from "@/hooks/usePageMetadata";

const fileToDataUrl = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result;
      if (typeof result === "string") {
        resolve(result);
      } else {
        reject(new Error("Failed to read file"));
      }
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
};

const getBrandingCopy = (language: Language) => {
  const copies = {
    en: {
      metaTitle: "Branding Settings",
      metaDescription: "Upload your custom logo and favicon to brand CalorieVision.",
      eyebrow: "Branding",
      title: "Branding Settings",
      description:
        "Upload a custom logo and favicon to personalize CalorieVision. Changes apply across the entire website.",
      cardTitle: "Logo & Favicon",
      cardDescription:
        "Manage your primary logo and browser icons. Supported formats: PNG, JPG, SVG for the logo; PNG, JPG, ICO for the favicon.",
      logoLabel: "Logo upload",
      logoHelp:
        "Recommended: transparent PNG or SVG. Desktop width 160px, mobile width 120px. Aspect ratio is preserved automatically.",
      faviconLabel: "Favicon upload",
      faviconHelp:
        "Used for browser tabs and bookmarks. We automatically wire standard favicon sizes (16×16, 32×32, 180×180 Apple Touch).",
      footerToggleLabel: "Show logo in footer",
      footerToggleDescription: "When enabled, your logo appears centered in the footer at 120px width.",
      toastTitle: "Branding settings saved",
      toastDescription: "Your logo and favicon have been updated across the site.",
      saveButton: "Save branding",
      savingLabel: "Saving...",
      logoPreviewAlt: "Logo preview",
      faviconPreviewAltSmall: "Favicon preview small",
      faviconPreviewAltMedium: "Favicon preview medium",
      faviconPreviewAltLarge: "Favicon preview large",
      logoSizeLabel: "Logo size in header",
      logoSizeSmall: "Small",
      logoSizeMedium: "Medium (recommended)",
      logoSizeLarge: "Large",
      footerLogoSizeLabel: "Logo size in footer",
      footerLogoSizeSmall: "Small",
      footerLogoSizeMedium: "Medium (recommended)",
      footerLogoSizeLarge: "Large",
      footerLogoVisibilityLabel: "Footer logo visibility",
      footerLogoVisibilityAll: "Show on all pages",
      footerLogoVisibilityHome: "Show only on home page",
      footerLogoVisibilityNone: "Hide on all pages",
      logoAlignmentLabel: "Logo alignment in header",
      logoAlignmentLeft: "Left (inline with brand)",
      logoAlignmentCenter: "Centered above tagline",
    },
    fr: {
      metaTitle: "Paramètres de branding",
      metaDescription: "Téléchargez votre logo et favicon personnalisés pour marquer CalorieVision.",
      eyebrow: "Branding",
      title: "Paramètres de branding",
      description:
        "Téléchargez un logo et un favicon personnalisés pour personnaliser CalorieVision. Les changements s'appliquent à l'ensemble du site.",
      cardTitle: "Logo et favicon",
      cardDescription:
        "Gérez votre logo principal et les icônes du navigateur. Formats pris en charge : PNG, JPG, SVG pour le logo ; PNG, JPG, ICO pour le favicon.",
      logoLabel: "Téléverser un logo",
      logoHelp:
        "Recommandé : PNG transparent ou SVG. Largeur desktop 160 px, largeur mobile 120 px. Le ratio est automatiquement conservé.",
      faviconLabel: "Téléverser un favicon",
      faviconHelp:
        "Utilisé pour les onglets et favoris du navigateur. Nous configurons automatiquement les tailles standard (16×16, 32×32, 180×180 Apple Touch).",
      footerToggleLabel: "Afficher le logo dans le pied de page",
      footerToggleDescription:
        "Lorsque cette option est activée, votre logo apparaît centré dans le pied de page avec une largeur de 120 px.",
      toastTitle: "Paramètres de branding enregistrés",
      toastDescription: "Votre logo et votre favicon ont été mis à jour sur l'ensemble du site.",
      saveButton: "Enregistrer le branding",
      savingLabel: "Enregistrement...",
      logoPreviewAlt: "Aperçu du logo",
      faviconPreviewAltSmall: "Aperçu du favicon (petit)",
      faviconPreviewAltMedium: "Aperçu du favicon (moyen)",
      faviconPreviewAltLarge: "Aperçu du favicon (grand)",
      logoSizeLabel: "Taille du logo dans l’en-tête",
      logoSizeSmall: "Petit",
      logoSizeMedium: "Moyen (recommandé)",
      logoSizeLarge: "Grand",
      footerLogoSizeLabel: "Taille du logo dans le pied de 페이지",
      footerLogoSizeSmall: "Petit",
      footerLogoSizeMedium: "Moyen (recommandé)",
      footerLogoSizeLarge: "Grand",
      footerLogoVisibilityLabel: "Visibilité du logo dans le pied de page",
      footerLogoVisibilityAll: "Afficher sur toutes les pages",
      footerLogoVisibilityHome: "Afficher uniquement sur la page d’accueil",
      footerLogoVisibilityNone: "Masquer sur toutes les pages",
      logoAlignmentLabel: "Alignement du logo dans l’en-tête",
      logoAlignmentLeft: "Aligné à gauche",
      logoAlignmentCenter: "Centré au-dessus du slogan",
    },
    es: {
      metaTitle: "Ajustes de marca",
      metaDescription: "Sube tu logotipo e icono de sitio para personalizar CalorieVision.",
      eyebrow: "Marca",
      title: "Ajustes de marca",
      description:
        "Sube un logotipo y un icono de sitio personalizados para personalizar CalorieVision. Los cambios se aplican en todo el sitio web.",
      cardTitle: "Logo e icono",
      cardDescription:
        "Gestiona tu logotipo principal y los iconos del navegador. Formatos admitidos: PNG, JPG, SVG para el logotipo; PNG, JPG, ICO para el icono.",
      logoLabel: "Subir logotipo",
      logoHelp:
        "Recomendado: PNG transparente o SVG. Anchura en escritorio 160 px, en móvil 120 px. La relación de aspecto se mantiene automáticamente.",
      faviconLabel: "Subir icono de sitio",
      faviconHelp:
        "Se usa en las pestañas y marcadores del navegador. Conectamos automáticamente los tamaños estándar (16×16, 32×32, 180×180 Apple Touch).",
      footerToggleLabel: "Mostrar logotipo en el pie de página",
      footerToggleDescription:
        "Cuando está activado, tu logotipo aparece centrado en el pie de página con un ancho de 120 px.",
      toastTitle: "Ajustes de marca guardados",
      toastDescription: "Tu logotipo y tu icono de sitio se han actualizado en todo el sitio.",
      saveButton: "Guardar ajustes de marca",
      savingLabel: "Guardando...",
      logoPreviewAlt: "Vista previa del logotipo",
      faviconPreviewAltSmall: "Vista previa del icono (pequeño)",
      faviconPreviewAltMedium: "Vista previa del icono (mediano)",
      faviconPreviewAltLarge: "Vista previa del icono (grande)",
      logoSizeLabel: "Tamaño del logo en el encabezado",
      logoSizeSmall: "Pequeño",
      logoSizeMedium: "Mediano (recomendado)",
      logoSizeLarge: "Grande",
      footerLogoSizeLabel: "Tamaño del logo en el pie de página",
      footerLogoSizeSmall: "Pequeño",
      footerLogoSizeMedium: "Mediano (recomendado)",
      footerLogoSizeLarge: "Grande",
      footerLogoVisibilityLabel: "Visibilidad del logo en el pie de página",
      footerLogoVisibilityAll: "Mostrar en todas las páginas",
      footerLogoVisibilityHome: "Mostrar solo en la página de inicio",
      footerLogoVisibilityNone: "Ocultar en todas las páginas",
      logoAlignmentLabel: "Alineación del logo en el encabezado",
      logoAlignmentLeft: "Alineado a la izquierda",
      logoAlignmentCenter: "Centrado sobre el eslogan",
    },
    pt: {
      metaTitle: "Configurações de marca",
      metaDescription: "Carregue o seu logótipo e ícone do site para personalizar o CalorieVision.",
      eyebrow: "Marca",
      title: "Configurações de marca",
      description:
        "Carregue um logótipo e um ícone do site personalizados para personalizar o CalorieVision. As alterações são aplicadas em todo o site.",
      cardTitle: "Logótipo e ícone",
      cardDescription:
        "Gira o logótipo principal e os ícones do navegador. Formatos suportados: PNG, JPG, SVG para o logótipo; PNG, JPG, ICO para o ícone.",
      logoLabel: "Carregar logótipo",
      logoHelp:
        "Recomendado: PNG transparente ou SVG. Largura no desktop 160 px, no telemóvel 120 px. A proporção é preservada automaticamente.",
      faviconLabel: "Carregar ícone do site",
      faviconHelp:
        "Utilizado nos separadores e favoritos do navegador. Ligamos automaticamente os tamanhos padrão (16×16, 32×32, 180×180 Apple Touch).",
      footerToggleLabel: "Mostrar logótipo no rodapé",
      footerToggleDescription:
        "Quando ativado, o seu logótipo aparece centrado no rodapé com 120 px de largura.",
      toastTitle: "Configurações de marca guardadas",
      toastDescription: "O seu logótipo e o ícone do site foram atualizados em todo o site.",
      saveButton: "Guardar configurações de marca",
      savingLabel: "A guardar...",
      logoPreviewAlt: "Pré-visualização do logótipo",
      faviconPreviewAltSmall: "Pré-visualização do ícone (pequeno)",
      faviconPreviewAltMedium: "Pré-visualização do ícone (médio)",
      faviconPreviewAltLarge: "Pré-visualização do ícone (grande)",
      logoSizeLabel: "Tamanho do logótipo no cabeçalho",
      logoSizeSmall: "Pequeno",
      logoSizeMedium: "Médio (recomendado)",
      logoSizeLarge: "Grande",
      footerLogoSizeLabel: "Tamanho do logótipo no rodapé",
      footerLogoSizeSmall: "Pequeno",
      footerLogoSizeMedium: "Médio (recomendado)",
      footerLogoSizeLarge: "Grande",
      footerLogoVisibilityLabel: "Visibilidade do logótipo no rodapé",
      footerLogoVisibilityAll: "Mostrar em todas as páginas",
      footerLogoVisibilityHome: "Mostrar apenas na página inicial",
      footerLogoVisibilityNone: "Ocultar em todas as páginas",
      logoAlignmentLabel: "Alinhamento do logótipo no cabeçalho",
      logoAlignmentLeft: "Alinhado à esquerda",
      logoAlignmentCenter: "Centrado acima do slogan",
    },
    zh: {
      metaTitle: "品牌设置",
      metaDescription: "上传自定义徽标和网站图标，为 CalorieVision 设置品牌。",
      eyebrow: "品牌",
      title: "品牌设置",
      description:
        "上传自定义徽标和网站图标，个性化 CalorieVision。更改会应用到整个网站。",
      cardTitle: "徽标与网站图标",
      cardDescription:
        "管理主徽标和浏览器图标。支持格式：徽标 PNG、JPG、SVG；网站图标 PNG、JPG、ICO。",
      logoLabel: "上传徽标",
      logoHelp:
        "推荐使用透明 PNG 或 SVG。桌面端宽度 160 像素，移动端宽度 120 像素。我们会自动保持纵横比。",
      faviconLabel: "上传网站图标",
      faviconHelp:
        "用于浏览器标签页和书签。我们会自动连接标准图标尺寸（16×16、32×32、180×180 Apple Touch）。",
      footerToggleLabel: "在页脚显示徽标",
      footerToggleDescription: "启用后，您的徽标会以 120 像素宽度居中显示在页脚。",
      toastTitle: "品牌设置已保存",
      toastDescription: "您的徽标和网站图标已在整个站点更新。",
      saveButton: "保存品牌设置",
      savingLabel: "保存中...",
      logoPreviewAlt: "徽标预览",
      faviconPreviewAltSmall: "小图标预览（小）",
      faviconPreviewAltMedium: "小图标预览（中）",
      faviconPreviewAltLarge: "小图标预览（大）",
      logoSizeLabel: "页眉中徽标大小",
      logoSizeSmall: "小",
      logoSizeMedium: "中（推荐）",
      logoSizeLarge: "大",
      footerLogoSizeLabel: "页脚中徽标大小",
      footerLogoSizeSmall: "小",
      footerLogoSizeMedium: "中（推荐）",
      footerLogoSizeLarge: "大",
      footerLogoVisibilityLabel: "页脚中徽标可见性",
      footerLogoVisibilityAll: "在所有页面显示",
      footerLogoVisibilityHome: "仅在首页显示",
      footerLogoVisibilityNone: "在所有页面隐藏",
      logoAlignmentLabel: "页眉中徽标对齐方式",
      logoAlignmentLeft: "左对齐",
      logoAlignmentCenter: "居中显示在标语上方",
    },
    ar: {
      metaTitle: "إعدادات الهوية البصرية",
      metaDescription: "قم برفع شعارك وأيقونة الموقع لتخصيص مظهر CalorieVision.",
      eyebrow: "الهوية البصرية",
      title: "إعدادات الهوية البصرية",
      description:
        "ارفع شعارًا وأيقونة مخصّصين لتخصيص تجربة CalorieVision بما يناسب علامتك. يتم تطبيق التغييرات على الموقع بالكامل.",
      cardTitle: "الشعار وأيقونة الموقع",
      cardDescription:
        "إدارة شعارك الرئيسي وأيقونات المتصفح. الصيغ المدعومة: PNG وJPG وSVG للشعار، وPNG وJPG وICO لأيقونة الموقع.",
      logoLabel: "رفع الشعار",
      logoHelp:
        "يُفضّل استخدام PNG بخلفية شفافة أو SVG. العرض المقترح على الكمبيوتر 160 بكسل، وعلى الهاتف 120 بكسل، مع الحفاظ التلقائي على النسبة.",
      faviconLabel: "رفع أيقونة الموقع",
      faviconHelp:
        "تُستخدم في علامات التبويب والإشارات المرجعية بالمتصفح. نقوم تلقائيًا بتوصيل المقاسات القياسية (16×16، 32×32، 180×180 لأجهزة Apple).",
      footerToggleLabel: "إظهار الشعار في الجزء السفلي",
      footerToggleDescription:
        "عند التفعيل، يظهر شعارك في منتصف تذييل الموقع بعرض 120 بكسل.",
      toastTitle: "تم حفظ إعدادات الهوية البصرية",
      toastDescription: "تم تحديث الشعار وأيقونة الموقع في جميع صفحات الموقع.",
      saveButton: "حفظ الإعدادات",
      savingLabel: "جارٍ الحفظ...",
      logoPreviewAlt: "معاينة الشعار",
      faviconPreviewAltSmall: "معاينة الأيقونة (صغيرة)",
      faviconPreviewAltMedium: "معاينة الأيقونة (متوسطة)",
      faviconPreviewAltLarge: "معاينة الأيقونة (كبيرة)",
      logoSizeLabel: "حجم الشعار في الرأس",
      logoSizeSmall: "صغير",
      logoSizeMedium: "متوسط (مستحسن)",
      logoSizeLarge: "كبير",
      footerLogoSizeLabel: "حجم الشعار في التذييل",
      footerLogoSizeSmall: "صغير",
      footerLogoSizeMedium: "متوسط (مستحسن)",
      footerLogoSizeLarge: "كبير",
      footerLogoVisibilityLabel: "ظهور الشعار في التذييل",
      footerLogoVisibilityAll: "إظهاره في جميع الصفحات",
      footerLogoVisibilityHome: "إظهاره في الصفحة الرئيسية فقط",
      footerLogoVisibilityNone: "إخفاؤه في جميع الصفحات",
      logoAlignmentLabel: "محاذاة الشعار في الرأس",
      logoAlignmentLeft: "محاذاة إلى اليسار",
      logoAlignmentCenter: "محاذاة في المنتصف فوق الشعار النصي",
    },
  } as const;

  return copies[language] ?? copies.en;
};

const BrandingSettings = () => {
  const { toast } = useToast();
  const {
    logoDataUrl,
    faviconDataUrl,
    showLogoInFooter,
    logoSize,
    logoAlignment,
    footerLogoSize,
    footerLogoVisibility,
    updateBranding,
  } = useBranding();
  const { language } = useLanguage();
  const copy = getBrandingCopy(language);

  const effectiveLogoSize = logoSize ?? "md";
  const effectiveLogoAlignment = logoAlignment ?? "left";
  const effectiveFooterLogoSize = footerLogoSize ?? "md";
  const effectiveFooterLogoVisibility = footerLogoVisibility ?? "all";

  const [logoPreview, setLogoPreview] = useState<string | null>(logoDataUrl);
  const [faviconPreview, setFaviconPreview] = useState<string | null>(faviconDataUrl);
  const [footerLogo, setFooterLogo] = useState<boolean>(showLogoInFooter);
  const [isSaving, setIsSaving] = useState(false);

  usePageMetadata({
    title: `${copy.metaTitle} | CalorieVision`,
    description: copy.metaDescription,
    path: "/branding-settings",
  });

  useEffect(() => {
    setLogoPreview(logoDataUrl);
  }, [logoDataUrl]);

  useEffect(() => {
    setFaviconPreview(faviconDataUrl);
  }, [faviconDataUrl]);

  useEffect(() => {
    setFooterLogo(showLogoInFooter);
  }, [showLogoInFooter]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setIsSaving(true);

    updateBranding({
      logoDataUrl: logoPreview ?? null,
      faviconDataUrl: faviconPreview ?? null,
      showLogoInFooter: footerLogo,
    });

    setIsSaving(false);

    toast({
      title: copy.toastTitle,
      description: copy.toastDescription,
    });
  };

  const handleLogoChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const dataUrl = await fileToDataUrl(file);
    setLogoPreview(dataUrl);
    updateBranding({ logoDataUrl: dataUrl });
  };

  const handleFaviconChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const dataUrl = await fileToDataUrl(file);
    setFaviconPreview(dataUrl);
    updateBranding({ faviconDataUrl: dataUrl });
  };

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <p className="eyebrow">{copy.eyebrow}</p>
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">{copy.title}</h1>
        <p className="max-w-2xl text-sm text-muted-foreground">{copy.description}</p>
      </header>

      <Card className="section-card">
        <form onSubmit={handleSubmit} className="space-y-6">
          <CardHeader>
            <CardTitle>{copy.cardTitle}</CardTitle>
            <CardDescription>{copy.cardDescription}</CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-3">
                <Label htmlFor="logo-upload">{copy.logoLabel}</Label>
                <Input
                  id="logo-upload"
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/svg+xml"
                  onChange={handleLogoChange}
                />
                <p className="text-xs text-muted-foreground">{copy.logoHelp}</p>
                {logoPreview && (
                  <div className="mt-2 flex items-center justify-start rounded-md border border-dashed p-3">
                    <img
                      src={logoPreview}
                      alt={copy.logoPreviewAlt}
                      className="h-auto w-[160px] object-contain md:w-[200px]"
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <Label htmlFor="favicon-upload">{copy.faviconLabel}</Label>
                <Input
                  id="favicon-upload"
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/x-icon,image/vnd.microsoft.icon"
                  onChange={handleFaviconChange}
                />
                <p className="text-xs text-muted-foreground">{copy.faviconHelp}</p>
                {faviconPreview && (
                  <div className="mt-2 flex items-center gap-3 rounded-md border border-dashed p-3">
                    <img
                      src={faviconPreview}
                      alt={copy.faviconPreviewAltSmall}
                      className="h-4 w-4 object-contain"
                      loading="lazy"
                      decoding="async"
                    />
                    <img
                      src={faviconPreview}
                      alt={copy.faviconPreviewAltMedium}
                      className="h-6 w-6 object-contain"
                      loading="lazy"
                      decoding="async"
                    />
                    <img
                      src={faviconPreview}
                      alt={copy.faviconPreviewAltLarge}
                      className="h-10 w-10 object-contain"
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between rounded-md border px-3 py-2">
              <div className="space-y-0.5">
                <Label htmlFor="footer-logo-toggle">{copy.footerToggleLabel}</Label>
                <p className="text-xs text-muted-foreground">{copy.footerToggleDescription}</p>
              </div>
              <Switch
                id="footer-logo-toggle"
                checked={footerLogo}
                onCheckedChange={(checked) => {
                  setFooterLogo(checked);
                  updateBranding({ showLogoInFooter: checked });
                }}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="logo-size-select">{copy.logoSizeLabel}</Label>
                <Select
                  value={effectiveLogoSize}
                  onValueChange={(value) => updateBranding({ logoSize: value as "sm" | "md" | "lg" })}
                >
                  <SelectTrigger id="logo-size-select" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sm">{copy.logoSizeSmall}</SelectItem>
                    <SelectItem value="md">{copy.logoSizeMedium}</SelectItem>
                    <SelectItem value="lg">{copy.logoSizeLarge}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="footer-logo-size-select">{copy.footerLogoSizeLabel}</Label>
                <Select
                  value={effectiveFooterLogoSize}
                  onValueChange={(value) => updateBranding({ footerLogoSize: value as "sm" | "md" | "lg" })}
                >
                  <SelectTrigger id="footer-logo-size-select" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sm">{copy.footerLogoSizeSmall}</SelectItem>
                    <SelectItem value="md">{copy.footerLogoSizeMedium}</SelectItem>
                    <SelectItem value="lg">{copy.footerLogoSizeLarge}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="footer-logo-visibility-select">{copy.footerLogoVisibilityLabel}</Label>
                <Select
                  value={effectiveFooterLogoVisibility}
                  onValueChange={(value) =>
                    updateBranding({ footerLogoVisibility: value as "all" | "home" | "none" })
                  }
                >
                  <SelectTrigger id="footer-logo-visibility-select" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{copy.footerLogoVisibilityAll}</SelectItem>
                    <SelectItem value="home">{copy.footerLogoVisibilityHome}</SelectItem>
                    <SelectItem value="none">{copy.footerLogoVisibilityNone}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="logo-alignment-select">{copy.logoAlignmentLabel}</Label>
                <Select
                  value={effectiveLogoAlignment}
                  onValueChange={(value) => updateBranding({ logoAlignment: value as "left" | "center" })}
                >
                  <SelectTrigger id="logo-alignment-select" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="left">{copy.logoAlignmentLeft}</SelectItem>
                    <SelectItem value="center">{copy.logoAlignmentCenter}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex justify-end gap-2">
            <Button type="submit" disabled={isSaving}>
              {isSaving ? copy.savingLabel : copy.saveButton}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </section>
  );
};

export default BrandingSettings;
