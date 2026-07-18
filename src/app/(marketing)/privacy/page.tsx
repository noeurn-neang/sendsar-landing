import { LegalPageShell, LegalSection } from "@/components/legal/LegalPageShell";
import { createMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/site";

export const metadata = createMetadata({
  title: "Privacy Policy",
  description:
    "How Sendsar handles account data, API usage, and chat content you send through our headless messaging API.",
  path: "/privacy",
});

export default function PrivacyPage() {
  const { legal, contactEmail, contactMailto, name } = siteConfig;

  return (
    <LegalPageShell
      title="Privacy Policy"
      description={`${name} is a headless chat API. This page explains what we collect, why we collect it, and how we handle data when you use our console and APIs.`}
    >
      <LegalSection id="who" title="1. Who we are">
        <p>
          {name} is operated by <strong>{legal.operatorName}</strong>, an
          individual developer based in {legal.governingLaw}. There is no
          separate company entity behind this service today.
        </p>
        <p>
          Contact for privacy questions:{" "}
          <a href={contactMailto} className="font-medium text-brand hover:text-brand-strong">
            {contactEmail}
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection id="roles" title="2. Your role vs our role (important for APIs)">
        <p>
          If you integrate {name} into your app or website,{" "}
          <strong>you</strong> decide what end-user content is sent to us (messages,
          profiles you sync, files, call metadata). You are responsible for your
          product’s privacy notice, consent, and lawful use of that content.
        </p>
        <p>
          We process that content to run the messaging, presence, upload, webhook,
          and call features you enable. We do not use your end users’ chat content
          to train public AI models or to sell advertising.
        </p>
      </LegalSection>

      <LegalSection id="collect" title="3. What we collect">
        <p>
          <strong>Console / account data</strong> (when you sign in with Google or
          GitHub): name, email, avatar URL, OAuth provider IDs, workspace settings,
          API keys (hashed/stored for auth), plan and usage metrics, webhook URLs,
          and support messages you send us.
        </p>
        <p>
          <strong>Service / API data</strong> (from your apps via gateway APIs):
          tenant and app identifiers, your end-user IDs and optional display
          profiles, rooms/channels, messages, reactions, device tokens for push,
          upload metadata and files, webhook delivery logs, and call/session
          metadata when voice or video is enabled (via LiveKit or similar
          infrastructure).
        </p>
        <p>
          <strong>Technical data</strong>: IP addresses, user-agent, request logs,
          error logs, and approximate usage counters needed to operate, secure, and
          bill the service.
        </p>
      </LegalSection>

      <LegalSection id="why" title="4. Why we use data">
        <ul className="list-disc space-y-2 pl-5">
          <li>Provide and improve the {name} console, APIs, and real-time features</li>
          <li>Authenticate API keys and protect accounts from abuse</li>
          <li>Meter usage, enforce plan limits, and support billing conversations</li>
          <li>Deliver webhooks and diagnose delivery failures</li>
          <li>Respond to support requests and security incidents</li>
          <li>Comply with law when we are legally required to</li>
        </ul>
      </LegalSection>

      <LegalSection id="where" title="5. Where data is stored">
        <p>
          Primary application and database hosting currently runs in{" "}
          <strong>{legal.hostingRegion}</strong>. File uploads are stored using{" "}
          <strong>{legal.fileStorage}</strong> (S3-compatible object storage).
        </p>
        <p>
          We also use standard infrastructure providers needed to run the product
          (for example OAuth sign-in, email/Telegram for support, and call media
          providers when you enable calls). Those providers process data only as
          needed to provide their service.
        </p>
      </LegalSection>

      <LegalSection id="share" title="6. Sharing and selling">
        <p>
          <strong>We do not sell your personal data</strong> or your end users’
          chat content.
        </p>
        <p>
          We may share data with infrastructure and service providers who help us
          operate {name} (hosting, storage, auth, realtime/media), or if required
          by law, or if you ask us to (for example during support).
        </p>
      </LegalSection>

      <LegalSection id="retention" title="7. Retention">
        <p>
          Account and workspace data is kept while your account is active. If you
          ask us to delete your account, we will delete or anonymize console data
          within a reasonable time, except records we must keep for security,
          fraud prevention, or legal reasons.
        </p>
        <p>
          Chat content and uploads stored for your apps follow your integration and
          any deletion APIs/tools we provide. You are responsible for deleting
          end-user data when your users request it under your own policies.
        </p>
      </LegalSection>

      <LegalSection id="security" title="8. Security">
        <p>
          We use industry-common practices such as TLS in transit, access controls,
          hashed API secrets where applicable, and least-privilege access to
          production systems. No method of transmission or storage is 100% secure;
          please protect your API keys and rotate them if exposed.
        </p>
      </LegalSection>

      <LegalSection id="rights" title="9. Your choices">
        <p>
          You can update workspace settings in the console, rotate API keys, and
          contact us to request access, correction, or deletion of your account
          data. For end-user requests about content inside your product, handle
          those in your app first — we can help delete tenant data when you ask.
        </p>
      </LegalSection>

      <LegalSection id="children" title="10. Children">
        <p>
          The {name} developer console is intended for people 18 or older (or the
          age of majority where you live). You are responsible for ensuring your
          own product’s use of {name} complies with child-privacy rules that apply
          to your end users.
        </p>
      </LegalSection>

      <LegalSection id="changes" title="11. Changes">
        <p>
          We may update this Privacy Policy as the product grows. We will change
          the “Last updated” date at the top of this page. Continued use of {name}{" "}
          after an update means you accept the revised policy.
        </p>
      </LegalSection>
    </LegalPageShell>
  );
}
