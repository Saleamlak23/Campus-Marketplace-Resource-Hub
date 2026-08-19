import { FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import { ApiError } from '../../../lib/api-client';
import Badge from '../../../components/common/Badge';
import Button from '../../../components/common/Button';
import Card from '../../../components/common/Card';
import Input from '../../../components/common/Input';
import Select from '../../../components/common/Select';
import { useAuth } from '../hooks/useAuth';
import {
  getPasswordStrength,
  useUniversityFromEmail,
  validateEmail,
  validateName,
  validateRegistrationPassword,
} from '../hooks/useUniversityFromEmail';

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  universityIdNumber?: string;
  department?: string;
  year?: string;
  customDepartment?: string;
  form?: string;
}

const departmentOptions = [
  { value: 'Software Engineering', label: 'Software Engineering' },
  { value: 'Computer Science', label: 'Computer Science' },
  { value: 'Information Technology', label: 'Information Technology' },
  { value: 'Information Systems', label: 'Information Systems' },
  { value: 'Electrical & Computer Engineering', label: 'Electrical & Computer Engineering' },
  { value: 'Mechanical Engineering', label: 'Mechanical Engineering' },
  { value: 'Civil Engineering', label: 'Civil Engineering' },
  { value: 'Chemical Engineering', label: 'Chemical Engineering' },
  { value: 'Biomedical Engineering', label: 'Biomedical Engineering' },
  { value: 'Medicine', label: 'Medicine' },
  { value: 'Pharmacy', label: 'Pharmacy' },
  { value: 'Nursing', label: 'Nursing' },
  { value: 'Public Health', label: 'Public Health' },
  { value: 'Business Administration', label: 'Business Administration' },
  { value: 'Accounting & Finance', label: 'Accounting & Finance' },
  { value: 'Economics', label: 'Economics' },
  { value: 'Marketing', label: 'Marketing' },
  { value: 'Law', label: 'Law' },
  { value: 'Architecture', label: 'Architecture' },
  { value: 'Other', label: 'Other' },
];

const yearOptions = Array.from({ length: 9 }, (_, index) => ({
  value: String(index + 1),
  label: `Year ${index + 1}`,
}));

