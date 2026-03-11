import { FormEvent, useState } from "react";
import { z } from "zod";
import { LocalizedNavLink } from "@/components/LocalizedNavLink";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { usePageMetadata } from "@/hooks/usePageMetadata";
import { useLanguage } from "@/contexts/LanguageContext";
import { EmailWithFallback } from "@/components/EmailWithFallback";

import { supabase } from "@/integrations/supabase/client";

const contactSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
  email: z.string().trim().email("Invalid email address").max(255, "Email must be less than 255 characters"),
  message: z.string().trim().min(1, "Message is required").max(5000, "Message must be less than 5000 characters"),
});

const Contact = () => {
  const { toast } = useToast();
  const { language } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const t = (en: string, fr: string, es: string, pt?: string, zh?: string, ar?: string, it?: string, de?: string, nl?: string) => {
    if (language === "fr") return fr;
    if (language === "es") return es;
    if (language === "pt") return pt ?? en;
    if (language === "zh") return zh ?? en;
    if (language === "ar") return ar ?? en;
    if (language === "it") return it ?? en;
    if (language === "de") return de ?? en;
    if (language === "nl") return nl ?? en;
    return en;
  };

  usePageMetadata({
    title: t(
      "Contact CalorieVision – Questions, Feedback, Support",
      "Contacter CalorieVision – Questions, retours, assistance",
      "Contactar con CalorieVision – Preguntas, comentarios, soporte",
      "Contactar o CalorieVision – Perguntas, comentários, suporte",
      "联系 CalorieVision – 问题、反馈、支持",
      "اتصل بـ CalorieVision – أسئلة، ملاحظات، ودعم",
      "Contatta CalorieVision – Domande, feedback, supporto",
      "CalorieVision kontaktieren – Fragen, Feedback, Support",
      "Contact CalorieVision – Vragen, feedback, ondersteuning",
    ),
    description: t(
      "Get in touch with the CalorieVision team with questions, feedback, or suggestions.",
      "Contactez l'équipe CalorieVision pour vos questions, retours ou suggestions.",
      "Ponte en contacto con el equipo de CalorieVision para enviar preguntas, comentarios o sugerencias.",
      "Fale com a equipa do CalorieVision para enviar perguntas, comentários ou sugestões.",
      "联系 CalorieVision 团队，提出问题、反馈或建议。",
      "تواصل مع فريق CalorieVision لطرح أسئلة أو إرسال ملاحظات أو اقتراحات.",
      "Contatta il team di CalorieVision per domande, feedback o suggerimenti.",
      "Kontaktieren Sie das CalorieVision-Team bei Fragen, Feedback oder Vorschlägen.",
      "Neem contact op met het CalorieVision-team voor vragen, feedback of suggesties.",
    ),
    path: "/contact",
  });

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    
    const validationResult = contactSchema.safeParse({
      name: formData.get("from_name"),
      email: formData.get("from_email"),
      message: formData.get("message"),
    });

    if (!validationResult.success) {
      const firstError = validationResult.error.errors[0];
      toast({
        title: t("Validation error", "Erreur de validation", "Error de validación", "Erro de validação", "验证错误", "خطأ في التحقق", "Errore di validazione", "Validierungsfehler", "Validatiefout"),
        description: firstError.message,
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const { error } = await supabase.functions.invoke("send-contact-email", {
        body: {
          name: validationResult.data.name,
          email: validationResult.data.email,
          message: validationResult.data.message,
        },
      });

      if (error) throw error;
      
      form.reset();
      
      toast({
        title: t("Message sent", "Message envoyé", "Mensaje enviado", "Mensagem enviada", "消息已发送", "تم إرسال الرسالة", "Messaggio inviato", "Nachricht gesendet", "Bericht verzonden"),
        description: t(
          "Thank you for reaching out. We will get back to you at your email address soon.",
          "Merci pour votre message. Nous reviendrons vers vous à votre adresse e-mail dès que possible.",
          "Gracias por escribirnos. Te responderemos pronto a tu dirección de correo electrónico.",
          "Obrigado por entrar em contacto. Vamos responder para o seu endereço de e-mail em breve.",
          "感谢您的联系。我们将尽快通过电子邮件回复您。",
          "شكرًا لتواصلك معنا. سنعاود الاتصال بك على بريدك الإلكتروني في أقرب وقت ممكن.",
          "Grazie per averci contattato. Ti risponderemo al tuo indirizzo email il prima possibile.",
          "Vielen Dank für Ihre Nachricht. Wir werden uns so schnell wie möglich an Ihre E-Mail-Adresse melden.",
          "Bedankt voor uw bericht. We nemen zo snel mogelijk contact met u op via uw e-mailadres.",
        ),
      });
    } catch (error) {
      console.error("Contact form error:", error);
      toast({
        title: t("Error", "Erreur", "Error", "Erro", "错误", "خطأ", "Errore", "Fehler", "Fout"),
        description: t(
          "Failed to send message. Please try again.",
          "Échec de l'envoi du message. Veuillez réessayer.",
          "Error al enviar el mensaje. Por favor, inténtalo de nuevo.",
          "Falha ao enviar mensagem. Por favor, tente novamente.",
          "发送消息失败，请重试。",
          "فشل في إرسال الرسالة. يرجى المحاولة مرة أخرى.",
          "Invio del messaggio fallito. Riprova.",
          "Nachricht konnte nicht gesendet werden. Bitte versuchen Sie es erneut.",
          "Verzenden mislukt. Probeer het opnieuw.",
        ),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="section-card">
      <p className="eyebrow">
        {t("Get in touch", "Contactez-nous", "Ponte en contacto", "Fale connosco", "联系我们", "تواصل معنا", "Contattaci", "Kontakt aufnehmen", "Neem contact op")}
      </p>
      <h1 className="mb-3 text-3xl font-semibold md:text-4xl">
        {t("Contact us", "Nous contacter", "Contacta con nosotros", "Contacte-nos", "联系我们", "اتصل بنا", "Contattaci", "Kontaktieren Sie uns", "Neem contact met ons op")}
      </h1>
      <p className="mb-6 max-w-2xl text-sm text-muted-foreground md:text-base">
        {t(
          "Have questions, suggestions, or feedback? We would love to hear from you. Use the form below and we will respond as soon as we can.",
          "Vous avez des questions, des suggestions ou des retours ? Nous serions ravis de vous lire. Utilisez le formulaire ci-dessous et nous vous répondrons dès que possible.",
          "¿Tienes preguntas, sugerencias o comentarios? Nos encantará leerte. Usa el formulario de abajo y te responderemos lo antes posible.",
          "Tem perguntas, sugestões ou comentários? Vamos gostar de o ouvir. Utilize o formulário abaixo e responderemos assim que possível.",
          "有问题、建议或反馈？我们很乐意听取您的意见。请使用下面的表格，我们会尽快回复。",
          "هل لديك أسئلة أو اقتراحات أو ملاحظات؟ يسعدنا سماع رأيك. استخدم النموذج أدناه وسنرد عليك في أقرب فرصة.",
          "Hai domande, suggerimenti o feedback? Ci farebbe piacere sentirti. Usa il modulo qui sotto e ti risponderemo il prima possibile.",
          "Haben Sie Fragen, Vorschläge oder Feedback? Wir freuen uns von Ihnen zu hören. Nutzen Sie das Formular unten und wir antworten so schnell wie möglich.",
          "Heeft u vragen, suggesties of feedback? We horen graag van u. Gebruik het onderstaande formulier en we reageren zo snel mogelijk.",
        )}
      </p>

      <div className="grid gap-8 md:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="hidden" name="to_email" value="support@calorievision.online" />
          <div className="space-y-1">
            <label htmlFor="name" className="text-sm font-medium">
              {t("Name", "Nom", "Nombre", "Nome", "姓名", "الاسم", "Nome", "Name", "Naam")}
            </label>
            <Input
              id="name"
              name="from_name"
              autoComplete="name"
              placeholder={t("Your name", "Votre nom", "Tu nombre", "O seu nome", "您的姓名", "اسمك", "Il tuo nome", "Ihr Name", "Uw naam")}
              required
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="email" className="text-sm font-medium">
              {t("Email", "E-mail", "Correo electrónico", "E-mail", "电子邮件", "البريد الإلكتروني", "Email", "E-Mail", "E-mail")}
            </label>
            <Input
              id="email"
              name="from_email"
              type="email"
              autoComplete="email"
              placeholder={t(
                "you@example.com",
                "vous@example.com",
                "tú@ejemplo.com",
                "voce@exemplo.com",
                "you@example.com",
                "you@example.com",
                "tu@esempio.com",
                "sie@beispiel.com",
                "u@voorbeeld.com",
              )}
              required
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="message" className="text-sm font-medium">
              {t("Your message", "Votre message", "Tu mensaje", "A sua mensagem", "您的留言", "رسالتك", "Il tuo messaggio", "Ihre Nachricht", "Uw bericht")}
            </label>
            <Textarea
              id="message"
              name="message"
              rows={5}
              placeholder={t(
                "How can we help?",
                "Comment pouvons-nous vous aider ?",
                "¿En qué podemos ayudarte?",
                "Como podemos ajudar?",
                "我们能帮您什么？",
                "كيف يمكننا مساعدتك؟",
                "Come possiamo aiutarti?",
                "Wie können wir Ihnen helfen?",
                "Hoe kunnen we u helpen?",
              )}
              required
            />
          </div>

          <Button type="submit" variant="hero" size="lg" className="mt-2" disabled={isSubmitting}>
            {isSubmitting 
              ? t("Sending...", "Envoi en cours...", "Enviando...", "A enviar...", "发送中...", "جارٍ الإرسال...", "Invio in corso...", "Wird gesendet...", "Verzenden...")
              : t("Send message", "Envoyer le message", "Enviar mensaje", "Enviar mensagem", "发送消息", "إرسال الرسالة", "Invia messaggio", "Nachricht senden", "Bericht verzenden")
            }
          </Button>

          <p className="text-xs text-muted-foreground">
            {t(
              "We will only use your email address to reply to your message.",
              "Nous utiliserons votre adresse e-mail uniquement pour répondre à votre message.",
              "Solo utilizaremos tu dirección de correo electrónico para responder a tu mensaje.",
              "Só utilizaremos o seu endereço de e-mail para responder à sua mensagem.",
              "我们仅使用您的电子邮件地址回复您的消息。",
              "سنستخدم بريدك الإلكتروني فقط للرد على رسالتك، ولن نستخدمه لأي أغراض تسويقية دون موافقتك.",
              "Utilizzeremo il tuo indirizzo email solo per rispondere al tuo messaggio.",
              "Wir verwenden Ihre E-Mail-Adresse nur, um auf Ihre Nachricht zu antworten.",
              "We gebruiken uw e-mailadres alleen om op uw bericht te reageren.",
            )}
          </p>
        </form>

        <aside className="space-y-4 text-sm text-muted-foreground">
          <div>
            <h2 className="mb-1 text-base font-semibold text-foreground">
              {t("Support email", "E-mail de support", "Correo de soporte", "E-mail de suporte", "支持邮箱", "بريد الدعم", "Email di supporto", "Support-E-Mail", "Ondersteuning e-mail")}
            </h2>
            <p>
              <EmailWithFallback />
            </p>
          </div>
          <div>
            <h2 className="mb-1 text-base font-semibold text-foreground">
              {t(
                "Privacy notice",
                "Avis de confidentialité",
                "Aviso de privacidad",
                "Aviso de privacidade",
                "隐私声明",
                "إشعار الخصوصية",
                "Informativa sulla privacy",
                "Datenschutzhinweis",
                "Privacyverklaring",
              )}
            </h2>
            <p>
              {t(
                "We only use your message and email address to respond to your enquiry. Messages sent through this form are not used for marketing without your explicit consent.",
                "Nous utilisons uniquement votre message et votre adresse e-mail pour répondre à votre demande. Les messages envoyés via ce formulaire ne sont pas utilisés à des fins de marketing sans votre consentement explicite.",
                "Solo utilizamos tu mensaje y tu dirección de correo electrónico para responder a tu consulta. Los mensajes enviados a través de este formulario no se utilizan con fines de marketing sin tu consentimiento explícito.",
                "Usamos apenas a sua mensagem e o seu endereço de e-mail para responder ao seu pedido. As mensagens enviadas através deste formulário não são usadas para fins de marketing sem o seu consentimento explícito.",
                "我们仅使用您的消息和电子邮件地址来回复您的询问。未经您的明确同意，通过此表格发送的消息不会用于营销目的。",
                "نستخدم رسالتك وبريدك الإلكتروني فقط للرد على استفسارك. لن نستخدم البيانات المرسلة عبر هذا النموذج في أي حملات تسويقية دون موافقتك الصريحة.",
                "Utilizziamo il tuo messaggio e indirizzo email solo per rispondere alla tua richiesta. I messaggi inviati tramite questo modulo non vengono utilizzati per scopi di marketing senza il tuo consenso esplicito.",
                "Wir verwenden Ihre Nachricht und E-Mail-Adresse nur, um auf Ihre Anfrage zu antworten. Über dieses Formular gesendete Nachrichten werden ohne Ihre ausdrückliche Zustimmung nicht für Marketingzwecke verwendet.",
                "We gebruiken uw bericht en e-mailadres alleen om op uw vraag te reageren. Berichten die via dit formulier worden verzonden, worden niet gebruikt voor marketing zonder uw uitdrukkelijke toestemming.",
              )}
            </p>
          </div>
        </aside>
      </div>

      {/* Additional information sections */}
      <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-2xl bg-secondary/60 p-5">
          <h3 className="mb-2 text-base font-semibold text-foreground">
            {t("Why contact CalorieVision?", "Pourquoi contacter CalorieVision ?", "¿Por qué contactar con CalorieVision?", "Porquê contactar o CalorieVision?", "为什么联系 CalorieVision？", "لماذا تتواصل مع CalorieVision؟", "Perché contattare CalorieVision?", "Warum CalorieVision kontaktieren?", "Waarom contact opnemen met CalorieVision?")}
          </h3>
          <p className="text-sm text-muted-foreground">
            {t(
              "We welcome general inquiries, feature suggestions, feedback on your experience, or any questions about how CalorieVision works.",
              "Nous accueillons les demandes générales, les suggestions de fonctionnalités, les retours sur votre expérience ou toute question sur le fonctionnement de CalorieVision.",
              "Damos la bienvenida a consultas generales, sugerencias de funciones, comentarios sobre tu experiencia o cualquier pregunta sobre cómo funciona CalorieVision.",
              "Damos as boas-vindas a consultas gerais, sugestões de funcionalidades, feedback sobre a sua experiência ou quaisquer perguntas sobre como o CalorieVision funciona.",
              "我们欢迎一般咨询、功能建议、体验反馈或任何关于 CalorieVision 工作原理的问题。",
              "نرحب بالاستفسارات العامة واقتراحات الميزات والتعليقات على تجربتك أو أي أسئلة حول كيفية عمل CalorieVision.",
              "Accogliamo richieste generali, suggerimenti sulle funzionalità, feedback sulla tua esperienza o qualsiasi domanda su come funziona CalorieVision.",
              "Wir freuen uns über allgemeine Anfragen, Funktionsvorschläge, Feedback zu Ihrer Erfahrung oder Fragen zur Funktionsweise von CalorieVision.",
              "We verwelkomen algemene vragen, functiesuggesties, feedback over uw ervaring of vragen over hoe CalorieVision werkt.",
            )}
          </p>
        </div>

        <div className="rounded-2xl bg-secondary/60 p-5">
          <h3 className="mb-2 text-base font-semibold text-foreground">
            {t("Response time", "Délai de réponse", "Tiempo de respuesta", "Tempo de resposta", "响应时间", "وقت الاستجابة", "Tempo di risposta", "Antwortzeit", "Reactietijd")}
          </h3>
          <p className="text-sm text-muted-foreground">
            {t(
              "We aim to respond to all messages within 24–72 business hours. Please allow additional time during weekends or holidays.",
              "Nous nous efforçons de répondre à tous les messages dans un délai de 24 à 72 heures ouvrables. Veuillez prévoir un délai supplémentaire pendant les week-ends ou les jours fériés.",
              "Nos esforzamos por responder a todos los mensajes en un plazo de 24 a 72 horas laborables. Por favor, permita tiempo adicional durante los fines de semana o días festivos.",
              "Procuramos responder a todas as mensagens num prazo de 24 a 72 horas úteis. Por favor, considere tempo adicional durante fins de semana ou feriados.",
              "我们的目标是在24-72个工作小时内回复所有消息。周末或节假日期间可能需要更多时间。",
              "نهدف إلى الرد على جميع الرسائل خلال 24-72 ساعة عمل. يرجى السماح بوقت إضافي خلال عطلات نهاية الأسبوع أو العطلات.",
              "Ci impegniamo a rispondere a tutti i messaggi entro 24-72 ore lavorative. Si prega di concedere tempo aggiuntivo durante i fine settimana o le festività.",
              "Wir bemühen uns, alle Nachrichten innerhalb von 24–72 Geschäftsstunden zu beantworten. Bitte rechnen Sie an Wochenenden oder Feiertagen mit längeren Wartezeiten.",
              "We streven ernaar om alle berichten binnen 24-72 werkuren te beantwoorden. Houd rekening met extra tijd tijdens weekends of feestdagen.",
            )}
          </p>
        </div>

        <div className="rounded-2xl bg-secondary/60 p-5">
          <h3 className="mb-2 text-base font-semibold text-foreground">
            {t("Legal & compliance notice", "Avis juridique et conformité", "Aviso legal y de cumplimiento", "Aviso legal e de conformidade", "法律与合规声明", "إشعار قانوني وامتثال", "Avviso legale e conformità", "Rechts- und Compliance-Hinweis", "Juridische en compliance-kennisgeving")}
          </h3>
          <p className="text-sm text-muted-foreground">
            {t(
              "CalorieVision provides educational calorie estimates only. We do not provide medical, dietary, or health advice. Always consult a qualified professional for health-related decisions.",
              "CalorieVision fournit uniquement des estimations de calories à des fins éducatives. Nous ne fournissons pas de conseils médicaux, diététiques ou de santé. Consultez toujours un professionnel qualifié pour les décisions liées à la santé.",
              "CalorieVision proporciona solo estimaciones de calorías con fines educativos. No proporcionamos asesoramiento médico, dietético o de salud. Consulte siempre a un profesional cualificado para decisiones relacionadas con la salud.",
              "O CalorieVision fornece apenas estimativas de calorias para fins educativos. Não fornecemos aconselhamento médico, dietético ou de saúde. Consulte sempre um profissional qualificado para decisões relacionadas com a saúde.",
              "CalorieVision 仅提供教育性的卡路里估算。我们不提供医疗、饮食或健康建议。健康相关决定请咨询专业人士。",
              "يقدم CalorieVision تقديرات تعليمية للسعرات الحرارية فقط. نحن لا نقدم نصائح طبية أو غذائية أو صحية. استشر دائمًا متخصصًا مؤهلاً للقرارات المتعلقة بالصحة.",
              "CalorieVision fornisce solo stime caloriche a scopo educativo. Non forniamo consigli medici, dietetici o sanitari. Consulta sempre un professionista qualificato per decisioni relative alla salute.",
              "CalorieVision bietet nur Kalorienschätzungen zu Bildungszwecken. Wir bieten keine medizinischen, diätetischen oder gesundheitlichen Ratschläge. Konsultieren Sie immer einen qualifizierten Fachmann für gesundheitsbezogene Entscheidungen.",
              "CalorieVision biedt alleen educatieve calorieschattingen. We bieden geen medisch, dieet- of gezondheidsadvies. Raadpleeg altijd een gekwalificeerde professional voor gezondheidsgerelateerde beslissingen.",
            )}
          </p>
        </div>

        <div className="rounded-2xl bg-secondary/60 p-5">
          <h3 className="mb-2 text-base font-semibold text-foreground">
            {t("Data privacy", "Confidentialité des données", "Privacidad de datos", "Privacidade de dados", "数据隐私", "خصوصية البيانات", "Privacy dei dati", "Datenschutz", "Gegevensprivacy")}
          </h3>
          <p className="text-sm text-muted-foreground">
            {t(
              "Your data is handled in accordance with our Privacy Policy. We do not sell or share your personal information with third parties for marketing purposes.",
              "Vos données sont traitées conformément à notre Politique de confidentialité. Nous ne vendons ni ne partageons vos informations personnelles avec des tiers à des fins de marketing.",
              "Sus datos se manejan de acuerdo con nuestra Política de privacidad. No vendemos ni compartimos su información personal con terceros para fines de marketing.",
              "Os seus dados são tratados de acordo com a nossa Política de Privacidade. Não vendemos nem partilhamos as suas informações pessoais com terceiros para fins de marketing.",
              "您的数据按照我们的隐私政策进行处理。我们不会出于营销目的向第三方出售或分享您的个人信息。",
              "تتم معالجة بياناتك وفقًا لسياسة الخصوصية الخاصة بنا. نحن لا نبيع أو نشارك معلوماتك الشخصية مع أطراف ثالثة لأغراض التسويق.",
              "I tuoi dati vengono gestiti in conformità con la nostra Informativa sulla privacy. Non vendiamo né condividiamo le tue informazioni personali con terze parti per scopi di marketing.",
              "Ihre Daten werden gemäß unserer Datenschutzrichtlinie behandelt. Wir verkaufen oder teilen Ihre persönlichen Daten nicht mit Dritten zu Marketingzwecken.",
              "Uw gegevens worden verwerkt in overeenstemming met ons Privacybeleid. We verkopen of delen uw persoonlijke informatie niet met derden voor marketingdoeleinden.",
            )}{" "}
            <LocalizedNavLink to="/privacy-policy" className="text-primary underline-offset-4 hover:underline">
              {t("Read our Privacy Policy", "Lire notre Politique de confidentialité", "Leer nuestra Política de privacidad", "Ler a nossa Política de Privacidade", "阅读我们的隐私政策", "اقرأ سياسة الخصوصية", "Leggi la nostra Informativa sulla privacy", "Lesen Sie unsere Datenschutzrichtlinie", "Lees ons Privacybeleid")}
            </LocalizedNavLink>
          </p>
        </div>

        <div className="rounded-2xl bg-secondary/60 p-5 md:col-span-2 lg:col-span-2">
          <h3 className="mb-2 text-base font-semibold text-foreground">
            {t("Business transparency", "Transparence commerciale", "Transparencia empresarial", "Transparência empresarial", "商业透明度", "الشفافية التجارية", "Trasparenza aziendale", "Geschäftstransparenz", "Zakelijke transparantie")}
          </h3>
          <p className="text-sm text-muted-foreground">
            {t(
              "CalorieVision is an independent educational platform. We are not affiliated with any health, medical, or nutrition organization. Our mission is to make nutrition awareness accessible through technology.",
              "CalorieVision est une plateforme éducative indépendante. Nous ne sommes affiliés à aucune organisation de santé, médicale ou nutritionnelle. Notre mission est de rendre la sensibilisation à la nutrition accessible grâce à la technologie.",
              "CalorieVision es una plataforma educativa independiente. No estamos afiliados a ninguna organización de salud, médica o nutricional. Nuestra misión es hacer que la concienciación nutricional sea accesible a través de la tecnología.",
              "O CalorieVision é uma plataforma educativa independente. Não estamos afiliados a nenhuma organização de saúde, médica ou nutricional. A nossa missão é tornar a consciencialização nutricional acessível através da tecnologia.",
              "CalorieVision 是一个独立的教育平台。我们不隶属于任何健康、医疗或营养组织。我们的使命是通过技术让营养意识变得触手可及。",
              "CalorieVision هو منصة تعليمية مستقلة. نحن غير منتسبين إلى أي منظمة صحية أو طبية أو غذائية. مهمتنا هي جعل الوعي الغذائي متاحًا من خلال التكنولوجيا.",
              "CalorieVision è una piattaforma educativa indipendente. Non siamo affiliati a nessuna organizzazione sanitaria, medica o nutrizionale. La nostra missione è rendere la consapevolezza nutrizionale accessibile attraverso la tecnologia.",
              "CalorieVision ist eine unabhängige Bildungsplattform. Wir sind keiner Gesundheits-, Medizin- oder Ernährungsorganisation angeschlossen. Unsere Mission ist es, Ernährungsbewusstsein durch Technologie zugänglich zu machen.",
              "CalorieVision is een onafhankelijk educatief platform. We zijn niet gelieerd aan enige gezondheids-, medische of voedingsorganisatie. Onze missie is om voedingsbewustzijn toegankelijk te maken via technologie.",
            )}
          </p>
        </div>
      </div>
    </section>
  );
};

export default Contact;