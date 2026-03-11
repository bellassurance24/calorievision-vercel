import { NavLink as RouterNavLink, NavLinkProps } from "react-router-dom";
import { forwardRef } from "react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";
import { removeLanguagePrefix } from "@/hooks/useLocalizedPath";

interface LocalizedNavLinkProps extends Omit<NavLinkProps, "className" | "to"> {
  to: string;
  className?: string;
  activeClassName?: string;
  pendingClassName?: string;
}

/**
 * NavLink that automatically adds the current language prefix to the path
 */
const LocalizedNavLink = forwardRef<HTMLAnchorElement, LocalizedNavLinkProps>(
  ({ className, activeClassName, pendingClassName, to, ...props }, ref) => {
    const { language } = useLanguage();
    
    // Clean the path and add language prefix
    const cleanPath = removeLanguagePrefix(to);
    const localizedTo = `/${language}${cleanPath === "/" ? "" : cleanPath}`;
    
    return (
      <RouterNavLink
        ref={ref}
        to={localizedTo}
        className={({ isActive, isPending }) =>
          cn(className, isActive && activeClassName, isPending && pendingClassName)
        }
        {...props}
      />
    );
  },
);

LocalizedNavLink.displayName = "LocalizedNavLink";

export { LocalizedNavLink };
