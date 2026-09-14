"use client"

import {
  Dialog,
  Portal,
  Button,
  Text,
  VStack,
  HStack,
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
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content rounded="2xl" maxW="sm" mx={4}>
            <Dialog.Header>
              <VStack gap={2} align="start">
                <HStack gap={2}>
                  <Icon
                    as={FiAlertTriangle}
                    color="fg.error"
                    boxSize={5}
                  />
                  <Dialog.Title fontSize="lg">{title}</Dialog.Title>
                </HStack>
              </VStack>
            </Dialog.Header>
            <Dialog.Body>
              <Text color="fg.muted" fontSize="sm">
                {description}
              </Text>
            </Dialog.Body>
            <Dialog.Footer gap={2}>
              <Dialog.ActionTrigger asChild>
                <Button variant="outline" flex={1}>
                  Cancel
                </Button>
              </Dialog.ActionTrigger>
              <Button
                colorPalette={colorPalette as "red"}
                onClick={onConfirm}
                flex={1}
              >
                {confirmLabel}
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  )
}
