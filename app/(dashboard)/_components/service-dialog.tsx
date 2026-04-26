'use client';

import { Dialog as DialogPrimitive } from '@base-ui/react/dialog';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from 'sonner';

import { GET_SERVICES_QUERY_KEY } from '@/app/(dashboard)/_hooks/get-services';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
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
import { Service, ServiceResponse } from '@/types';

type Mode = 'add' | 'edit';

function normalizeUrlForCompare(rawUrl: string): string {
  const parsed = new URL(rawUrl.trim());
  parsed.hash = '';
  parsed.hostname = parsed.hostname.toLowerCase();
  return parsed.toString();
}

interface ServiceDialogProps {
  handle: DialogPrimitive.Root.Props['handle'];
  mode: Mode;
  onSuccess?: () => void;
}

export function ServiceDialog({ handle, mode, onSuccess }: ServiceDialogProps) {
  const dialogHandle = handle as { close?: () => void };

  return (
    <Dialog handle={handle}>
      {({ payload }) => (
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {mode === 'add' ? 'Add Service' : 'Edit Service'}
            </DialogTitle>
            <DialogDescription>
              {mode === 'add'
                ? 'Enter the service name and URL to monitor.'
                : 'Update the service name and URL.'}
            </DialogDescription>
          </DialogHeader>
          <DialogForm
            mode={mode}
            service={
              mode === 'edit'
                ? (payload as ServiceResponse | undefined)
                : undefined
            }
            onSuccess={onSuccess}
            onClose={() => dialogHandle.close?.()}
          />
        </DialogContent>
      )}
    </Dialog>
  );
}

function DialogForm({
  mode,
  service,
  onSuccess,
  onClose,
}: {
  mode: Mode;
  service?: ServiceResponse;
  onSuccess?: () => void;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
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

    const currentServices =
      queryClient.getQueryData<Service[]>(GET_SERVICES_QUERY_KEY) ?? [];
    const normalizedInputUrl = normalizeUrlForCompare(trimmedUrl);
    const duplicateExists = currentServices.some((existing) => {
      if (mode === 'edit' && existing.id === service?.id) return false;
      try {
        return normalizeUrlForCompare(existing.url) === normalizedInputUrl;
      } catch {
        return existing.url.trim() === trimmedUrl;
      }
    });

    if (duplicateExists) {
      setUrlError('This URL is already being monitored');
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
        void queryClient.invalidateQueries({ queryKey: GET_SERVICES_QUERY_KEY });
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
        void queryClient.invalidateQueries({ queryKey: GET_SERVICES_QUERY_KEY });
        toast.success('Service updated');
      }
      onSuccess?.();
      onClose();
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
        <DialogClose
          disabled={loading}
          render={<Button type="button" variant="outline" />}
        >
          Cancel
        </DialogClose>
        <Button type="submit" disabled={loading}>
          {loading && <Spinner className="mr-2 size-4" />}
          {mode === 'add' ? 'Add Service' : 'Save Changes'}
        </Button>
      </div>
    </form>
  );
}
