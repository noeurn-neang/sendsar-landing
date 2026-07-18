import Link from "next/link";

import { LegalPageShell, LegalSection } from "@/components/legal/LegalPageShell";
import { createMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/site";

export const metadata = createMetadata({
  title: "Terms of Service",
  description:
    "Terms for using the Sendsar headless chat API, developer console, and related services.",
  path: "/terms",
});

export default function TermsPage() {
  const { legal, contactEmail, contactMailto, name } = siteConfig;

  return (
    <LegalPageShell
      title="Terms of Service"
      description={`These Terms govern your use of ${name} — a headless chat, messaging, and calls API operated by ${legal.operatorName}.`}
    >
      <LegalSection id="agreement" title="1. Agreement">
        <p>
          By creating an account, calling our APIs, or using the developer
          console, you agree to these Terms and our{" "}
          <Link href="/privacy" className="font-medium text-brand hover:text-brand-strong">
            Privacy Policy
          </Link>
          . If you use {name} on behalf of a company or team, you confirm you have
          authority to bind that organization.
        </p>
        <p>
          {name} is currently operated by <strong>{legal.operatorName}</strong> as
          an individual (not a registered company). Contact:{" "}
          <a href={contactMailto} className="font-medium text-brand hover:text-brand-strong">
            {contactEmail}
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection id="service" title="2. The service">
        <p>
          {name} provides APIs and infrastructure so you can add chat, presence,
          file uploads, webhooks, and optional voice/video to products that{" "}
          <strong>already have</strong> their own users, auth, and frontend. We do
          not replace your login system or own your end-user relationships.
        </p>
        <p>
          Features, limits, and pricing may change as we grow. Free and paid plan
          details on the website are the current commercial offer unless we agree
          otherwise in writing (including email/Telegram).
        </p>
      </LegalSection>

      <LegalSection id="accounts" title="3. Accounts and eligibility">
        <p>
          You must be at least 18 years old (or the age of majority in your place
          of residence) to open a developer console account. Keep your login and
          API keys confidential. You are responsible for activity under your keys
          and workspace.
        </p>
      </LegalSection>

      <LegalSection id="your-responsibilities" title="4. Your responsibilities">
        <ul className="list-disc space-y-2 pl-5">
          <li>
            Comply with laws that apply to your product and the content you send
            through {name}
          </li>
          <li>
            Provide appropriate privacy notices and obtain any required consent
            from your end users
          </li>
          <li>
            Not upload or transmit illegal content, malware, or material that
            infringes others’ rights
          </li>
          <li>
            Not abuse the API (spam, scraping our systems, attacking others,
            attempting to bypass plan limits or security controls)
          </li>
          <li>
            Keep webhook endpoints and secrets secure on your side
          </li>
        </ul>
      </LegalSection>

      <LegalSection id="content" title="5. Content and data ownership">
        <p>
          You (and your end users, as applicable) retain rights to the content and
          identifiers you send to {name}. You grant us a limited license to host,
          process, transmit, and display that content solely to provide and secure
          the service.
        </p>
        <p>
          We may remove or suspend content or accounts that violate these Terms or
          create risk to the platform or other customers.
        </p>
      </LegalSection>

      <LegalSection id="api" title="6. API use and keys">
        <p>
          API access is provided for legitimate application traffic. Rate limits
          and fair-use controls may apply. Do not share secret keys publicly or
          embed them in client apps where they can be stolen — use server-side or
          short-lived tokens as documented.
        </p>
      </LegalSection>

      <LegalSection id="availability" title="7. Availability and changes">
        <p>
          We aim for reliable uptime but do not guarantee uninterrupted service.
          We may modify, suspend, or discontinue features with reasonable notice
          when practical. Early-stage / free tiers may change faster.
        </p>
      </LegalSection>

      <LegalSection id="payment" title="8. Plans and payment">
        <p>
          Paid plans, upgrades, and invoices are handled as described on the
          pricing page or in a separate agreement with you. Fees are generally
          non-refundable except where required by law or we agree otherwise.
        </p>
      </LegalSection>

      <LegalSection id="disclaimer" title="9. Disclaimer">
        <p>
          {name} is provided <strong>“as is”</strong> and <strong>“as available”</strong>.
          To the fullest extent permitted by law, we disclaim warranties of
          merchantability, fitness for a particular purpose, and non-infringement.
          You use the service at your own risk, especially while the product is
          early-stage.
        </p>
      </LegalSection>

      <LegalSection id="liability" title="10. Limitation of liability">
        <p>
          To the fullest extent permitted by law, {legal.operatorName} and {name}{" "}
          will not be liable for indirect, incidental, special, consequential, or
          lost-profit damages. Our total liability for any claim relating to the
          service is limited to the amounts you paid us for {name} in the three
          (3) months before the claim (or USD $0 if you are on a free plan).
        </p>
      </LegalSection>

      <LegalSection id="termination" title="11. Suspension and termination">
        <p>
          You may stop using {name} at any time. We may suspend or terminate access
          if you violate these Terms, create security risk, fail to pay, or if we
          shut down the service. Upon termination, your right to use the APIs ends;
          we may delete data after a reasonable period unless law requires retention.
        </p>
      </LegalSection>

      <LegalSection id="law" title="12. Governing law">
        <p>
          These Terms are governed by the laws of <strong>{legal.governingLaw}</strong>,
          without regard to conflict-of-law rules. Courts in {legal.governingLaw}{" "}
          will have exclusive jurisdiction, unless mandatory consumer rules say
          otherwise.
        </p>
      </LegalSection>

      <LegalSection id="changes" title="13. Changes to these Terms">
        <p>
          We may update these Terms by posting a new version on this page and
          updating the “Last updated” date. Continued use after changes means you
          accept the new Terms. If a change is material, we will try to notify you
          by email or a console notice when practical.
        </p>
      </LegalSection>
    </LegalPageShell>
  );
}
