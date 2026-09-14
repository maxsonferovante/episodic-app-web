"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import {
  Box,
  Center,
  Heading,
  Text,
  VStack,
  Spinner,
  Button,
  Icon,
  Flex,
  Grid,
  Badge,
} from "@chakra-ui/react"
import { GoogleButton } from "@/components/google-button"
import { useAuth } from "@/contexts/auth-context"
import { FiTv, FiClock, FiBookOpen, FiStar, FiChevronDown } from "react-icons/fi"

const faqItems = [
  {
    q: "Como funciona o tracking",
    a: "Busque suas séries favoritas, adicione à biblioteca e marque episódios assistidos. O app calcula seu progresso e sugere o próximo episódio automaticamente.",
  },
  {
    q: "Privacidade dos dados",
    a: "Usamos Google OAuth apenas para identificar você e associar seu progresso. Não compartilhamos seus dados com terceiros.",
  },
]

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <Box borderBottomWidth="1px" borderColor="border.subtle" pt={2}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setOpen(!open)}
        w="full"
        justifyContent="space-between"
        fontWeight="semibold"
        fontSize="xs"
        px={0}
      >
        {q}
        <Icon
          as={FiChevronDown}
          transform={open ? "rotate(180deg)" : "none"}
          transition="transform 0.2s"
        />
      </Button>
      {open && (
        <Text fontSize="xs" color="fg.muted" py={2} pr={4}>
          {a}
        </Text>
      )}
    </Box>
  )
}

export default function LoginPage() {
  const { login, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push("/")
    }
  }, [isAuthenticated, isLoading, router])

  if (isLoading) {
    return (
      <Center minH="100vh">
        <Spinner size="lg" />
      </Center>
    )
  }

  if (isAuthenticated) return null

  return (
    <Box minH="100vh" bg="bg.subtle">
      <Flex
        direction="column"
        justify="center"
        gap={{ base: 8, md: 10 }}
        maxW="5xl"
        mx="auto"
        px={{ base: 6, md: 10 }}
        py={{ base: 12, md: 16 }}
        minH="100vh"
      >
        {/* Cabeçalho (acima das duas colunas) */}
        <VStack align="start" gap={2}>
          <Heading size="3xl" letterSpacing="tight">
            Episodic
          </Heading>
          <Text color="fg.muted" fontSize="sm" fontWeight="medium">
            Rastreie o progresso das suas séries de TV
          </Text>
        </VStack>

        {/* Colunas de altura igual — os dois cards alinham topo e base */}
        <Grid
          templateColumns={{ base: "1fr", md: "1fr 1fr" }}
          gap={{ base: 8, md: 10 }}
          alignItems="stretch"
        >
          {/* Card de apresentação */}
          <Box
            p={6}
            rounded="2xl"
            borderWidth="1px"
            borderColor="border.subtle"
            bg="bg"
            shadow="sm"
            h="full"
            display="flex"
            flexDirection="column"
          >
            <Text fontSize="sm" fontWeight="semibold" mb={3}>
              Seu catálogo pessoal de séries, organizado e sempre atualizado.
            </Text>
            <VStack align="start" gap={3} mt={4}>
              {[
                { icon: FiTv, text: "Busque qualquer série no catálogo" },
                { icon: FiBookOpen, text: "Adicione à sua biblioteca pessoal" },
                { icon: FiClock, text: "Marque episódios como assistidos" },
                { icon: FiStar, text: "Acompanhe progresso por temporada e série" },
              ].map(({ icon, text }) => (
                <Flex key={text} gap={2} align="center" fontSize="xs" color="fg.muted">
                  <Icon as={icon} color="fg.accent" />
                  <Text>{text}</Text>
                </Flex>
              ))}
            </VStack>

            <Box mt="auto" pt={4} borderTopWidth="1px" borderColor="border.subtle">
              {faqItems.map((item) => (
                <FaqItem key={item.q} {...item} />
              ))}
            </Box>
          </Box>

          {/* Card de login */}
          <Flex
            bg="bg"
            rounded="3xl"
            shadow="lg"
            borderWidth="1px"
            borderColor="border.subtle"
            overflow="hidden"
            direction="column"
            h="full"
          >
            <Box h={1.5} w="full" bg="accent" />
            <VStack flex={1} justify="center" p={8} gap={6}>
              <Center
                w={14}
                h={14}
                rounded="full"
                bg="bg.muted"
                shadow="sm"
              >
                <Icon as={FiTv} boxSize={6} color="fg.accent" />
              </Center>
              <VStack gap={1}>
                <Heading size="lg">Acessar o App</Heading>
                <Text fontSize="xs" color="fg.muted">
                  Faça login com sua conta Google para continuar.
                </Text>
              </VStack>
              <Box w="full">
                <GoogleButton
                  onSuccess={(credential) => {
                    login(credential).then(() => {
                      router.push("/")
                    })
                  }}
                  onError={() => {
                    console.error("Google login failed")
                  }}
                />
              </Box>
              <Text fontSize="xs" color="fg.muted" textAlign="center">
                Episodic
              </Text>
            </VStack>
          </Flex>

          {/* Badge sob a coluna esquerda */}
          <Badge
            gridColumn={{ md: "1" }}
            justifySelf="flex-start"
            alignSelf="start"
            colorPalette="green"
            variant="subtle"
            fontSize="xs"
          >
            ✓ Biblioteca ilimitada · Progresso automático
          </Badge>
        </Grid>
      </Flex>
    </Box>
  )
}
