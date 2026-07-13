export const metadata = { title: "Terms of Service — CaseForge AI" }

export default function TermsPage() {
  return (
    <article className="prose prose-sm max-w-none text-ink">
      <h1 className="text-ink text-2xl font-bold mb-2">Terms of Service</h1>
      <p className="text-ink-faint text-sm mb-8">Last updated: July 13, 2026</p>

      <Section title="1. Acceptance of Terms">
        By creating an account or using CaseForge AI ("Service"), you agree to these Terms of Service. If you do not agree, do not use the Service.
      </Section>

      <Section title="2. Description of Service">
        CaseForge AI is an AI-powered consulting interview practice platform. The Service provides simulated case interviews, feedback, scoring, and drill recommendations to help users prepare for consulting interviews.
      </Section>

      <Section title="3. Eligibility">
        You must be at least 13 years old to use the Service. By registering, you represent that you meet this requirement.
      </Section>

      <Section title="4. Account Responsibilities">
        You are responsible for maintaining the confidentiality of your account credentials and for all activity under your account. Notify us immediately at support@caseforge.ai if you suspect unauthorized access.
      </Section>

      <Section title="5. Acceptable Use">
        You agree not to: (a) use the Service for any unlawful purpose; (b) attempt to reverse-engineer or scrape the Service; (c) share your account with others; (d) use the Service to train competing AI systems.
      </Section>

      <Section title="6. AI-Generated Content">
        The Service uses AI to generate interview questions, feedback, and evaluations. AI-generated content may be inaccurate or incomplete. It does not constitute professional career advice. CaseForge AI makes no guarantee that using the Service will result in a job offer.
      </Section>

      <Section title="7. Intellectual Property">
        All content, trademarks, and software on the Service are owned by CaseForge AI or its licensors. You may not reproduce or distribute any part of the Service without written permission.
      </Section>

      <Section title="8. Subscription and Billing">
        Paid plans are billed as described at the time of purchase. Refunds are not provided for partial subscription periods unless required by law.
      </Section>

      <Section title="9. Termination">
        We may suspend or terminate your account at any time for violation of these Terms. You may delete your account at any time from your account settings.
      </Section>

      <Section title="10. Disclaimers">
        THE SERVICE IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND. TO THE FULLEST EXTENT PERMITTED BY LAW, CASEFORGE AI DISCLAIMS ALL WARRANTIES, EXPRESS OR IMPLIED.
      </Section>

      <Section title="11. Limitation of Liability">
        TO THE MAXIMUM EXTENT PERMITTED BY LAW, CASEFORGE AI SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, OR CONSEQUENTIAL DAMAGES ARISING FROM YOUR USE OF THE SERVICE.
      </Section>

      <Section title="12. Changes to Terms">
        We may update these Terms from time to time. Continued use of the Service after changes constitutes acceptance of the updated Terms.
      </Section>

      <Section title="13. Contact">
        Questions about these Terms? Email us at support@caseforge.ai.
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
