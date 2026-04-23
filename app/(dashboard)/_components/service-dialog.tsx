'use client';

import { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { ServiceResponse } from '@/types';

type Mode = 'add' | 'edit';

interface ServiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: Mode;
  service?: ServiceResponse;
  onSuccess: () => void;
}

// Outer shell only controls visibility — no state here.
// DialogForm mounts fresh each time `open` becomes true, so useState
// initializers run correctly without needing a reset effect.
export function ServiceDialog(props: ServiceDialogProps) {
  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {props.mode === 'add' ? 'Add Service' : 'Edit Service'}
          </DialogTitle>
          <DialogDescription>
            {props.mode === 'add'
              ? 'Enter the service name and URL to monitor.'
              : 'Update the service name and URL.'}
          </DialogDescription>
        </DialogHeader>
        {props.open && <DialogForm {...props} />}
      </DialogContent>
    </Dialog>
  );
}

function DialogForm({
  mode,
  service,
  onSuccess,
  onOpenChange,
}: ServiceDialogProps) {
  const [name, setName] = useState(
    mode === 'edit' && service ? service.name : '',
  );
  const [url, setUrl] = useState(mode === 'edit' && service ? service.url : '');
  const [loading, setLoading] = useState(false);
  const [nameError, setNameError] = useState('');
  const [urlError, setUrlError] = useState('');

  async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setNameError('');
    setUrlError('');

    const trimmedName = name.trim();
    const trimmedUrl = url.trim();

    if (!trimmedName) {
      setNameError('Name is required');
      return;
    }
    if (trimmedName.length > 100) {
      setNameError('Name must be 100 characters or fewer');
      return;
    }

    if (!trimmedUrl) {
      setUrlError('URL is required');
      return;
    }
    try {
      new URL(trimmedUrl);
    } catch {
      setUrlError('Must be a valid URL');
      return;
    }
    if (
      !trimmedUrl.startsWith('http://') &&
      !trimmedUrl.startsWith('https://') &&
      !trimmedUrl.startsWith('mock://')
    ) {
      setUrlError('URL must start with http://, https://, or mock://');
      return;
    }

    setLoading(true);
    try {
      if (mode === 'add') {
        const res = await fetch('/api/services', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: trimmedName, url: trimmedUrl }),
        });
        if (!res.ok) {
          const err = await res.json();
          setUrlError(err.error ?? 'Failed to add service');
          return;
        }
        toast.success('Service added — running initial health check…');
      } else {
        const res = await fetch(`/api/services/${service!.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: trimmedName, url: trimmedUrl }),
        });
        if (!res.ok) {
          const err = await res.json();
          setUrlError(err.error ?? 'Failed to update service');
          return;
        }
        toast.success('Service updated');
      }
      onSuccess();
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <FieldGroup>
        <Field data-invalid={!!nameError || undefined}>
          <FieldLabel htmlFor="service-name">Service Name</FieldLabel>
          <Input
            id="service-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Hacker News API"
            aria-invalid={!!nameError}
            disabled={loading}
          />
          {nameError && (
            <FieldDescription className="text-destructive">
              {nameError}
            </FieldDescription>
          )}
        </Field>
        <Field data-invalid={!!urlError || undefined}>
          <FieldLabel htmlFor="service-url">URL</FieldLabel>
          <Input
            id="service-url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://api.example.com/health"
            aria-invalid={!!urlError}
            disabled={loading}
          />
          {urlError ? (
            <FieldDescription className="text-destructive">
              {urlError}
            </FieldDescription>
          ) : (
            <FieldDescription>
              Must be a valid http://, https://, or mock:// URL
            </FieldDescription>
          )}
        </Field>
      </FieldGroup>
      <div className="mt-6 flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => onOpenChange(false)}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading && <Spinner className="mr-2 size-4" />}
          {mode === 'add' ? 'Add Service' : 'Save Changes'}
        </Button>
      </div>
    </form>
  );
}
