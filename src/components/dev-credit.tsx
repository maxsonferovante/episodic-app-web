"use client"

import { Flex, HStack, Icon, Link, Text } from "@chakra-ui/react"
import { FiGithub, FiLinkedin } from "react-icons/fi"

const GITHUB_URL = "https://github.com/maxsonferovante"
const LINKEDIN_URL = "https://www.linkedin.com/in/maxson-almeida/"

interface SocialLinksProps {
  size?: "sm" | "md"
}

/** GitHub + LinkedIn icon links. */
export function SocialLinks({ size = "sm" }: SocialLinksProps) {
  const boxSize = size === "md" ? 4.5 : 3.5
  return (
    <HStack gap={size === "md" ? 3 : 2.5}>
      <Link
        href={GITHUB_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="GitHub"
        color="fg.muted"
        _hover={{ color: "fg" }}
        transition="color"
      >
        <Icon as={FiGithub} boxSize={boxSize} />
      </Link>
      <Link
        href={LINKEDIN_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="LinkedIn"
        color="fg.muted"
        _hover={{ color: "fg" }}
        transition="color"
      >
        <Icon as={FiLinkedin} boxSize={boxSize} />
      </Link>
    </HStack>
  )
}

interface DevCreditProps extends SocialLinksProps {
  justify?: "start" | "center"
}

/** "Developed by Maxson Almeida" with the social links. */
export function DevCredit({ size = "sm", justify = "center" }: DevCreditProps) {
  return (
    <Flex align="center" gap={size === "md" ? 3 : 2.5} justify={justify} wrap="wrap">
      <Text fontSize="xs" color="fg.muted">
        Developed by Maxson Almeida
      </Text>
      <SocialLinks size={size} />
    </Flex>
  )
}

export default DevCredit
