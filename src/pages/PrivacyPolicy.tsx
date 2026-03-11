import { usePageMetadata } from "@/hooks/usePageMetadata";
import { LegalPageWrapper } from "@/components/LegalPageWrapper";
import { EmailWithFallback } from "@/components/EmailWithFallback";

const PrivacyPolicy = () => {
  usePageMetadata({
    title: "Privacy Policy | CalorieVision",
    description: "Read how CalorieVision handles uploaded images, contact information, cookies, analytics, and user privacy.",
    path: "/privacy-policy",
  });

  return (
    <LegalPageWrapper>
      <div className="mb-4 text-sm text-primary md:text-base">Legal</div>
      <h1 className="mb-6 text-3xl font-bold md:text-4xl">Privacy Policy</h1>
      <p className="mb-6 text-sm text-muted-foreground md:text-base">
        <strong>Last updated: December 31, 2025</strong>
      </p>

      <p className="mb-4 text-sm text-muted-foreground md:text-base">
        Welcome to CalorieVision ("we", "our", "us"). Your privacy is important to us, and this Privacy Policy explains how we collect, use, protect, and share your information when you use our website and services at calorievision.online (the "Service").
      </p>

      <p className="mb-4 text-sm text-muted-foreground md:text-base">
        This Privacy Policy applies to all users worldwide, including users in the European Union, European Economic Area, United Kingdom (collectively "EU/EEA/UK"), United States, and other jurisdictions.
      </p>

      <p className="mb-6 text-sm text-muted-foreground md:text-base">
        <strong>By using CalorieVision, you agree to the collection and use of information in accordance with this Privacy Policy.</strong>
      </p>

      <hr className="my-6 border-border" />

      <h2 className="mb-4 text-xl font-semibold">1. Data Controller</h2>
      <p className="mb-2 text-sm text-muted-foreground md:text-base">
        For the purposes of applicable data protection laws, CalorieVision is the data controller responsible for your personal data.
      </p>
      <p className="mb-2 text-sm text-muted-foreground md:text-base">
        <strong>Contact Information:</strong>
      </p>
      <ul className="mb-6 list-disc space-y-1 pl-5 text-sm text-muted-foreground md:text-base">
        <li>Website: calorievision.online</li>
        <li>Email: support@calorievision.online</li>
        <li>Contact Page: calorievision.online/contact</li>
      </ul>

      <hr className="my-6 border-border" />

      <h2 className="mb-4 text-xl font-semibold">2. Information We Collect</h2>
      <p className="mb-4 text-sm text-muted-foreground md:text-base">
        We collect minimal information necessary to provide and improve our Service:
      </p>

      <h3 className="mb-2 text-lg font-medium">a) Personal Information (Optional)</h3>
      <ul className="mb-4 list-disc space-y-1 pl-5 text-sm text-muted-foreground md:text-base">
        <li>Email address (only if you contact us voluntarily)</li>
        <li>Name (only if you provide it via contact forms)</li>
        <li>Information you submit via contact forms</li>
      </ul>

      <h3 className="mb-2 text-lg font-medium">b) Usage Information (Automatic)</h3>
      <ul className="mb-4 list-disc space-y-1 pl-5 text-sm text-muted-foreground md:text-base">
        <li>Device type, browser type, operating system</li>
        <li>IP address (anonymized where possible)</li>
        <li>Pages visited and interactions</li>
        <li>Date and time of visits</li>
        <li>Referring website</li>
        <li>Anonymous analytics data</li>
      </ul>

      <h3 className="mb-2 text-lg font-medium">c) Uploaded Content</h3>
      <ul className="mb-4 list-disc space-y-1 pl-5 text-sm text-muted-foreground md:text-base">
        <li>Images or files uploaded for calorie analysis</li>
        <li><strong>Important:</strong> Uploaded images are processed in real-time and are NOT permanently stored on our servers</li>
        <li>We do not retain your food photos after analysis is complete</li>
      </ul>

      <h3 className="mb-2 text-lg font-medium">d) Cookies and Similar Technologies</h3>
      <ul className="mb-4 list-disc space-y-1 pl-5 text-sm text-muted-foreground md:text-base">
        <li>Essential cookies for website functionality</li>
        <li>Analytics cookies (Google Analytics)</li>
        <li>Advertising cookies (Google AdSense, Ezoic)</li>
      </ul>
      <p className="mb-6 text-sm text-muted-foreground md:text-base">
        See Section 6 for more details on cookies.
      </p>

      <hr className="my-6 border-border" />

      <h2 className="mb-4 text-xl font-semibold">3. Legal Basis for Processing (GDPR)</h2>
      <p className="mb-4 text-sm text-muted-foreground md:text-base">
        For users in the EU/EEA/UK, we process your personal data based on the following legal grounds:
      </p>

      <div className="mb-4 overflow-x-auto">
        <table className="w-full border-collapse text-sm text-muted-foreground md:text-base">
          <thead>
            <tr className="border-b border-border">
              <th className="py-2 pr-4 text-left font-semibold">Purpose</th>
              <th className="py-2 text-left font-semibold">Legal Basis</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-border">
              <td className="py-2 pr-4">Providing the Service</td>
              <td className="py-2">Performance of contract / Legitimate interest</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 pr-4">Processing food images</td>
              <td className="py-2">Consent (by uploading)</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 pr-4">Analytics</td>
              <td className="py-2">Legitimate interest</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 pr-4">Advertising</td>
              <td className="py-2">Consent (via cookie banner)</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 pr-4">Responding to inquiries</td>
              <td className="py-2">Legitimate interest / Consent</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 pr-4">Legal compliance</td>
              <td className="py-2">Legal obligation</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 pr-4">Security</td>
              <td className="py-2">Legitimate interest</td>
            </tr>
          </tbody>
        </table>
      </div>

      <p className="mb-6 text-sm text-muted-foreground md:text-base">
        You have the right to withdraw consent at any time where processing is based on consent. This will not affect the lawfulness of processing before withdrawal.
      </p>

      <hr className="my-6 border-border" />

      <h2 className="mb-4 text-xl font-semibold">4. How We Use Your Information</h2>
      <p className="mb-2 text-sm text-muted-foreground md:text-base">
        We use collected information to:
      </p>
      <ul className="mb-4 list-disc space-y-1 pl-5 text-sm text-muted-foreground md:text-base">
        <li><strong>Provide Services:</strong> Process food image analysis and deliver results</li>
        <li><strong>Improve Services:</strong> Understand how users interact with our website</li>
        <li><strong>Communicate:</strong> Respond to your inquiries and support requests</li>
        <li><strong>Security:</strong> Ensure website security, prevent fraud and abuse</li>
        <li><strong>Legal Compliance:</strong> Comply with applicable laws and regulations</li>
        <li><strong>Advertising:</strong> Display relevant advertisements (with your consent)</li>
        <li><strong>Analytics:</strong> Analyze website traffic and user behavior (anonymized)</li>
      </ul>

      <p className="mb-2 text-sm text-muted-foreground md:text-base">
        We do NOT use your data to:
      </p>
      <ul className="mb-6 list-disc space-y-1 pl-5 text-sm text-muted-foreground md:text-base">
        <li>Make automated decisions that significantly affect you</li>
        <li>Build personal profiles for purposes other than stated above</li>
        <li>Sell your personal information to third parties</li>
      </ul>

      <hr className="my-6 border-border" />

      <h2 className="mb-4 text-xl font-semibold">5. Automated Decision-Making and AI Processing</h2>
      <p className="mb-4 text-sm text-muted-foreground md:text-base">
        CalorieVision uses artificial intelligence (AI) to analyze food images and estimate nutritional content.
      </p>
      <p className="mb-2 text-sm text-muted-foreground md:text-base">
        <strong>Important Information:</strong>
      </p>
      <ul className="mb-6 list-disc space-y-1 pl-5 text-sm text-muted-foreground md:text-base">
        <li>AI analysis is performed automatically when you upload an image</li>
        <li>Results are estimates for educational purposes only</li>
        <li>No decisions with legal or significant effects are made based on AI analysis</li>
        <li>You can request human review of any results by contacting us</li>
        <li>The AI does not create profiles about you</li>
      </ul>

      <hr className="my-6 border-border" />

      <h2 className="mb-4 text-xl font-semibold">6. Cookies and Tracking Technologies</h2>
      <p className="mb-4 text-sm text-muted-foreground md:text-base">
        We use cookies and similar technologies to enhance your experience:
      </p>

      <h3 className="mb-2 text-lg font-medium">Types of Cookies We Use:</h3>
      <div className="mb-4 overflow-x-auto">
        <table className="w-full border-collapse text-sm text-muted-foreground md:text-base">
          <thead>
            <tr className="border-b border-border">
              <th className="py-2 pr-4 text-left font-semibold">Cookie Type</th>
              <th className="py-2 pr-4 text-left font-semibold">Purpose</th>
              <th className="py-2 text-left font-semibold">Duration</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-border">
              <td className="py-2 pr-4"><strong>Essential</strong></td>
              <td className="py-2 pr-4">Website functionality</td>
              <td className="py-2">Session</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 pr-4"><strong>Analytics</strong></td>
              <td className="py-2 pr-4">Traffic analysis (Google Analytics)</td>
              <td className="py-2">Up to 2 years</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 pr-4"><strong>Advertising</strong></td>
              <td className="py-2 pr-4">Relevant ads (AdSense, Ezoic)</td>
              <td className="py-2">Up to 2 years</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 pr-4"><strong>Preferences</strong></td>
              <td className="py-2 pr-4">Remember your choices</td>
              <td className="py-2">Up to 1 year</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h3 className="mb-2 text-lg font-medium">Managing Cookies:</h3>
      <ul className="mb-4 list-disc space-y-1 pl-5 text-sm text-muted-foreground md:text-base">
        <li>Use our cookie consent banner to manage preferences</li>
        <li>Click "Manage Cookies" in the footer at any time</li>
        <li>Adjust your browser settings to block or delete cookies</li>
        <li>Note: Blocking essential cookies may affect website functionality</li>
      </ul>

      <h3 className="mb-2 text-lg font-medium">Third-Party Cookies:</h3>
      <p className="mb-6 text-sm text-muted-foreground md:text-base">
        Our advertising and analytics partners may set their own cookies. See Section 7 for details.
      </p>

      <hr className="my-6 border-border" />

      <h2 className="mb-4 text-xl font-semibold">7. Advertising and Third-Party Services</h2>
      <p className="mb-4 text-sm text-muted-foreground md:text-base">
        We use the following third-party services:
      </p>

      <h3 className="mb-2 text-lg font-medium">Google AdSense</h3>
      <ul className="mb-4 list-disc space-y-1 pl-5 text-sm text-muted-foreground md:text-base">
        <li>Purpose: Display advertisements</li>
        <li>Data collected: Browsing behavior, ad interactions</li>
        <li>Privacy Policy: <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary underline">https://policies.google.com/privacy</a></li>
        <li>Ad Settings: <a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer" className="text-primary underline">https://adssettings.google.com</a></li>
      </ul>

      <h3 className="mb-2 text-lg font-medium">Ezoic</h3>
      <ul className="mb-4 list-disc space-y-1 pl-5 text-sm text-muted-foreground md:text-base">
        <li>Purpose: Ad optimization and analytics</li>
        <li>Data collected: Browsing behavior, device information</li>
        <li>Privacy Policy: <a href="https://www.ezoic.com/privacy-policy/" target="_blank" rel="noopener noreferrer" className="text-primary underline">https://www.ezoic.com/privacy-policy/</a></li>
      </ul>

      <h3 className="mb-2 text-lg font-medium">Google Analytics</h3>
      <ul className="mb-4 list-disc space-y-1 pl-5 text-sm text-muted-foreground md:text-base">
        <li>Purpose: Website analytics</li>
        <li>Data collected: Usage data (anonymized)</li>
        <li>Privacy Policy: <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary underline">https://policies.google.com/privacy</a></li>
        <li>Opt-out: <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" className="text-primary underline">https://tools.google.com/dlpage/gaoptout</a></li>
      </ul>

      <h3 className="mb-2 text-lg font-medium">How Google Uses Data:</h3>
      <p className="mb-6 text-sm text-muted-foreground md:text-base">
        Learn more about how Google uses data: <a href="https://policies.google.com/technologies/ads" target="_blank" rel="noopener noreferrer" className="text-primary underline">https://policies.google.com/technologies/ads</a>
      </p>

      <hr className="my-6 border-border" />

      <h2 className="mb-4 text-xl font-semibold">8. Data Sharing and Disclosure</h2>
      <p className="mb-4 text-sm text-muted-foreground md:text-base">
        <strong>We do NOT sell or rent your personal data.</strong>
      </p>
      <p className="mb-2 text-sm text-muted-foreground md:text-base">
        We may share data only with:
      </p>

      <h3 className="mb-2 text-lg font-medium">Service Providers:</h3>
      <ul className="mb-4 list-disc space-y-1 pl-5 text-sm text-muted-foreground md:text-base">
        <li>Cloud hosting providers</li>
        <li>Analytics services (Google Analytics)</li>
        <li>Advertising networks (Google AdSense, Ezoic)</li>
        <li>AI/ML processing services</li>
      </ul>

      <h3 className="mb-2 text-lg font-medium">Legal Requirements:</h3>
      <ul className="mb-4 list-disc space-y-1 pl-5 text-sm text-muted-foreground md:text-base">
        <li>When required by law or legal process</li>
        <li>To protect our rights, privacy, safety, or property</li>
        <li>To respond to lawful requests from public authorities</li>
      </ul>

      <h3 className="mb-2 text-lg font-medium">Business Transfers:</h3>
      <ul className="mb-4 list-disc space-y-1 pl-5 text-sm text-muted-foreground md:text-base">
        <li>In connection with a merger, acquisition, or sale of assets (you will be notified)</li>
      </ul>

      <p className="mb-6 text-sm text-muted-foreground md:text-base">
        All service providers are contractually obligated to protect your data and use it only for specified purposes.
      </p>

      <hr className="my-6 border-border" />

      <h2 className="mb-4 text-xl font-semibold">9. International Data Transfers</h2>
      <p className="mb-4 text-sm text-muted-foreground md:text-base">
        CalorieVision operates globally. Your information may be transferred to and processed in countries other than your country of residence, including the United States and other countries where our service providers operate.
      </p>
      <p className="mb-2 text-sm text-muted-foreground md:text-base">
        <strong>For EU/EEA/UK Users:</strong>
      </p>
      <p className="mb-2 text-sm text-muted-foreground md:text-base">
        When we transfer your data outside the EU/EEA/UK, we ensure appropriate safeguards are in place:
      </p>
      <ul className="mb-6 list-disc space-y-1 pl-5 text-sm text-muted-foreground md:text-base">
        <li>Standard Contractual Clauses (SCCs) approved by the European Commission</li>
        <li>Adequacy decisions where applicable</li>
        <li>Other legally approved transfer mechanisms</li>
      </ul>

      <hr className="my-6 border-border" />

      <h2 className="mb-4 text-xl font-semibold">10. Data Retention</h2>
      <p className="mb-4 text-sm text-muted-foreground md:text-base">
        We retain your data only as long as necessary:
      </p>

      <div className="mb-4 overflow-x-auto">
        <table className="w-full border-collapse text-sm text-muted-foreground md:text-base">
          <thead>
            <tr className="border-b border-border">
              <th className="py-2 pr-4 text-left font-semibold">Data Type</th>
              <th className="py-2 text-left font-semibold">Retention Period</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-border">
              <td className="py-2 pr-4">Uploaded images</td>
              <td className="py-2">NOT stored (processed in real-time only)</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 pr-4">Contact form data</td>
              <td className="py-2">Up to 2 years or until request fulfilled</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 pr-4">Analytics data</td>
              <td className="py-2">Up to 26 months (anonymized)</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 pr-4">Cookie data</td>
              <td className="py-2">See cookie durations in Section 6</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 pr-4">Legal/compliance data</td>
              <td className="py-2">As required by law</td>
            </tr>
          </tbody>
        </table>
      </div>

      <p className="mb-6 text-sm text-muted-foreground md:text-base">
        After the retention period, data is securely deleted or anonymized.
      </p>

      <hr className="my-6 border-border" />

      <h2 className="mb-4 text-xl font-semibold">11. Data Security</h2>
      <p className="mb-2 text-sm text-muted-foreground md:text-base">
        We implement appropriate technical and organizational measures to protect your data:
      </p>
      <ul className="mb-4 list-disc space-y-1 pl-5 text-sm text-muted-foreground md:text-base">
        <li>HTTPS encryption for all data transmission</li>
        <li>Secure cloud infrastructure</li>
        <li>Regular security assessments</li>
        <li>Access controls and authentication</li>
        <li>Employee training on data protection</li>
      </ul>
      <p className="mb-6 text-sm text-muted-foreground md:text-base">
        However, no method of transmission over the Internet is 100% secure. While we strive to protect your personal data, we cannot guarantee absolute security.
      </p>

      <hr className="my-6 border-border" />

      <h2 className="mb-4 text-xl font-semibold">12. Your Privacy Rights</h2>

      <h3 className="mb-2 text-lg font-medium">For ALL Users:</h3>
      <ul className="mb-4 list-disc space-y-1 pl-5 text-sm text-muted-foreground md:text-base">
        <li><strong>Access:</strong> Request a copy of your personal data</li>
        <li><strong>Correction:</strong> Request correction of inaccurate data</li>
        <li><strong>Deletion:</strong> Request deletion of your personal data</li>
        <li><strong>Withdraw Consent:</strong> Withdraw consent at any time</li>
      </ul>

      <h3 className="mb-2 text-lg font-medium">For EU/EEA/UK Users (GDPR):</h3>
      <p className="mb-2 text-sm text-muted-foreground md:text-base">
        You have additional rights under the General Data Protection Regulation:
      </p>
      <ul className="mb-4 list-disc space-y-1 pl-5 text-sm text-muted-foreground md:text-base">
        <li><strong>Right of Access</strong> (Article 15): Obtain confirmation and copy of your data</li>
        <li><strong>Right to Rectification</strong> (Article 16): Correct inaccurate personal data</li>
        <li><strong>Right to Erasure</strong> (Article 17): Request deletion ("right to be forgotten")</li>
        <li><strong>Right to Restrict Processing</strong> (Article 18): Limit how we use your data</li>
        <li><strong>Right to Data Portability</strong> (Article 20): Receive your data in a portable format</li>
        <li><strong>Right to Object</strong> (Article 21): Object to processing based on legitimate interests</li>
        <li><strong>Right to Withdraw Consent</strong> (Article 7): Withdraw consent at any time</li>
        <li><strong>Right to Lodge a Complaint:</strong> File a complaint with your local data protection authority</li>
      </ul>
      <p className="mb-4 text-sm text-muted-foreground md:text-base">
        <strong>EU Data Protection Authorities:</strong>{" "}
        <a href="https://edpb.europa.eu/about-edpb/about-edpb/members_en" target="_blank" rel="noopener noreferrer" className="text-primary underline">
          https://edpb.europa.eu/about-edpb/about-edpb/members_en
        </a>
      </p>

      <h3 className="mb-2 text-lg font-medium">For California Residents (CCPA):</h3>
      <p className="mb-2 text-sm text-muted-foreground md:text-base">
        Under the California Consumer Privacy Act, you have the right to:
      </p>
      <ul className="mb-4 list-disc space-y-1 pl-5 text-sm text-muted-foreground md:text-base">
        <li><strong>Right to Know:</strong> What personal information we collect, use, and disclose</li>
        <li><strong>Right to Delete:</strong> Request deletion of your personal information</li>
        <li><strong>Right to Opt-Out:</strong> Opt out of the sale of personal information
          <ul className="mt-1 list-disc pl-5">
            <li><strong>Note: We do NOT sell your personal information</strong></li>
          </ul>
        </li>
        <li><strong>Right to Non-Discrimination:</strong> We will not discriminate against you for exercising your rights</li>
      </ul>

      <p className="mb-6 text-sm text-muted-foreground md:text-base">
        To exercise your rights, contact us at <EmailWithFallback /> or via our Contact page.
      </p>

      <hr className="my-6 border-border" />

      <h2 className="mb-4 text-xl font-semibold">13. Children's Privacy</h2>
      <p className="mb-4 text-sm text-muted-foreground md:text-base">
        CalorieVision is not intended for children.
      </p>
      <p className="mb-2 text-sm text-muted-foreground md:text-base">
        <strong>Age Requirements:</strong>
      </p>
      <ul className="mb-4 list-disc space-y-1 pl-5 text-sm text-muted-foreground md:text-base">
        <li><strong>EU/EEA/UK:</strong> Not intended for children under 16 years of age</li>
        <li><strong>United States:</strong> Not intended for children under 13 years of age (COPPA)</li>
        <li><strong>Other regions:</strong> Not intended for children under the minimum digital consent age</li>
      </ul>
      <p className="mb-6 text-sm text-muted-foreground md:text-base">
        We do not knowingly collect personal data from children. If you believe a child has provided us with personal data, please contact us immediately at <EmailWithFallback />, and we will delete such information.
      </p>

      <hr className="my-6 border-border" />

      <h2 className="mb-4 text-xl font-semibold">14. Do Not Track Signals</h2>
      <p className="mb-2 text-sm text-muted-foreground md:text-base">
        Some browsers offer a "Do Not Track" (DNT) feature. Our website does not currently respond to DNT signals. However, you can manage your privacy preferences through:
      </p>
      <ul className="mb-6 list-disc space-y-1 pl-5 text-sm text-muted-foreground md:text-base">
        <li>Our cookie consent tool</li>
        <li>Your browser settings</li>
        <li>Third-party opt-out tools (see Section 7)</li>
      </ul>

      <hr className="my-6 border-border" />

      <h2 className="mb-4 text-xl font-semibold">15. Links to Other Websites</h2>
      <p className="mb-6 text-sm text-muted-foreground md:text-base">
        Our Service may contain links to third-party websites. We are not responsible for the privacy practices of these external sites. We encourage you to review their privacy policies before providing any personal information.
      </p>

      <hr className="my-6 border-border" />

      <h2 className="mb-4 text-xl font-semibold">16. Changes to This Privacy Policy</h2>
      <p className="mb-2 text-sm text-muted-foreground md:text-base">
        We may update this Privacy Policy from time to time. When we make changes:
      </p>
      <ul className="mb-4 list-disc space-y-1 pl-5 text-sm text-muted-foreground md:text-base">
        <li>We will update the "Last updated" date at the top</li>
        <li>For material changes, we may notify you via email or website notice</li>
        <li>Continued use of the Service after changes constitutes acceptance</li>
      </ul>
      <p className="mb-6 text-sm text-muted-foreground md:text-base">
        We encourage you to review this Privacy Policy periodically.
      </p>

      <hr className="my-6 border-border" />

      <h2 className="mb-4 text-xl font-semibold">17. Contact Us</h2>
      <p className="mb-4 text-sm text-muted-foreground md:text-base">
        If you have any questions about this Privacy Policy or wish to exercise your privacy rights, please contact us:
      </p>

      <p className="mb-2 text-sm text-muted-foreground md:text-base">
        <strong>General Inquiries:</strong>
      </p>
      <ul className="mb-4 list-disc space-y-1 pl-5 text-sm text-muted-foreground md:text-base">
        <li><EmailWithFallback showLabel /></li>
        <li><strong className="text-foreground">Website:</strong>{" "}<a href="https://calorievision.online" target="_blank" rel="noopener noreferrer" className="text-primary underline">calorievision.online</a></li>
        <li><strong className="text-foreground">Contact Page:</strong>{" "}<a href="https://calorievision.online/contact" target="_blank" rel="noopener noreferrer" className="text-primary underline">calorievision.online/contact</a></li>
      </ul>

      <p className="mb-2 text-sm text-muted-foreground md:text-base">
        <strong>Privacy/GDPR Requests:</strong>
      </p>
      <ul className="mb-4 list-disc space-y-1 pl-5 text-sm text-muted-foreground md:text-base">
        <li><EmailWithFallback showLabel /></li>
        <li><strong className="text-foreground">Subject line:</strong> "GDPR Request" or "Privacy Request"</li>
      </ul>

      <p className="mb-2 text-sm text-muted-foreground md:text-base">
        <strong>CCPA Requests (California Residents):</strong>
      </p>
      <ul className="mb-4 list-disc space-y-1 pl-5 text-sm text-muted-foreground md:text-base">
        <li><EmailWithFallback showLabel /></li>
        <li><strong className="text-foreground">Subject line:</strong> "CCPA Request"</li>
      </ul>

      <p className="mb-6 text-sm text-muted-foreground md:text-base">
        We will respond to your request within 30 days (or within the timeframe required by applicable law).
      </p>

      <hr className="my-6 border-border" />

      <p className="text-sm italic text-muted-foreground md:text-base">
        By using CalorieVision, you acknowledge that you have read and understood this Privacy Policy.
      </p>
    </LegalPageWrapper>
  );
};

export default PrivacyPolicy;
