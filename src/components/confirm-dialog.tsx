"use client"

import {
  Dialog,
  Portal,
  Button,
  VStack,
  Flex,
  Icon,
} from "@chakra-ui/react"
import { FiAlertTriangle } from "react-icons/fi"

interface ConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  confirmLabel?: string
  onConfirm: () => void
  colorPalette?: string
}

/**
 * Confirmation modal — mirrors the Alpaca APP `DeletePhotoDialog`:
 * a circled warning glyph, a short question, a supporting sentence and a
 * two-column action row (cancel / confirm).
 */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirm",
  onConfirm,
  colorPalette = "red",
}: ConfirmDialogProps) {
  return (
    <Dialog.Root
      open={open}
      onOpenChange={(details) => onOpenChange(details.open)}
    >
      <Portal>
        <Dialog.Backdrop backdropBlur="sm" bg="black/20" />
        <Dialog.Positioner
          position="fixed"
          inset={0}
          display="flex"
          alignItems="center"
          justifyContent="center"
          p={4}
        >
          <Dialog.Content
            rounded="2xl"
            maxW="md"
            w="full"
            p={6}
            shadow="modal"
            borderWidth="1px"
            borderColor="border.subtle"
          >
            <VStack gap={3} textAlign="center">
              <Flex
                w={12}
                h={12}
                rounded="full"
                bg="bg.error"
                color="fg.error"
                align="center"
                justify="center"
              >
                <Icon as={FiAlertTriangle} boxSize={6} />
              </Flex>

              <Dialog.Title fontSize="lg" fontWeight="bold" color="fg">
                {title}
              </Dialog.Title>

              <Dialog.Description fontSize="sm" color="fg.muted">
                {description}
              </Dialog.Description>

              <Flex gap={3} w="full" pt={2}>
                <Dialog.ActionTrigger asChild>
                  <Button variant="outline" flex={1} rounded="full" borderColor="border.subtle">
                    Cancel
                  </Button>
                </Dialog.ActionTrigger>
                <Button
                  colorPalette={colorPalette as "red"}
                  onClick={onConfirm}
                  flex={1}
                  rounded="full"
                  fontWeight="semibold"
                >
                  {confirmLabel}
                </Button>
              </Flex>
            </VStack>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  )
}
