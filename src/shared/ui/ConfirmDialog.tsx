import * as Dialog from '@radix-ui/react-dialog'
import { ExclamationTriangleIcon } from '@/shared/icons/Icons'
import { Button } from './Button'

interface ConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'default'
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'default',
}: ConfirmDialogProps) {
  const handleConfirm = () => {
    onConfirm()
    onClose()
  }

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-40" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-2rem)] sm:w-full max-w-md bg-white rounded-lg shadow-xl z-50 p-6">
          <div className="flex items-start gap-4 mb-6">
            {variant === 'danger' && (
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                  <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
                </div>
              </div>
            )}
            <div className="flex-1">
              <Dialog.Title className="text-xl font-semibold text-gray-900 mb-2">
                {title}
              </Dialog.Title>
              <Dialog.Description className="text-gray-600">
                {description}
              </Dialog.Description>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Dialog.Close asChild>
              <Button variant="secondary" type="button">
                {cancelText}
              </Button>
            </Dialog.Close>
            <Button
              variant={variant === 'danger' ? 'danger' : 'primary'}
              type="button"
              onClick={handleConfirm}
            >
              {confirmText}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}