export default function RegisterForm() {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [universityIdNumber, setUniversityIdNumber] = useState('');
  const [department, setDepartment] = useState('');
  const [customDepartment, setCustomDepartment] = useState('');
  const [year, setYear] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { detectedUniversity, domain, isDomainSupported } =
    useUniversityFromEmail(email);
  const passwordStrength = getPasswordStrength(password, name);

  function validateConfirmPassword(value: string, passwordToMatch = password): string | undefined {
    if (!value) {
      return 'Please confirm your password.';
    }
    if (value !== passwordToMatch) {
      return 'Passwords do not match.';
    }
    return undefined;
  }

  function updateFieldError(field: keyof FormErrors, error: string | undefined) {
    setErrors((current) => ({ ...current, [field]: error, form: undefined }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors: FormErrors = {
      name: validateName(name),
      email: validateEmail(email),
      password: validateRegistrationPassword(password, name),
      confirmPassword: validateConfirmPassword(confirmPassword),
      universityIdNumber: universityIdNumber.trim()
        ? undefined
        : 'University ID is required.',
      department: department ? undefined : 'Please select your department.',
      year: year ? undefined : 'Please select your year.',
    };

    if (department === 'Other' && !customDepartment.trim()) {
      nextErrors.customDepartment = 'Please enter your department.';
    }

    const hasErrors = Object.values(nextErrors).some(Boolean);
    if (hasErrors) {
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      await register({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        universityIdNumber: universityIdNumber.trim(),
        department: department === 'Other' ? customDepartment.trim() : department || undefined,
        year: year ? Number(year) : undefined,
      });
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : 'Unable to create your account. Please try again.';
      setErrors({ form: message });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="w-full max-w-lg">
      <div className="mb-6 text-center">
        <Badge variant="success" className="mb-3">
          Join your campus
        </Badge>
        <h1 className="text-2xl font-bold text-text">Create your account</h1>
        <p className="mt-2 text-sm text-text-muted">
          Sign up with your official AAU email to join the Addis Ababa University community.
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
          label="Full name"
          name="name"
          autoComplete="name"
          placeholder="Your full name"
          value={name}
          onChange={(event) => {
            const nextName = event.target.value;
            setName(nextName);
            setErrors((current) => ({
              ...current,
              name: validateName(nextName),
              password: validateRegistrationPassword(password, nextName),
              form: undefined,
            }));
          }}
          error={errors.name}
          required
        />

        <div>
          <Input
            label="University email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@aau.edu.et"
            value={email}
            onChange={(event) => {
              const nextEmail = event.target.value;
              setEmail(nextEmail);
              updateFieldError('email', validateEmail(nextEmail));
            }}
            error={errors.email}
            required
          />
          {domain && detectedUniversity && (
            <div className="mt-2 flex items-center gap-2 rounded-lg bg-accent-50 px-3 py-2 text-sm text-accent-700">
              <span aria-hidden="true">✓</span>
              <span>
                Detected university: <strong>{detectedUniversity.name}</strong>
              </span>
            </div>
          )}
          {domain && isDomainSupported === false && !errors.email && (
            <div
              className="mt-2 rounded-lg bg-danger-50 px-3 py-2 text-sm text-danger-600"
              role="alert"
            >
              Signups are currently restricted to Addis Ababa University students (@aau.edu.et).
            </div>
          )}
        </div>

        <Input
          label="University ID"
          name="universityIdNumber"
          placeholder="Enter your AAU ID"
          value={universityIdNumber}
          onChange={(event) => {
            const nextId = event.target.value;
            setUniversityIdNumber(nextId);
            updateFieldError(
              'universityIdNumber',
              nextId.trim() ? undefined : 'University ID is required.',
            );
          }}
          error={errors.universityIdNumber}
          required
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <Select
            label="Department"
            name="department"
            value={department}
            onChange={(event) => {
              const nextDepartment = event.target.value;
              setDepartment(nextDepartment);
              setErrors((current) => ({
                ...current,
                department: nextDepartment ? undefined : 'Please select your department.',
                customDepartment:
                  nextDepartment === 'Other' && !customDepartment.trim()
                    ? 'Please enter your department.'
                    : undefined,
                form: undefined,
              }));
            }}
            options={departmentOptions}
            placeholder="Select department"
            required
            error={errors.department}
          />
          {department === 'Other' && (
            <Input
              label="Specify department"
              name="customDepartment"
              placeholder="Your department"
              value={customDepartment}
              onChange={(event) => {
                const nextDepartment = event.target.value;
                setCustomDepartment(nextDepartment);
                updateFieldError(
                  'customDepartment',
                  nextDepartment.trim() ? undefined : 'Please enter your department.',
                );
              }}
              error={errors.customDepartment}
              required
            />
          )}
          <Select
            label="Year"
            name="year"
            value={year}
            onChange={(event) => {
              const nextYear = event.target.value;
              setYear(nextYear);
              updateFieldError('year', nextYear ? undefined : 'Please select your year.');
            }}
            options={yearOptions}
            placeholder="Select year"
            required
            error={errors.year}
          />
        </div>

        <Input
          label="Password"
          name="password"
          type="password"
          autoComplete="new-password"
          placeholder="At least 8 characters"
          value={password}
          onChange={(event) => {
            const nextPassword = event.target.value;
            setPassword(nextPassword);
            setErrors((current) => ({
              ...current,
              password: validateRegistrationPassword(nextPassword, name),
              confirmPassword: validateConfirmPassword(confirmPassword, nextPassword),
              form: undefined,
            }));
          }}
          error={errors.password}
          required
        />
        {password && (
          <div className="space-y-1.5" aria-live="polite">
            <div className="flex items-center justify-between text-xs">
              <span className="text-text-muted">Password strength</span>
              <span
                className={
                  passwordStrength === 'strong'
                    ? 'font-medium text-accent-600'
                    : passwordStrength === 'medium'
                      ? 'font-medium text-accent-700'
                      : 'font-medium text-danger-600'
                }
              >
                {passwordStrength.charAt(0).toUpperCase() + passwordStrength.slice(1)}
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-surface-muted">
              <div
                className={
                  `h-full transition-all ${
                    passwordStrength === 'strong'
                      ? 'w-full bg-accent-500'
                      : passwordStrength === 'medium'
                        ? 'w-2/3 bg-accent-500'
                        : 'w-1/3 bg-danger-500'
                  }`
                }
              />
            </div>
          </div>
        )}

        <Input
          label="Confirm password"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          placeholder="Re-enter your password"
          value={confirmPassword}
          onChange={(event) => {
            const nextConfirmation = event.target.value;
            setConfirmPassword(nextConfirmation);
            updateFieldError(
              'confirmPassword',
              validateConfirmPassword(nextConfirmation),
            );
          }}
          error={errors.confirmPassword}
          required
        />

        <Button
          type="submit"
          className="w-full"
          isLoading={isSubmitting}
          disabled={isSubmitting || passwordStrength === 'weak'}
        >
          Create account
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-text-muted">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-primary-600 hover:text-primary-700">
          Log in
        </Link>
      </p>
    </Card>
  );
}
