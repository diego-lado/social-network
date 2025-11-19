import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '@/shared/ui/Button'
import { FormField } from '@/shared/ui/FormField'
import { Input } from '@/shared/ui/Input'
import { Textarea } from '@/shared/ui/Textarea'

interface CommentFormProps {
  onSubmit: (content: string, name: string, avatar: string) => void
  onCancel?: () => void
  placeholder?: string
  initialContent?: string
  initialName?: string
  initialAvatar?: string
  isEditMode?: boolean
}

interface CommentFormData {
  content: string
  name: string
  avatar: string
}

export function CommentForm({
  onSubmit,
  onCancel,
  placeholder = 'Escribe un comentario...',
  initialContent = '',
  initialName = '',
  initialAvatar = '',
  isEditMode = false,
}: CommentFormProps) {
  const {
    register,
    handleSubmit: handleFormSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<CommentFormData>({
    defaultValues: {
      content: initialContent,
      name: initialName,
      avatar: initialAvatar,
    },
  })

  // Actualizar valores cuando cambian las props iniciales (modo edición)
  useEffect(() => {
    if (isEditMode) {
      setValue('content', initialContent)
      setValue('name', initialName)
      setValue('avatar', initialAvatar)
    }
  }, [isEditMode, initialContent, initialName, initialAvatar, setValue])

  const onSubmitForm = (data: CommentFormData) => {
    onSubmit(
      data.content.trim(),
      data.name.trim(),
      data.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.name || 'user'}`
    )
    // Solo limpiar si no es modo edición
    if (!isEditMode) {
      reset()
    }
  }

  return (
    <form onSubmit={handleFormSubmit(onSubmitForm)} className="space-y-3" noValidate>
      {!isEditMode && (
        <FormField error={errors.name?.message}>
          <Input
            {...register('name', {
              required: 'El nombre es requerido',
              minLength: {
                value: 2,
                message: 'El nombre debe tener al menos 2 caracteres',
              },
            })}
            className="text-sm"
            placeholder="Tu nombre"
            error={!!errors.name}
          />
        </FormField>
      )}
      <FormField error={errors.content?.message}>
        <Textarea
          {...register('content', {
            required: 'El comentario es requerido',
            minLength: {
              value: 3,
              message: 'El comentario debe tener al menos 3 caracteres',
            },
          })}
          className="text-sm"
          rows={3}
          placeholder={placeholder}
          error={!!errors.content}
        />
      </FormField>
      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button
            variant="secondary"
            size="small"
            type="button"
            onClick={onCancel}
          >
            Cancelar
          </Button>
        )}
        <Button size="small" type="submit">
          {isEditMode ? 'Guardar' : 'Comentar'}
        </Button>
      </div>
    </form>
  )
}

