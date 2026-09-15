import type { Metadata } from "next"
import { Text } from "@chakra-ui/react"
import { LegalLayout, LegalSection } from "@/components/legal-layout"

export const metadata: Metadata = {
  title: "Privacy Policy — Episodic",
  description: "How Episodic collects, uses and protects your data.",
}

export default function PrivacyPolicyPage() {
  return (
    <LegalLayout title="Privacy Policy" updatedAt="September 14, 2026">
      <LegalSection title="Overview">
        <Text>
          Episodic is a personal TV series tracker. This policy explains what
          information the app processes when you sign in and use it, why we
          process it, and the choices you have. We keep the data we hold to the
          minimum needed to run the service.
        </Text>
      </LegalSection>

      <LegalSection title="Information we collect">
        <Text>
          <strong>Google account data.</strong> When you sign in with Google we
          receive your basic profile through Google OAuth: your name, email
          address and profile picture. We use these to identify you and to show
          your name next to the episodes you mark as watched.
        </Text>
        <Text>
          <strong>Usage data.</strong> We store the series you add to your
          library, the episodes you mark as watched or unwatched, and the
          timestamps of those actions, so we can show your progress and history.
        </Text>
        <Text>
          <strong>Technical data.</strong> Your session tokens and basic profile
          are stored in your browser&apos;s local storage. We do not use
          advertising cookies or third-party trackers.
        </Text>
      </LegalSection>

      <LegalSection title="How we use your information">
        <Text>
          We use your data only to provide the service: authenticating you,
          remembering your library and progress, and building your dashboard,
          history and upcoming episodes. We do not sell your data, and we do not
          use it for advertising or profiling.
        </Text>
      </LegalSection>

      <LegalSection title="Third-party services">
        <Text>
          <strong>Google.</strong> Sign-in is handled by Google Identity
          Services. Google processes your credentials under its own privacy
          policy; we only receive the basic profile described above.
        </Text>
        <Text>
          <strong>TMDB.</strong> Series, season and episode metadata (names,
          artwork, air dates) comes from The Movie Database (TMDB).
        </Text>
        <Text>
          Our backend runs on Amazon Web Services; your data is stored in a
          managed database in the region configured for the app.
        </Text>
      </LegalSection>

      <LegalSection title="Data retention">
        <Text>
          We keep your library and progress for as long as your account exists.
          Cached catalog data is kept for a limited time to reduce calls to the
          metadata provider. When you delete data through the app, it is removed
          from our systems.
        </Text>
      </LegalSection>

      <LegalSection title="Your choices and rights">
        <Text>
          You can remove series from your library and unmark episodes at any
          time inside the app. To delete your account and associated data,
          revoke Episodic&apos;s access from your{" "}
          <a href="https://myaccount.google.com/permissions" target="_blank" rel="noopener noreferrer">
            Google account permissions
          </a>{" "}
          and contact us so we can remove the remaining records.
        </Text>
      </LegalSection>

      <LegalSection title="Security">
        <Text>
          Access to your data requires a signed-in session. We apply
          rate-limiting and least-privilege access on the backend, and we never
          expose secrets to the browser beyond what the sign-in flow requires.
        </Text>
      </LegalSection>

      <LegalSection title="Children">
        <Text>
          Episodic is not directed to children under 13, and we do not knowingly
          collect data from them.
        </Text>
      </LegalSection>

      <LegalSection title="Changes to this policy">
        <Text>
          We may update this policy from time to time. Material changes will be
          reflected by the &quot;Last updated&quot; date above.
        </Text>
      </LegalSection>

      <LegalSection title="Contact">
        <Text>
          Questions about this policy? Reach the developer on{" "}
          <a href="https://github.com/maxsonferovante" target="_blank" rel="noopener noreferrer">
            GitHub
          </a>{" "}
          or{" "}
          <a href="https://www.linkedin.com/in/maxson-almeida/" target="_blank" rel="noopener noreferrer">
            LinkedIn
          </a>
          .
        </Text>
      </LegalSection>
    </LegalLayout>
  )
}
