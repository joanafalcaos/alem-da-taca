import { zodResolver } from '@hookform/resolvers/zod'
import { ImagePlus, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { WINE_TYPE_PLACEHOLDER } from '@/assets/wine-types'
import { Button, Input, Select, Textarea } from '@/components/ui'
import { WINE_TYPE_LABELS, WINE_TYPES } from '@/types'
import type { Wine, WineFormValues } from '@/types'
import styles from './WineForm.module.css'

const currentYear = new Date().getFullYear()

const wineFormSchema = z.object({
  name: z.string().min(1, 'Informe o nome do vinho'),
  winery: z.string().min(1, 'Informe a vinícola'),
  country: z.string().min(1, 'Informe o país'),
  region: z.string().min(1, 'Informe a região'),
  grape: z.string().min(1, 'Informe a uva'),
  type: z.enum(WINE_TYPES),
  vintage: z.coerce
    .number({ error: 'Informe a safra' })
    .int('Informe um ano válido')
    .min(1900, 'Ano inválido')
    .max(currentYear, `A safra não pode ser maior que ${currentYear}`),
  price: z.coerce.number({ error: 'Informe o preço' }).min(0.01, 'Informe um preço válido'),
  alcoholContent: z.string().optional(),
  tags: z.string().optional(),
  notes: z.string().optional(),
})

type WineFormInput = z.input<typeof wineFormSchema>
type WineFormOutput = z.output<typeof wineFormSchema>

export interface WineFormProps {
  defaultWine?: Wine
  onSubmit: (values: WineFormValues) => void
  isSubmitting?: boolean
  submitLabel?: string
}

export function WineForm({ defaultWine, onSubmit, isSubmitting, submitLabel = 'Salvar vinho' }: WineFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(defaultWine?.photoUrl ?? null)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<WineFormInput, unknown, WineFormOutput>({
    resolver: zodResolver(wineFormSchema),
    defaultValues: defaultWine
      ? {
          name: defaultWine.name,
          winery: defaultWine.winery,
          country: defaultWine.country,
          region: defaultWine.region,
          grape: defaultWine.grape,
          type: defaultWine.type,
          vintage: defaultWine.vintage,
          price: defaultWine.price,
          alcoholContent: defaultWine.alcoholContent?.toString() ?? '',
          tags: defaultWine.tags.join(', '),
          notes: defaultWine.notes ?? '',
        }
      : { type: 'tinto' },
  })

  const watchedType = watch('type')

  useEffect(() => {
    return () => {
      if (photoPreview?.startsWith('blob:')) URL.revokeObjectURL(photoPreview)
    }
  }, [photoPreview])

  function handlePhotoChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    if (photoPreview?.startsWith('blob:')) URL.revokeObjectURL(photoPreview)
    setPhotoPreview(URL.createObjectURL(file))
  }

  function handleRemovePhoto() {
    if (photoPreview?.startsWith('blob:')) URL.revokeObjectURL(photoPreview)
    setPhotoPreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  function submit(values: WineFormOutput) {
    onSubmit({
      name: values.name.trim(),
      winery: values.winery.trim(),
      country: values.country.trim(),
      region: values.region.trim(),
      grape: values.grape.trim(),
      type: values.type,
      vintage: values.vintage,
      price: values.price,
      photoUrl: photoPreview,
      tags: values.tags
        ? values.tags
            .split(',')
            .map((tag) => tag.trim())
            .filter(Boolean)
        : [],
      alcoholContent: values.alcoholContent ? Number(values.alcoholContent) : undefined,
      notes: values.notes?.trim() || undefined,
    })
  }

  const previewSrc = photoPreview ?? WINE_TYPE_PLACEHOLDER[watchedType]

  return (
    <form onSubmit={handleSubmit(submit)} className={styles.form} noValidate>
      <div className={styles.photoSection}>
        <div className={styles.photoPreview}>
          <img src={previewSrc} alt="" />
        </div>
        <div className={styles.photoActions}>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className={styles.fileInput}
            onChange={handlePhotoChange}
            id="wine-photo"
          />
          <div className={styles.photoButtons}>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              leftIcon={<ImagePlus size={16} />}
              onClick={() => fileInputRef.current?.click()}
            >
              {photoPreview ? 'Trocar foto' : 'Adicionar foto'}
            </Button>
            {photoPreview && (
              <Button type="button" variant="ghost" size="sm" leftIcon={<X size={16} />} onClick={handleRemovePhoto}>
                Remover
              </Button>
            )}
          </div>
          <p className={styles.photoHint}>Sem foto, usamos uma ilustração padrão para o tipo do vinho.</p>
        </div>
      </div>

      <div className={styles.grid}>
        <Select label="Tipo" error={errors.type?.message} {...register('type')}>
          {WINE_TYPES.map((type) => (
            <option key={type} value={type}>
              {WINE_TYPE_LABELS[type]}
            </option>
          ))}
        </Select>
        <Input label="Nome" error={errors.name?.message} {...register('name')} />
        <Input label="Vinícola" error={errors.winery?.message} {...register('winery')} />
        <Input label="País" error={errors.country?.message} {...register('country')} />
        <Input label="Região" error={errors.region?.message} {...register('region')} />
        <Input label="Uva" error={errors.grape?.message} {...register('grape')} />
        <Input
          label="Safra"
          type="number"
          error={errors.vintage?.message}
          {...register('vintage')}
        />
        <Input
          label="Preço"
          type="number"
          step="0.01"
          error={errors.price?.message}
          {...register('price')}
        />
        <Input
          label="Teor alcoólico (%)"
          type="number"
          step="0.1"
          optional
          error={errors.alcoholContent?.message}
          {...register('alcoholContent')}
        />
        <Input
          label="Tags"
          optional
          hint="Separe por vírgula, ex: guarda, especial"
          error={errors.tags?.message}
          {...register('tags')}
        />
      </div>

      <Textarea
        label="Notas sobre a degustação"
        optional
        rows={4}
        error={errors.notes?.message}
        {...register('notes')}
      />

      <Button type="submit" isLoading={isSubmitting} fullWidth>
        {submitLabel}
      </Button>
    </form>
  )
}
