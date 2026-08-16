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
  useUniversityFromEmail,
  validateEmail,
  validateName,
  validatePassword,
} from '../hooks/useUniversityFromEmail';

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
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

  function validateConfirmPassword(value: string): string | undefined {
    if (!value) {
      return 'Please confirm your password.';
    }
    if (value !== password) {
      return 'Passwords do not match.';
    }
    return undefined;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors: FormErrors = {
      name: validateName(name),
      email: validateEmail(email),
      password: validatePassword(password),
      confirmPassword: validateConfirmPassword(confirmPassword),
      department: department ? undefined : 'Please select your department.',
      year: year ? undefined : 'Please select your year.',
    };

    if (department === 'Other' && !customDepartment.trim()) {
      nextErrors.department = 'Please enter your department.';
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
        universityIdNumber: universityIdNumber.trim() || undefined,
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
          Sign up with your official university email. Your domain determines your campus community.
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
          onChange={(event) => setName(event.target.value)}
          error={errors.name}
          required
        />

        <div>
          <Input
            label="University email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@university.edu"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
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
          {domain && isDomainSupported === false && (
            <div
              className="mt-2 rounded-lg bg-danger-50 px-3 py-2 text-sm text-danger-600"
              role="alert"
            >
              The domain <strong>@{domain}</strong> is not linked to a registered university.
            </div>
          )}
        </div>

        <Input
          label="University ID (optional)"
          name="universityIdNumber"
          placeholder="Enter your ID"
          value={universityIdNumber}
          onChange={(event) => setUniversityIdNumber(event.target.value)}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <Select
            label="Department"
            name="department"
            value={department}
            onChange={(event) => setDepartment(event.target.value)}
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
              onChange={(e) => setCustomDepartment(e.target.value)}
              error={errors.department}
              required
            />
          )}
          <Select
            label="Year"
            name="year"
            value={year}
            onChange={(event) => setYear(event.target.value)}
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
          onChange={(event) => setPassword(event.target.value)}
          error={errors.password}
          required
        />

        <Input
          label="Confirm password"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          placeholder="Re-enter your password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          error={errors.confirmPassword}
          required
        />

        <Button type="submit" className="w-full" isLoading={isSubmitting}>
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