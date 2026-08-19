import { useState, type FormEvent } from 'react';
import Badge from '../common/Badge';
import Button from '../common/Button';
import Card from '../common/Card';
import Input from '../common/Input';
import Select from '../common/Select';
import ImageUploader from './ImageUploader';
import { ApiError } from '../../lib/api-client';
import {
  CATEGORY_OPTIONS,
  CONDITION_OPTIONS,
  DEPARTMENT_OPTIONS,
} from '../../features/listings/constants';
import type {
  CreateListingRequest,
  Listing,
  ListingCategory,
  ListingCondition,
} from '../../types';

interface ListingFormValues {
  title: string;
  description: string;
  category: ListingCategory | '';
  condition: ListingCondition | '';
  price: string;
  department: string;
  courseTag: string;
  images: string[];
}

interface FormErrors {
  title?: string;
  description?: string;
  category?: string;
  condition?: string;
  price?: string;
  form?: string;
}

interface ListingFormProps {
  mode: 'create' | 'edit';
  initialListing?: Listing;
  onSubmit: (payload: CreateListingRequest) => Promise<void>;
  submitLabel?: string;
}

function toInitialValues(listing?: Listing): ListingFormValues {
  return {
    title: listing?.title ?? '',
    description: listing?.description ?? '',
    category: listing?.category ?? '',
    condition: listing?.condition ?? '',
    price: listing ? String(listing.price) : '',
    department: listing?.department ?? '',
    courseTag: listing?.courseTag ?? '',
    images: listing?.images ?? [],
  };
}

function validate(values: ListingFormValues): FormErrors {
  const errors: FormErrors = {};
  if (!values.title.trim()) {
    errors.title = 'Title is required.';
  } else if (values.title.trim().length < 3) {
    errors.title = 'Title must be at least 3 characters.';
  }
  if (!values.description.trim()) {
    errors.description = 'Description is required.';
  } else if (values.description.trim().length < 10) {
    errors.description = 'Description must be at least 10 characters.';
  }
  if (!values.category) {
    errors.category = 'Please select a category.';
  }
  if (!values.condition) {
    errors.condition = 'Please select a condition.';
  }
  if (!values.price.trim()) {
    errors.price = 'Price is required.';
  } else {
    const parsed = Number(values.price);
    if (Number.isNaN(parsed) || parsed < 0) {
      errors.price = 'Enter a valid, non-negative price.';
    }
  }
  return errors;
}

export default function ListingForm({
  mode,
  initialListing,
  onSubmit,
  submitLabel,
}: ListingFormProps) {
  const [values, setValues] = useState<ListingFormValues>(() =>
    toInitialValues(initialListing),
  );
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateField<K extends keyof ListingFormValues>(
    key: K,
    value: ListingFormValues[K],
  ) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors = validate(values);
    if (Object.values(nextErrors).some(Boolean)) {
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);
    try {
      await onSubmit({
        title: values.title.trim(),
        description: values.description.trim(),
        category: values.category as ListingCategory,
        condition: values.condition as ListingCondition,
        price: Number(values.price),
        department: values.department || undefined,
        courseTag: values.courseTag.trim() || undefined,
        images: values.images,
      });
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : 'Something went wrong while saving your listing. Please try again.';
      setErrors({ form: message });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="w-full max-w-2xl">
      <div className="mb-6">
        <Badge variant="primary" className="mb-3">
          {mode === 'create' ? 'New listing' : 'Edit listing'}
        </Badge>
        <h1 className="text-2xl font-bold text-text">
          {mode === 'create' ? 'Create a listing' : 'Edit your listing'}
        </h1>
        <p className="mt-2 text-sm text-text-muted">
          {mode === 'create'
            ? 'List a textbook, past exam paper, or piece of equipment for students at your university.'
            : 'Update the details below. Changes are visible to buyers immediately.'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {errors.form && (
          <div
            className="rounded-lg border border-danger-500/20 bg-danger-50 px-4 py-3 text-sm text-danger-600"
            role="alert"
          >
            {errors.form}
          </div>
        )}

        <Input
          label="Title"
          name="title"
          placeholder="e.g. Introduction to Algorithms, 3rd Edition"
          value={values.title}
          onChange={(event) => updateField('title', event.target.value)}
          error={errors.title}
          required
        />

        <div>
          <label
            htmlFor="description"
            className="mb-1.5 block text-sm font-medium text-text"
          >
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows={4}
            placeholder="Condition details, edition, what's included, pickup preferences..."
            value={values.description}
            onChange={(event) => updateField('description', event.target.value)}
            className={`block w-full rounded-lg border bg-surface px-3 py-2 text-sm text-text shadow-sm transition-colors placeholder:text-text-muted focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200 ${
              errors.description
                ? 'border-danger-500 focus:border-danger-500 focus:ring-danger-100'
                : 'border-border'
            }`}
            aria-invalid={errors.description ? true : undefined}
            required
          />
          {errors.description && (
            <p className="mt-1.5 text-xs text-danger-600" role="alert">
              {errors.description}
            </p>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Select
            label="Category"
            name="category"
            value={values.category}
            onChange={(event) =>
              updateField('category', event.target.value as ListingCategory)
            }
            options={CATEGORY_OPTIONS}
            placeholder="Select category"
            error={errors.category}
            required
          />
          <Select
            label="Condition"
            name="condition"
            value={values.condition}
            onChange={(event) =>
              updateField('condition', event.target.value as ListingCondition)
            }
            options={CONDITION_OPTIONS}
            placeholder="Select condition"
            error={errors.condition}
            required
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Price (ETB)"
            name="price"
            type="number"
            min="0"
            step="1"
            placeholder="0"
            value={values.price}
            onChange={(event) => updateField('price', event.target.value)}
            error={errors.price}
            required
          />
          <Input
            label="Course tag (optional)"
            name="courseTag"
            placeholder="e.g. CS301"
            value={values.courseTag}
            onChange={(event) => updateField('courseTag', event.target.value)}
          />
        </div>

        <Select
          label="Department (optional)"
          name="department"
          value={values.department}
          onChange={(event) => updateField('department', event.target.value)}
          options={DEPARTMENT_OPTIONS}
          placeholder="Select department"
        />

        <ImageUploader
          images={values.images}
          onChange={(images) => updateField('images', images)}
        />

        <Button type="submit" className="w-full" isLoading={isSubmitting}>
          {submitLabel ??
            (mode === 'create' ? 'Publish listing' : 'Save changes')}
        </Button>
      </form>
    </Card>
  );
}
