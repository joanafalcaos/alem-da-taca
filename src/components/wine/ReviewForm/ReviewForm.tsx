import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button, Checkbox, Input, Rating, Textarea } from '@/components/ui'
import type { Review, ReviewFormValues, Wine } from '@/types'
import styles from './ReviewForm.module.css'

const reviewFormSchema = z.object({
  overallRating: z.number().min(0.5, 'Dê uma nota geral para o vinho'),
  aroma: z.number().min(0).max(5),
  palate: z.number().min(0).max(5),
  acidity: z.number().min(0).max(5),
  body: z.number().min(0).max(5),
  tannins: z.number().min(0).max(5),
  valueForMoney: z.number().min(0).max(5),
  comment: z.string().optional(),
  occasion: z.string().optional(),
  foodPairing: z.string().optional(),
  wouldBuyAgain: z.boolean(),
})

type ReviewFormSchema = z.infer<typeof reviewFormSchema>

const DIMENSION_FIELDS: { name: keyof ReviewFormSchema; label: string }[] = [
  { name: 'aroma', label: 'Aroma' },
  { name: 'palate', label: 'Sabor' },
  { name: 'acidity', label: 'Acidez' },
  { name: 'body', label: 'Corpo' },
  { name: 'tannins', label: 'Taninos' },
  { name: 'valueForMoney', label: 'Custo-benefício' },
]

export interface ReviewFormProps {
  wine: Wine
  defaultReview?: Review
  onSubmit: (values: ReviewFormValues) => void
  isSubmitting?: boolean
}

export function ReviewForm({ wine, defaultReview, onSubmit, isSubmitting }: ReviewFormProps) {
  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ReviewFormSchema>({
    resolver: zodResolver(reviewFormSchema),
    defaultValues: defaultReview
      ? {
          overallRating: defaultReview.overallRating,
          aroma: defaultReview.aroma,
          palate: defaultReview.palate,
          acidity: defaultReview.acidity,
          body: defaultReview.body,
          tannins: defaultReview.tannins,
          valueForMoney: defaultReview.valueForMoney,
          comment: defaultReview.comment,
          occasion: defaultReview.occasion,
          foodPairing: defaultReview.foodPairing,
          wouldBuyAgain: defaultReview.wouldBuyAgain,
        }
      : {
          overallRating: 0,
          aroma: 0,
          palate: 0,
          acidity: 0,
          body: 0,
          tannins: 0,
          valueForMoney: 0,
          wouldBuyAgain: false,
        },
  })

  function submit(values: ReviewFormSchema) {
    onSubmit({
      overallRating: values.overallRating,
      aroma: values.aroma,
      palate: values.palate,
      acidity: values.acidity,
      body: values.body,
      tannins: values.tannins,
      valueForMoney: values.valueForMoney,
      comment: values.comment?.trim() ?? '',
      occasion: values.occasion?.trim() ?? '',
      foodPairing: values.foodPairing?.trim() ?? '',
      wouldBuyAgain: values.wouldBuyAgain,
    })
  }

  return (
    <form onSubmit={handleSubmit(submit)} className={styles.form} noValidate>
      <p className={styles.wineName}>
        {wine.name} <span className={styles.wineWinery}>· {wine.winery}</span>
      </p>

      <div className={styles.overallField}>
        <span className={styles.label}>Nota geral</span>
        <Controller
          control={control}
          name="overallRating"
          render={({ field }) => (
            <Rating value={field.value} onChange={field.onChange} size="lg" showValue aria-label="Nota geral" />
          )}
        />
        {errors.overallRating && <span className={styles.errorText}>{errors.overallRating.message}</span>}
      </div>

      <div className={styles.grid}>
        {DIMENSION_FIELDS.map(({ name, label }) => (
          <div key={name} className={styles.ratingField}>
            <span className={styles.label}>{label}</span>
            <Controller
              control={control}
              name={name}
              render={({ field }) => (
                <Rating
                  value={field.value as number}
                  onChange={field.onChange}
                  size="sm"
                  showValue
                  aria-label={label}
                />
              )}
            />
          </div>
        ))}
      </div>

      <div className={styles.grid}>
        <Input label="Ocasião" optional placeholder="Ex: jantar em casa" {...register('occasion')} />
        <Input label="Harmonização" optional placeholder="Ex: queijos e nozes" {...register('foodPairing')} />
      </div>

      <Textarea
        label="Comentário"
        optional
        rows={4}
        placeholder="O que você achou desse vinho?"
        {...register('comment')}
      />

      <Checkbox label="Compraria este vinho novamente" {...register('wouldBuyAgain')} />

      <Button type="submit" isLoading={isSubmitting} fullWidth>
        {defaultReview ? 'Salvar avaliação' : 'Enviar avaliação'}
      </Button>
    </form>
  )
}
