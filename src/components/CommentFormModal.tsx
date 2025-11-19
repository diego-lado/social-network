import * as Dialog from '@radix-ui/react-dialog'
import { Cross2Icon } from '@/shared/icons/Icons'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '@/shared/ui/Button'
import { FormField } from '@/shared/ui/FormField'
import { Input } from '@/shared/ui/Input'
import { Textarea } from '@/shared/ui/Textarea'
import type { Comment } from '@/types'

interface CommentFormModalProps {
  comment?: Comment | null
  isOpen: boolean
  onClose: () => void
  onSubmit: (content: string, name: string, avatar: string) => void
}

interface CommentFormData {
  content: string
  name: string
  avatar: string
}

export function CommentFormModal({ comment, isOpen, onClose, onSubmit }: CommentFormModalProps) {
  const {
    register,
    handleSubmit: handleFormSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<CommentFormData>({
    defaultValues: {
      content: '',
      name: '',
      avatar: '',
    },
  })

  useEffect(() => {
    if (comment) {
      setValue('content', comment.content)
      setValue('name', comment.name)
      setValue('avatar', comment.avatar)
    } else {
      reset()
    }
  }, [comment, isOpen, setValue, reset])

  const onSubmitForm = (data: CommentFormData) => {
    onSubmit(
      data.content.trim(),
      data.name.trim(),
      data.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.name || 'user'}`
    )
    if (!comment) {
      reset()
    }
  }

  const isEditMode = !!comment

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-40" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-2rem)] sm:w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-lg shadow-xl z-50 p-4 sm:p-6">
          <div className="flex items-center justify-between mb-6">
            <Dialog.Title className="text-2xl font-bold text-gray-900">
              {isEditMode ? 'Editar Comentario' : 'Nuevo Comentario'}
            </Dialog.Title>
            <Dialog.Close asChild>
              <button
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
                aria-label="Cerrar"
              >
                <Cross2Icon className="w-5 h-5 text-gray-600" />
              </button>
            </Dialog.Close>
          </div>

          <form onSubmit={handleFormSubmit(onSubmitForm)} className="space-y-4" noValidate>
            {!isEditMode && (
              <FormField
                label="Nombre"
                error={errors.name?.message}
                required
              >
                <Input
                  {...register('name', {
                    required: 'El nombre es requerido',
                    minLength: {
                      value: 2,
                      message: 'El nombre debe tener al menos 2 caracteres',
                    },
                  })}
                  placeholder="Tu nombre"
                  error={!!errors.name}
                />
              </FormField>
            )}

            {!isEditMode && (
              <FormField
                label="Avatar URL (opcional)"
                error={errors.avatar?.message}
              >
                <Input
                  {...register('avatar', {
                    pattern: {
                      value: /^https?:\/\/.+/,
                      message: 'Debe ser una URL válida',
                    },
                  })}
                  type="url"
                  placeholder="https://ejemplo.com/avatar.jpg"
                  error={!!errors.avatar}
                />
              </FormField>
            )}

            <FormField
              label="Comentario"
              error={errors.content?.message}
              required
            >
              <Textarea
                {...register('content', {
                  required: 'El comentario es requerido',
                  minLength: {
                    value: 3,
                    message: 'El comentario debe tener al menos 3 caracteres',
                  },
                })}
                rows={6}
                placeholder="Escribe tu comentario aquí..."
                error={!!errors.content}
              />
            </FormField>

            <div className="flex justify-end gap-3 pt-4">
              <Dialog.Close asChild>
                <Button variant="secondary" type="button">
                  Cancelar
                </Button>
              </Dialog.Close>
              <Button type="submit">
                {isEditMode ? 'Guardar Cambios' : 'Comentar'}
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

