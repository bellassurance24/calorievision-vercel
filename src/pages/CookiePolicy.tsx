import { LocalizedNavLink } from "@/components/LocalizedNavLink";
import { usePageMetadata } from "@/hooks/usePageMetadata";
import { LegalPageWrapper } from "@/components/LegalPageWrapper";
import { EmailWithFallback } from "@/components/EmailWithFallback";

const CookiePolicy = () => {
  usePageMetadata({
    title: "Cookie Policy | CalorieVision",
    description: "Learn how CalorieVision uses cookies and similar tracking technologies.",
    path: "/cookie-policy",
  });

  return (
    <LegalPageWrapper>
      <h1 className="mb-6 text-3xl font-bold md:text-4xl">Cookie Policy</h1>
      <p className="mb-6 text-sm font-semibold text-muted-foreground md:text-base">
        Last updated: December 31, 2025
      </p>

      <p className="mb-4 text-sm text-muted-foreground md:text-base">
        This Cookie Policy explains how CalorieVision ("we", "our", "us") uses cookies and similar tracking technologies when you visit our website at calorievision.online (the "Service").
      </p>
      <p className="mb-4 text-sm text-muted-foreground md:text-base">
        This policy applies to all users worldwide, including users in the European Union, European Economic Area, United Kingdom, United States, and other jurisdictions.
      </p>
      <p className="mb-6 text-sm text-muted-foreground md:text-base">
        By using our website, you consent to the use of cookies in accordance with this Cookie Policy. You can manage your cookie preferences at any time using our cookie consent tool or your browser settings.
      </p>

      <hr className="my-8 border-border" />

      <h2 className="mb-4 text-xl font-semibold">1. What Are Cookies?</h2>
      <p className="mb-4 text-sm text-muted-foreground md:text-base">
        Cookies are small text files that are stored on your device (computer, smartphone, tablet) when you visit a website. They help websites function properly, improve user experience, remember your preferences, and provide information about how the site is used.
      </p>
      <p className="mb-4 text-sm text-muted-foreground md:text-base">
        Cookies do not typically contain personally identifiable information such as your name or email address, but they may be linked to personal information you provide to us.
      </p>

      <h3 className="mb-2 text-lg font-medium">Types of Tracking Technologies We Use:</h3>
      <ul className="mb-6 list-disc space-y-1 pl-5 text-sm text-muted-foreground md:text-base">
        <li><strong className="text-foreground">Cookies:</strong> Small text files stored on your device</li>
        <li><strong className="text-foreground">Pixel tags/Web beacons:</strong> Tiny graphic images embedded in web pages</li>
        <li><strong className="text-foreground">Local storage:</strong> Data stored in your browser</li>
        <li><strong className="text-foreground">Session storage:</strong> Temporary data stored during your browsing session</li>
      </ul>

      <hr className="my-8 border-border" />

      <h2 className="mb-4 text-xl font-semibold">2. Types of Cookies We Use</h2>
      <p className="mb-4 text-sm text-muted-foreground md:text-base">
        CalorieVision uses the following categories of cookies:
      </p>

      <h3 className="mb-2 text-lg font-medium">a) Essential Cookies (Strictly Necessary)</h3>
      <div className="mb-4 overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="p-2 text-left font-semibold">Purpose</th>
              <th className="p-2 text-left font-semibold">Description</th>
              <th className="p-2 text-left font-semibold">Duration</th>
            </tr>
          </thead>
          <tbody className="text-muted-foreground">
            <tr className="border-b border-border">
              <td className="p-2">Website functionality</td>
              <td className="p-2">Enable core features like page navigation and security</td>
              <td className="p-2">Session</td>
            </tr>
            <tr className="border-b border-border">
              <td className="p-2">Security</td>
              <td className="p-2">Protect against fraud and unauthorized access</td>
              <td className="p-2">Session</td>
            </tr>
            <tr className="border-b border-border">
              <td className="p-2">Load balancing</td>
              <td className="p-2">Distribute traffic across servers</td>
              <td className="p-2">Session</td>
            </tr>
            <tr className="border-b border-border">
              <td className="p-2">Cookie consent</td>
              <td className="p-2">Remember your cookie preferences</td>
              <td className="p-2">1 year</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p className="mb-6 text-sm font-semibold text-muted-foreground md:text-base">
        These cookies are necessary for the website to function and cannot be disabled.
      </p>

      <h3 className="mb-2 text-lg font-medium">b) Analytics & Performance Cookies</h3>
      <div className="mb-4 overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="p-2 text-left font-semibold">Purpose</th>
              <th className="p-2 text-left font-semibold">Description</th>
              <th className="p-2 text-left font-semibold">Duration</th>
            </tr>
          </thead>
          <tbody className="text-muted-foreground">
            <tr className="border-b border-border">
              <td className="p-2">Traffic analysis</td>
              <td className="p-2">Understand how visitors use our website</td>
              <td className="p-2">Up to 2 years</td>
            </tr>
            <tr className="border-b border-border">
              <td className="p-2">Performance monitoring</td>
              <td className="p-2">Identify technical issues and errors</td>
              <td className="p-2">Up to 1 year</td>
            </tr>
            <tr className="border-b border-border">
              <td className="p-2">User behavior</td>
              <td className="p-2">Analyze pages visited, time spent, interactions</td>
              <td className="p-2">Up to 2 years</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p className="mb-2 text-sm text-muted-foreground md:text-base">
        The information collected is aggregated and anonymous. We use this data only to improve the performance and usability of CalorieVision.
      </p>
      <p className="mb-2 text-sm text-muted-foreground md:text-base">
        <strong className="text-foreground">Provider:</strong> Google Analytics
      </p>
      <p className="mb-6 text-sm text-muted-foreground md:text-base">
        <strong className="text-foreground">Opt-out:</strong>{" "}
        <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
          https://tools.google.com/dlpage/gaoptout
        </a>
      </p>

      <h3 className="mb-2 text-lg font-medium">c) Advertising & Marketing Cookies</h3>
      <div className="mb-4 overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="p-2 text-left font-semibold">Purpose</th>
              <th className="p-2 text-left font-semibold">Description</th>
              <th className="p-2 text-left font-semibold">Duration</th>
            </tr>
          </thead>
          <tbody className="text-muted-foreground">
            <tr className="border-b border-border">
              <td className="p-2">Personalized ads</td>
              <td className="p-2">Display advertisements relevant to your interests</td>
              <td className="p-2">Up to 2 years</td>
            </tr>
            <tr className="border-b border-border">
              <td className="p-2">Ad measurement</td>
              <td className="p-2">Measure the performance of advertisements</td>
              <td className="p-2">Up to 2 years</td>
            </tr>
            <tr className="border-b border-border">
              <td className="p-2">Frequency capping</td>
              <td className="p-2">Limit the number of times you see an ad</td>
              <td className="p-2">Up to 1 year</td>
            </tr>
            <tr className="border-b border-border">
              <td className="p-2">Cross-site tracking</td>
              <td className="p-2">Track visits across different websites</td>
              <td className="p-2">Up to 2 years</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p className="mb-6 text-sm text-muted-foreground md:text-base">
        Advertising partners may collect information about your visits to this and other websites to provide relevant advertisements.
      </p>

      <h3 className="mb-2 text-lg font-medium">d) Functional Cookies (Preferences)</h3>
      <div className="mb-4 overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="p-2 text-left font-semibold">Purpose</th>
              <th className="p-2 text-left font-semibold">Description</th>
              <th className="p-2 text-left font-semibold">Duration</th>
            </tr>
          </thead>
          <tbody className="text-muted-foreground">
            <tr className="border-b border-border">
              <td className="p-2">Language preferences</td>
              <td className="p-2">Remember your language selection</td>
              <td className="p-2">1 year</td>
            </tr>
            <tr className="border-b border-border">
              <td className="p-2">Display settings</td>
              <td className="p-2">Remember your display preferences</td>
              <td className="p-2">1 year</td>
            </tr>
            <tr className="border-b border-border">
              <td className="p-2">User preferences</td>
              <td className="p-2">Remember choices you make on the site</td>
              <td className="p-2">1 year</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p className="mb-6 text-sm text-muted-foreground md:text-base">
        These cookies remember your preferences to provide a more personalized experience.
      </p>

      <hr className="my-8 border-border" />

      <h2 className="mb-4 text-xl font-semibold">3. Specific Cookies We Use</h2>

      <h3 className="mb-2 text-lg font-medium">First-Party Cookies (Set by CalorieVision)</h3>
      <div className="mb-6 overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="p-2 text-left font-semibold">Cookie Name</th>
              <th className="p-2 text-left font-semibold">Purpose</th>
              <th className="p-2 text-left font-semibold">Type</th>
              <th className="p-2 text-left font-semibold">Duration</th>
            </tr>
          </thead>
          <tbody className="text-muted-foreground">
            <tr className="border-b border-border">
              <td className="p-2">cookie_consent</td>
              <td className="p-2">Stores your cookie preferences</td>
              <td className="p-2">Essential</td>
              <td className="p-2">1 year</td>
            </tr>
            <tr className="border-b border-border">
              <td className="p-2">language_pref</td>
              <td className="p-2">Stores your language preference</td>
              <td className="p-2">Functional</td>
              <td className="p-2">1 year</td>
            </tr>
            <tr className="border-b border-border">
              <td className="p-2">session_id</td>
              <td className="p-2">Maintains your session</td>
              <td className="p-2">Essential</td>
              <td className="p-2">Session</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h3 className="mb-2 text-lg font-medium">Third-Party Cookies</h3>
      <p className="mb-4 text-sm text-muted-foreground md:text-base">
        The following third-party services may set cookies on our website:
      </p>

      <h4 className="mb-2 font-medium">Google AdSense (Advertising)</h4>
      <ul className="mb-4 list-disc space-y-1 pl-5 text-sm text-muted-foreground md:text-base">
        <li><strong className="text-foreground">Purpose:</strong> Display relevant advertisements</li>
        <li><strong className="text-foreground">Cookies:</strong> Multiple cookies for ad personalization and measurement</li>
        <li><strong className="text-foreground">Duration:</strong> Up to 2 years</li>
        <li><strong className="text-foreground">Privacy Policy:</strong>{" "}
          <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
            https://policies.google.com/privacy
          </a>
        </li>
        <li><strong className="text-foreground">Ad Settings:</strong>{" "}
          <a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
            https://adssettings.google.com
          </a>
        </li>
        <li><strong className="text-foreground">How Google uses data:</strong>{" "}
          <a href="https://policies.google.com/technologies/ads" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
            https://policies.google.com/technologies/ads
          </a>
        </li>
      </ul>

      <h4 className="mb-2 font-medium">Ezoic (Advertising & Analytics)</h4>
      <ul className="mb-4 list-disc space-y-1 pl-5 text-sm text-muted-foreground md:text-base">
        <li><strong className="text-foreground">Purpose:</strong> Ad optimization, personalization, and analytics</li>
        <li><strong className="text-foreground">Cookies:</strong> Multiple cookies for ad delivery and site analytics</li>
        <li><strong className="text-foreground">Duration:</strong> Up to 2 years</li>
        <li><strong className="text-foreground">Privacy Policy:</strong>{" "}
          <a href="https://www.ezoic.com/privacy-policy/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
            https://www.ezoic.com/privacy-policy/
          </a>
        </li>
      </ul>

      <h4 className="mb-2 font-medium">Google Analytics (Analytics)</h4>
      <ul className="mb-6 list-disc space-y-1 pl-5 text-sm text-muted-foreground md:text-base">
        <li><strong className="text-foreground">Purpose:</strong> Website traffic analysis</li>
        <li><strong className="text-foreground">Cookies:</strong> _ga, _gid, _gat</li>
        <li><strong className="text-foreground">Duration:</strong> Up to 2 years</li>
        <li><strong className="text-foreground">Privacy Policy:</strong>{" "}
          <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
            https://policies.google.com/privacy
          </a>
        </li>
        <li><strong className="text-foreground">Opt-out:</strong>{" "}
          <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
            https://tools.google.com/dlpage/gaoptout
          </a>
        </li>
      </ul>

      <hr className="my-8 border-border" />

      <h2 className="mb-4 text-xl font-semibold">4. Cookie Consent (GDPR & ePrivacy)</h2>

      <h3 className="mb-2 text-lg font-medium">For Users in the European Union, EEA, and UK:</h3>
      <p className="mb-4 text-sm text-muted-foreground md:text-base">
        In accordance with the General Data Protection Regulation (GDPR) and the ePrivacy Directive, we request your consent before placing non-essential cookies on your device.
      </p>
      <p className="mb-2 text-sm text-muted-foreground md:text-base">
        When you first visit CalorieVision, you will see a cookie consent banner that allows you to:
      </p>
      <ul className="mb-4 list-disc space-y-1 pl-5 text-sm text-muted-foreground md:text-base">
        <li><strong className="text-foreground">Accept All:</strong> Consent to all cookies</li>
        <li><strong className="text-foreground">Reject All:</strong> Reject all non-essential cookies</li>
        <li><strong className="text-foreground">Customize:</strong> Choose which categories of cookies to accept</li>
      </ul>
      <p className="mb-4 text-sm text-muted-foreground md:text-base">
        You can change your cookie preferences at any time by clicking "Manage Cookies" in the footer of our website.
      </p>
      <p className="mb-2 text-sm font-semibold text-muted-foreground md:text-base">Your Rights:</p>
      <ul className="mb-6 list-disc space-y-1 pl-5 text-sm text-muted-foreground md:text-base">
        <li>You have the right to withdraw consent at any time</li>
        <li>Withdrawing consent does not affect the lawfulness of processing before withdrawal</li>
        <li>Essential cookies cannot be disabled as they are necessary for the website to function</li>
      </ul>

      <h3 className="mb-2 text-lg font-medium">For Users in California, USA:</h3>
      <p className="mb-4 text-sm text-muted-foreground md:text-base">
        Under the California Consumer Privacy Act (CCPA), you have the right to opt-out of the "sale" of your personal information. While we do not sell personal information in the traditional sense, some advertising cookies may constitute a "sale" under CCPA.
      </p>
      <p className="mb-2 text-sm text-muted-foreground md:text-base">To opt-out of personalized advertising:</p>
      <ul className="mb-6 list-disc space-y-1 pl-5 text-sm text-muted-foreground md:text-base">
        <li>Use our cookie consent tool</li>
        <li>Enable "Do Not Sell My Personal Information" in your browser settings</li>
        <li>Use the Digital Advertising Alliance opt-out:{" "}
          <a href="https://optout.aboutads.info/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
            https://optout.aboutads.info/
          </a>
        </li>
      </ul>

      <hr className="my-8 border-border" />

      <h2 className="mb-4 text-xl font-semibold">5. Managing Cookies</h2>
      <p className="mb-4 text-sm text-muted-foreground md:text-base">
        You can control and manage cookies in several ways:
      </p>

      <h3 className="mb-2 text-lg font-medium">a) Cookie Consent Tool</h3>
      <p className="mb-4 text-sm text-muted-foreground md:text-base">
        Click "Manage Cookies" in the footer of our website at any time to update your preferences.
      </p>

      <h3 className="mb-2 text-lg font-medium">b) Browser Settings</h3>
      <p className="mb-2 text-sm text-muted-foreground md:text-base">
        Most web browsers allow you to control cookies through their settings. You can:
      </p>
      <ul className="mb-4 list-disc space-y-1 pl-5 text-sm text-muted-foreground md:text-base">
        <li>View stored cookies</li>
        <li>Delete existing cookies</li>
        <li>Block all cookies</li>
        <li>Block third-party cookies</li>
        <li>Clear cookies when you close the browser</li>
        <li>Set preferences for specific websites</li>
      </ul>

      <p className="mb-2 text-sm font-semibold text-muted-foreground md:text-base">Browser-specific instructions:</p>
      <div className="mb-6 overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="p-2 text-left font-semibold">Browser</th>
              <th className="p-2 text-left font-semibold">Instructions</th>
            </tr>
          </thead>
          <tbody className="text-muted-foreground">
            <tr className="border-b border-border">
              <td className="p-2 font-medium">Google Chrome</td>
              <td className="p-2">Settings → Privacy and Security → Cookies</td>
            </tr>
            <tr className="border-b border-border">
              <td className="p-2 font-medium">Mozilla Firefox</td>
              <td className="p-2">Settings → Privacy & Security → Cookies</td>
            </tr>
            <tr className="border-b border-border">
              <td className="p-2 font-medium">Safari</td>
              <td className="p-2">Preferences → Privacy → Cookies</td>
            </tr>
            <tr className="border-b border-border">
              <td className="p-2 font-medium">Microsoft Edge</td>
              <td className="p-2">Settings → Cookies and Site Permissions</td>
            </tr>
            <tr className="border-b border-border">
              <td className="p-2 font-medium">Opera</td>
              <td className="p-2">Settings → Privacy & Security → Cookies</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h3 className="mb-2 text-lg font-medium">c) Third-Party Opt-Out Tools</h3>
      <ul className="mb-6 list-disc space-y-1 pl-5 text-sm text-muted-foreground md:text-base">
        <li><strong className="text-foreground">Google Ads Settings:</strong>{" "}
          <a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
            https://adssettings.google.com
          </a>
        </li>
        <li><strong className="text-foreground">Google Analytics Opt-out:</strong>{" "}
          <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
            https://tools.google.com/dlpage/gaoptout
          </a>
        </li>
        <li><strong className="text-foreground">Network Advertising Initiative:</strong>{" "}
          <a href="https://optout.networkadvertising.org" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
            https://optout.networkadvertising.org
          </a>
        </li>
        <li><strong className="text-foreground">Digital Advertising Alliance:</strong>{" "}
          <a href="https://optout.aboutads.info" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
            https://optout.aboutads.info
          </a>
        </li>
        <li><strong className="text-foreground">European Interactive Digital Advertising Alliance:</strong>{" "}
          <a href="https://www.youronlinechoices.eu" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
            https://www.youronlinechoices.eu
          </a>
        </li>
      </ul>

      <h3 className="mb-2 text-lg font-medium">d) Do Not Track</h3>
      <p className="mb-4 text-sm text-muted-foreground md:text-base">
        Some browsers offer a "Do Not Track" (DNT) feature. Our website does not currently respond to DNT signals, but you can manage your preferences using the methods described above.
      </p>
      <p className="mb-6 text-sm font-semibold text-muted-foreground md:text-base">
        Please note: Blocking or deleting cookies may affect certain functionalities of the website and may prevent some features from working properly.
      </p>

      <hr className="my-8 border-border" />

      <h2 className="mb-4 text-xl font-semibold">6. Cookies and Personal Data</h2>
      <p className="mb-4 text-sm text-muted-foreground md:text-base">
        Some cookies may collect personal data or be linked to personal data you provide. For information about how we process personal data, please see our Privacy Policy at:{" "}
        <LocalizedNavLink to="/privacy-policy" className="text-primary hover:underline">
          https://calorievision.online/privacy-policy
        </LocalizedNavLink>
      </p>

      <h3 className="mb-2 text-lg font-medium">Legal Basis for Cookie Processing (GDPR):</h3>
      <div className="mb-6 overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="p-2 text-left font-semibold">Cookie Type</th>
              <th className="p-2 text-left font-semibold">Legal Basis</th>
            </tr>
          </thead>
          <tbody className="text-muted-foreground">
            <tr className="border-b border-border">
              <td className="p-2">Essential</td>
              <td className="p-2">Legitimate interest (necessary for website operation)</td>
            </tr>
            <tr className="border-b border-border">
              <td className="p-2">Analytics</td>
              <td className="p-2">Consent</td>
            </tr>
            <tr className="border-b border-border">
              <td className="p-2">Advertising</td>
              <td className="p-2">Consent</td>
            </tr>
            <tr className="border-b border-border">
              <td className="p-2">Functional</td>
              <td className="p-2">Consent</td>
            </tr>
          </tbody>
        </table>
      </div>

      <hr className="my-8 border-border" />

      <h2 className="mb-4 text-xl font-semibold">7. Cookies on Mobile Devices</h2>
      <p className="mb-2 text-sm text-muted-foreground md:text-base">
        If you access CalorieVision on a mobile device, cookies will function similarly to desktop browsers. You can manage cookies through:
      </p>
      <ul className="mb-6 list-disc space-y-1 pl-5 text-sm text-muted-foreground md:text-base">
        <li>Your mobile browser settings</li>
        <li>Your device settings (for app-related cookies)</li>
        <li>Our cookie consent tool</li>
      </ul>

      <hr className="my-8 border-border" />

      <h2 className="mb-4 text-xl font-semibold">8. Children and Cookies</h2>
      <p className="mb-6 text-sm text-muted-foreground md:text-base">
        CalorieVision is not intended for children under the age of 16 in the EU/EEA/UK or under 13 in the United States. We do not knowingly use cookies to collect information from children.
      </p>

      <hr className="my-8 border-border" />

      <h2 className="mb-4 text-xl font-semibold">9. International Data Transfers</h2>
      <p className="mb-4 text-sm text-muted-foreground md:text-base">
        Cookies set by third-party services (such as Google) may result in your data being transferred to countries outside your country of residence, including the United States.
      </p>
      <p className="mb-2 text-sm text-muted-foreground md:text-base">
        For users in the EU/EEA/UK, these transfers are protected by:
      </p>
      <ul className="mb-6 list-disc space-y-1 pl-5 text-sm text-muted-foreground md:text-base">
        <li>Standard Contractual Clauses (SCCs)</li>
        <li>Adequacy decisions where applicable</li>
        <li>Other legally approved transfer mechanisms</li>
      </ul>

      <hr className="my-8 border-border" />

      <h2 className="mb-4 text-xl font-semibold">10. Changes to This Cookie Policy</h2>
      <p className="mb-4 text-sm text-muted-foreground md:text-base">
        We may update this Cookie Policy from time to time to reflect changes in technology, legislation, or our practices.
      </p>
      <p className="mb-2 text-sm text-muted-foreground md:text-base">When we make changes:</p>
      <ul className="mb-4 list-disc space-y-1 pl-5 text-sm text-muted-foreground md:text-base">
        <li>We will update the "Last updated" date at the top of this page</li>
        <li>For significant changes, we may notify you via a banner on our website</li>
        <li>Continued use of the website after changes constitutes acceptance</li>
      </ul>
      <p className="mb-6 text-sm text-muted-foreground md:text-base">
        We encourage you to review this Cookie Policy periodically.
      </p>

      <hr className="my-8 border-border" />

      <h2 className="mb-4 text-xl font-semibold">11. More Information About Cookies</h2>
      <p className="mb-2 text-sm text-muted-foreground md:text-base">
        To learn more about cookies and how to manage them, you can visit:
      </p>
      <ul className="mb-6 list-disc space-y-1 pl-5 text-sm text-muted-foreground md:text-base">
        <li><strong className="text-foreground">All About Cookies:</strong>{" "}
          <a href="https://www.allaboutcookies.org" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
            https://www.allaboutcookies.org
          </a>
        </li>
        <li><strong className="text-foreground">Your Online Choices (EU):</strong>{" "}
          <a href="https://www.youronlinechoices.eu" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
            https://www.youronlinechoices.eu
          </a>
        </li>
        <li><strong className="text-foreground">Network Advertising Initiative:</strong>{" "}
          <a href="https://www.networkadvertising.org" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
            https://www.networkadvertising.org
          </a>
        </li>
      </ul>

      <hr className="my-8 border-border" />

      <h2 className="mb-4 text-xl font-semibold">12. Contact Us</h2>
      <p className="mb-4 text-sm text-muted-foreground md:text-base">
        If you have any questions about this Cookie Policy or our use of cookies, please contact us:
      </p>

      <p className="mb-2 text-sm font-semibold text-muted-foreground md:text-base">General Inquiries:</p>
      <ul className="mb-4 list-disc space-y-1 pl-5 text-sm text-muted-foreground md:text-base">
        <li><EmailWithFallback showLabel /></li>
        <li><strong className="text-foreground">Website:</strong>{" "}
          <a href="https://calorievision.online" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
            calorievision.online
          </a>
        </li>
        <li><strong className="text-foreground">Contact Page:</strong>{" "}
          <LocalizedNavLink to="/contact" className="text-primary hover:underline">
            calorievision.online/contact
          </LocalizedNavLink>
        </li>
      </ul>

      <p className="mb-2 text-sm font-semibold text-muted-foreground md:text-base">Cookie/Privacy Requests:</p>
      <ul className="mb-4 list-disc space-y-1 pl-5 text-sm text-muted-foreground md:text-base">
        <li><EmailWithFallback showLabel /></li>
        <li><strong className="text-foreground">Subject Line:</strong> "Cookie Policy Inquiry" or "Privacy Request"</li>
      </ul>

      <p className="mb-6 text-sm text-muted-foreground md:text-base">
        For GDPR or CCPA-related requests, please see our{" "}
        <LocalizedNavLink to="/privacy-policy" className="text-primary hover:underline">Privacy Policy</LocalizedNavLink>{" "}
        for detailed instructions.
      </p>

      <hr className="my-8 border-border" />

      <p className="text-sm italic text-muted-foreground md:text-base">
        By using CalorieVision, you acknowledge that you have read and understood this Cookie Policy.
      </p>
    </LegalPageWrapper>
  );
};

export default CookiePolicy;
