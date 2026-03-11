import { Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

/**
 * Reusable email link component with Gmail/Outlook fallback links and copy button.
 * Used across legal pages and contact sections.
 */
interface EmailWithFallbackProps {
  email?: string;
  showLabel?: boolean;
}

export const EmailWithFallback = ({ 
  email = "support@calorievision.online",
  showLabel = false 
}: EmailWithFallbackProps) => {
  const { toast } = useToast();
  const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${email}`;
  const outlookUrl = `https://outlook.live.com/mail/0/deeplink/compose?to=${email}`;
  const yahooUrl = `https://compose.mail.yahoo.com/?to=${email}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(email);
      toast({
        title: "Email copied!",
        description: email,
        duration: 2000,
      });
    } catch (err) {
      toast({
        title: "Copy failed",
        description: "Please copy manually",
        variant: "destructive",
        duration: 2000,
      });
    }
  };

  return (
    <>
      {showLabel && <strong className="text-foreground">Email:</strong>}{" "}
      <span className="select-all">{email}</span>
      <span className="ml-2 text-sm text-muted-foreground">
        (
        <button
          onClick={handleCopy}
          className="inline-flex items-center gap-1 text-primary hover:underline"
          title="Copy email"
        >
          <Copy className="h-3 w-3" />
          Copy
        </button>
        {" | "}
        <a
          href={gmailUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline"
        >
          Gmail
        </a>
        {" | "}
        <a
          href={outlookUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline"
        >
          Outlook
        </a>
        {" | "}
        <a
          href={yahooUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline"
        >
          Yahoo
        </a>
        )
      </span>
    </>
  );
};
