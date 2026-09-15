import type { Metadata } from "next"
import { Text } from "@chakra-ui/react"
import { LegalLayout, LegalSection } from "@/components/legal-layout"

export const metadata: Metadata = {
  title: "Terms of Use — Episodic",
  description: "The terms that govern your use of Episodic.",
}

export default function TermsOfUsePage() {
  return (
    <LegalLayout title="Terms of Use" updatedAt="September 14, 2026">
      <LegalSection title="Acceptance of these terms">
        <Text>
          By accessing or using Episodic (the &quot;Service&quot;) you agree to
          these Terms of Use. If you do not agree, please do not use the
          Service.
        </Text>
      </LegalSection>

      <LegalSection title="The service">
        <Text>
          Episodic is a personal tool to track the TV series you watch: build a
          library, mark episodes as watched, and see your progress, history and
          upcoming episodes. The Service is provided free of charge and may
          change or be discontinued at any time.
        </Text>
      </LegalSection>

      <LegalSection title="Your account">
        <Text>
          You sign in with your Google account. You are responsible for keeping
          access to that account secure and for all activity that happens under
          your session.
        </Text>
      </LegalSection>

      <LegalSection title="Acceptable use">
        <Text>
          You agree not to misuse the Service — including attempting to disrupt
          it, bypass its security or rate limits, access other users&apos; data,
          or use automated requests that place an unreasonable load on the
          infrastructure.
        </Text>
      </LegalSection>

      <LegalSection title="Third-party content">
        <Text>
          Series, season and episode information, including artwork, titles and
          air dates, is provided by The Movie Database (TMDB).
        </Text>
        <Text>
          <strong>
            This product uses the TMDB API but is not endorsed or certified by
            TMDB.
          </strong>
        </Text>
      </LegalSection>

      <LegalSection title="Intellectual property">
        <Text>
          The Service&apos;s name, logo and original code are the property of the
          developer. Third-party trademarks and content, including TMDB metadata
          and any streaming-provider logos, belong to their respective owners.
        </Text>
      </LegalSection>

      <LegalSection title="Disclaimer of warranties">
        <Text>
          The Service is provided &quot;as is&quot; and &quot;as
          available&quot;, without warranties of any kind, express or implied.
          Metadata may be incomplete or inaccurate, and availability is not
          guaranteed.
        </Text>
      </LegalSection>

      <LegalSection title="Limitation of liability">
        <Text>
          To the maximum extent permitted by law, the developer is not liable for
          any indirect, incidental or consequential damages arising from your use
          of, or inability to use, the Service.
        </Text>
      </LegalSection>

      <LegalSection title="Changes and termination">
        <Text>
          We may update these terms; continued use after a change means you
          accept the updated terms. We may suspend or terminate access to the
          Service at any time.
        </Text>
      </LegalSection>

      <LegalSection title="Governing law">
        <Text>
          These terms are governed by the laws applicable in the
          developer&apos;s place of residence, without regard to conflict-of-law
          rules.
        </Text>
      </LegalSection>

      <LegalSection title="Contact">
        <Text>
          Questions about these terms? Reach the developer on{" "}
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
