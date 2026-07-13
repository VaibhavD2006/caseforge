export const metadata = { title: "Privacy Policy — CaseForge AI" }

export default function PrivacyPage() {
  return (
    <article className="prose prose-sm max-w-none text-ink">
      <h1 className="text-ink text-2xl font-bold mb-2">Privacy Policy</h1>
      <p className="text-ink-faint text-sm mb-8">Last updated: July 13, 2026</p>

      <Section title="1. Information We Collect">
        We collect: (a) account information you provide (name, email, password hash); (b) interview session data including transcripts, scores, and analytics; (c) usage data such as pages visited and features used; (d) if you sign in with Google, your Google profile name and email.
      </Section>

      <Section title="2. How We Use Your Information">
        We use your information to: (a) provide and improve the Service; (b) generate personalized feedback and drill recommendations; (c) send transactional emails (verification, account notices); (d) analyze aggregate usage to improve AI model prompts and scoring.
      </Section>

      <Section title="3. Data Storage">
        Your data is stored on Supabase (PostgreSQL) hosted on AWS. Interview transcripts and scores are stored to power your analytics dashboard and session history. Passwords are hashed using bcrypt and are never stored in plain text.
      </Section>

      <Section title="4. AI Processing">
        Interview transcripts are sent to Google Gemini (via the Gemini API) for evaluation and response generation. Transcripts may be used by Google per their API data usage policies. We do not sell your transcripts to third parties.
      </Section>

      <Section title="5. Data Sharing">
        We do not sell your personal data. We share data only with: (a) service providers necessary to operate the Service (Supabase, Google Gemini, Resend, Vercel, Inngest); (b) law enforcement when required by law.
      </Section>

      <Section title="6. Cookies and Sessions">
        We use session cookies to keep you signed in. We do not use third-party advertising cookies.
      </Section>

      <Section title="7. Your Rights">
        You may request access to, correction of, or deletion of your personal data by emailing support@caseforge.ai. We will respond within 30 days. Account deletion removes all personal data within 90 days.
      </Section>

      <Section title="8. Data Retention">
        We retain account data while your account is active. Interview transcripts and scores are retained for 2 years unless you request deletion. Deleted accounts are purged within 90 days.
      </Section>

      <Section title="9. Children's Privacy">
        The Service is not directed at children under 13. We do not knowingly collect data from children under 13.
      </Section>

      <Section title="10. Changes to This Policy">
        We may update this Privacy Policy. We will notify you by email or in-app notice for material changes.
      </Section>

      <Section title="11. Contact">
        Privacy questions or data requests: support@caseforge.ai
      </Section>
    </article>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <h2 className="text-ink text-base font-semibold mb-2">{title}</h2>
      <p className="text-ink-muted text-sm leading-relaxed">{children}</p>
    </div>
  )
}
