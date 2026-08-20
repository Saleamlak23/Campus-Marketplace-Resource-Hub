import { ChangeEvent, useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import { fetchProfile, updateProfile, type Profile, type UpdateProfileRequest } from './api';
import { useAuthStore } from '../../store/authStore';

const departments = ['Computer Science', 'Software Engineering', 'Information Technology', 'Information Systems', 'Electrical Engineering'];
const years = Array.from({ length: 7 }, (_, index) => ({ value: String(index + 1), label: `Year ${index + 1}` }));

export default function ProfileCard() {
  const queryClient = useQueryClient();
  const { user, university, updateUser } = useAuthStore();
  const { data: profile, isLoading, error } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: () => fetchProfile(user!, university?.name ?? 'Addis Ababa University'),
    enabled: Boolean(user),
  });
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<UpdateProfileRequest | null>(null);
  const [formError, setFormError] = useState<string>();
  const mutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: (updated) => {
      queryClient.setQueryData(['profile', user?.id], updated);
      updateUser({ name: updated.name, department: updated.department, year: updated.year, bio: updated.bio, avatarUrl: updated.avatarUrl });
      setEditing(false);
    },
    onError: () => setFormError('Unable to save your profile. Please try again.'),
  });

  useEffect(() => { if (profile) setDraft(toDraft(profile)); }, [profile]);
  if (isLoading) return <Card>Loading your profile…</Card>;
  if (error || !user || !profile || !draft) return <Card className="text-danger-600">Unable to load your profile.</Card>;

  const updateDraft = <K extends keyof UpdateProfileRequest>(key: K, value: UpdateProfileRequest[K]) =>
    setDraft((current) => current ? { ...current, [key]: value } : current);
  const onAvatarChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return setFormError('Please select an image file.');
    const reader = new FileReader();
    reader.onload = () => updateDraft('avatarUrl', String(reader.result));
    reader.readAsDataURL(file);
  };
  const save = () => {
    if (!draft.name.trim()) return setFormError('Display name is required.');
    if (!draft.department) return setFormError('Department is required.');
    setFormError(undefined); mutation.mutate({ ...draft, name: draft.name.trim(), bio: draft.bio.trim() });
  };
  const cancel = () => { setDraft(toDraft(profile)); setFormError(undefined); setEditing(false); };
  const avatar = draft.avatarUrl ?? profile.avatarUrl;

  return <Card className="max-w-3xl" padding="lg">
    <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex items-center gap-4">
        <Avatar name={profile.name} url={avatar} />
        <div><h1 className="text-2xl font-bold">{profile.name}</h1><p className="text-text-muted">{profile.email}</p><Badge variant="primary" className="mt-2">{profile.universityName}</Badge></div>
      </div>
      {!editing && <Button onClick={() => setEditing(true)}>Edit profile</Button>}
    </div>
    {formError && <p className="mt-5 rounded-lg bg-danger-50 p-3 text-sm text-danger-600" role="alert">{formError}</p>}
    <div className="mt-7 grid gap-5 sm:grid-cols-2">
      <Input label="Display name" value={editing ? draft.name : profile.name} disabled={!editing} onChange={(e) => updateDraft('name', e.target.value)} required />
      <Input label="University email" value={profile.email} disabled readOnly />
      <Select label="Department" value={editing ? draft.department : profile.department} disabled={!editing} onChange={(e) => updateDraft('department', e.target.value)} options={departments.map((value) => ({ value, label: value }))} />
      <Select label="Academic year" value={String(editing ? draft.year : profile.year)} disabled={!editing} onChange={(e) => updateDraft('year', Number(e.target.value))} options={years} />
      <Input label="University" value={profile.universityName} disabled readOnly />
      {editing && <div><label className="mb-1.5 block text-sm font-medium">Profile picture</label><input type="file" accept="image/*" onChange={onAvatarChange} className="block w-full text-sm text-text-muted" /></div>}
    </div>
    <div className="mt-5"><label className="mb-1.5 block text-sm font-medium">Bio</label><textarea value={editing ? draft.bio : profile.bio} disabled={!editing} onChange={(e) => updateDraft('bio', e.target.value)} maxLength={300} rows={4} className="block w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm disabled:bg-surface-muted" placeholder="Tell your campus community about yourself" /></div>
    {editing && <div className="mt-6 flex justify-end gap-3"><Button variant="outline" onClick={cancel} disabled={mutation.isPending}>Cancel</Button><Button onClick={save} isLoading={mutation.isPending}>Save changes</Button></div>}
  </Card>;
}

function toDraft(profile: Profile): UpdateProfileRequest { const { name, department, year, bio, avatarUrl } = profile; return { name, department, year, bio, avatarUrl }; }
function Avatar({ name, url }: { name: string; url: string | null }) { return url ? <img src={url} alt="Profile" className="h-20 w-20 rounded-full object-cover" /> : <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary-100 text-2xl font-bold text-primary-700">{name.slice(0, 1).toUpperCase()}</div>; }
