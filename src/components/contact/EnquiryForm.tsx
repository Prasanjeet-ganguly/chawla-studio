'use client';

import { useState, type ReactNode } from 'react';
import { useForm, type FieldErrors, type Resolver } from 'react-hook-form';
import { Button } from '@/components/ui/Button';
import {
  EMPTY_ENQUIRY,
  EVENT_TYPES,
  enquiryMailto,
  enquirySchema,
  type Enquiry,
} from '@/lib/enquiry';
import { canSendEnquiry, siteConfig } from '@/lib/site.config';

type Status = 'idle' | 'sending' | 'sent' | 'handoff' | 'error';

/**
 * zod, wired to react-hook-form by hand.
 *
 * `@hookform/resolvers` exists for exactly this, but it is a dependency for
 * twelve lines — and this way the mapping from zod issues to field errors is
 * visible rather than implied.
 */
const resolver: Resolver<Enquiry> = (values) => {
  const parsed = enquirySchema.safeParse(values);
  if (parsed.success) return { values: parsed.data, errors: {} };

  const errors: Record<string, { type: string; message: string }> = {};
  for (const issue of parsed.error.issues) {
    const key = issue.path[0];
    // First issue per field wins: one message at a time is enough to act on.
    if (typeof key === 'string' && !(key in errors)) {
      errors[key] = { type: issue.code, message: issue.message };
    }
  }
  return { values: {}, errors: errors as FieldErrors<Enquiry> };
};

/** Inputs are underlines, not boxes — the page has enough borders already. */
const CONTROL =
  'w-full border-0 border-b border-hairline bg-transparent px-0 py-3 text-paper transition-colors duration-500 ease-[var(--ease-out-expo)] placeholder:text-muted/70 hover:border-hairline-strong focus:border-selenium disabled:cursor-not-allowed disabled:opacity-40';

type ControlProps = {
  id: string;
  className: string;
  'aria-invalid': true | undefined;
  'aria-describedby': string | undefined;
  /** Mirrors the schema, so "optional" is stated once and told to everyone. */
  'aria-required': true | undefined;
};

type FieldProps = {
  id: string;
  label: string;
  optional?: boolean;
  hint?: string;
  error?: string;
  className?: string;
  /** Receives the wiring, so a field can never be labelled but undescribed. */
  children: (props: ControlProps) => ReactNode;
};

function Field({ id, label, optional = false, hint, error, className, children }: FieldProps) {
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;

  return (
    <div className={className}>
      <label htmlFor={id} className="eyebrow flex flex-wrap items-baseline gap-2">
        <span>{label}</span>
        {optional ? <span className="text-muted/60">optional</span> : null}
      </label>

      <div className="mt-1">
        {children({
          id,
          className: CONTROL,
          'aria-invalid': error ? true : undefined,
          'aria-describedby': describedBy,
          // The label prints "optional" for sighted readers; the same flag says
          // it programmatically, so nobody has to submit the form to find out
          // which fields the studio actually needs. `noValidate` means this
          // announces the requirement without turning on native validation.
          'aria-required': optional ? undefined : true,
        })}
      </div>

      {error ? (
        <p id={`${id}-error`} className="mt-2 text-data tracked-wide text-selenium">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="mt-2 text-data tracked-wide text-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

/**
 * The enquiry form.
 *
 * Three outcomes, and the form says which one happened. With an endpoint
 * configured it posts JSON. With only an address configured it hands the
 * enquiry to the visitor's own mail client — and says so, because that is not
 * the same as sending. With neither, every control is disabled and the reason
 * is printed, rather than collecting a message that would go nowhere.
 */
export function EnquiryForm() {
  const [status, setStatus] = useState<Status>('idle');
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Enquiry>({ resolver, defaultValues: EMPTY_ENQUIRY, mode: 'onBlur' });

  const { contact, enquiryEndpoint } = siteConfig;
  const sending = status === 'sending';

  const onSubmit = async (values: Enquiry) => {
    setStatus('sending');

    if (enquiryEndpoint) {
      try {
        const response = await fetch(enquiryEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify(values),
        });
        if (!response.ok) throw new Error(`Enquiry endpoint replied ${response.status}`);
        reset(EMPTY_ENQUIRY);
        setStatus('sent');
      } catch {
        setStatus('error');
      }
      return;
    }

    if (contact.email) {
      window.location.assign(enquiryMailto(values, contact.email));
      setStatus('handoff');
      return;
    }

    setStatus('error');
  };

  return (
    <form noValidate onSubmit={handleSubmit(onSubmit)} className="mt-10">
      <fieldset
        disabled={!canSendEnquiry || sending}
        className="m-0 grid grid-cols-1 gap-x-10 gap-y-8 border-0 p-0 md:grid-cols-2"
      >
        <legend className="sr-only">Enquiry details</legend>

        <Field id="name" label="Name" error={errors.name?.message}>
          {(props) => <input {...props} {...register('name')} type="text" autoComplete="name" />}
        </Field>

        <Field id="email" label="Email" error={errors.email?.message}>
          {(props) => <input {...props} {...register('email')} type="email" autoComplete="email" />}
        </Field>

        <Field id="phone" label="Phone" optional error={errors.phone?.message}>
          {(props) => <input {...props} {...register('phone')} type="tel" autoComplete="tel" />}
        </Field>

        <Field id="eventType" label="Event type" error={errors.eventType?.message}>
          {(props) => (
            <select {...props} {...register('eventType')} className={`${props.className} appearance-none`}>
              {EVENT_TYPES.map((type) => (
                <option key={type} value={type} className="bg-ink-high text-paper">
                  {type}
                </option>
              ))}
            </select>
          )}
        </Field>

        <Field
          id="eventDate"
          label="Event date"
          optional
          hint="An approximate date is fine."
          error={errors.eventDate?.message}
        >
          {(props) => <input {...props} {...register('eventDate')} type="date" />}
        </Field>

        <Field id="location" label="Location" optional error={errors.location?.message}>
          {(props) => (
            <input {...props} {...register('location')} type="text" autoComplete="address-level2" />
          )}
        </Field>

        <Field
          id="message"
          label="Message"
          className="md:col-span-2"
          error={errors.message?.message}
        >
          {(props) => (
            <textarea
              {...props}
              {...register('message')}
              rows={5}
              className={`${props.className} resize-y`}
            />
          )}
        </Field>
      </fieldset>

      <div className="mt-10 flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
        <Button type="submit" variant="solid" withArrow disabled={!canSendEnquiry || sending}>
          {sending ? 'Sending' : 'Send enquiry'}
        </Button>

        <p aria-live="polite" className="max-w-sm text-sm text-paper-dim">
          {notice(status, canSendEnquiry)}
        </p>
      </div>
    </form>
  );
}

/**
 * What the form is allowed to claim.
 *
 * Every string here is either observable ("your email app should have opened")
 * or confirmed by a 2xx response. Nothing promises a reply time, and nothing
 * says "sent" unless something actually accepted the enquiry.
 */
function notice(status: Status, enabled: boolean): string | null {
  if (!enabled) {
    return 'This form is not connected yet. Set NEXT_PUBLIC_ENQUIRY_ENDPOINT — or NEXT_PUBLIC_CONTACT_EMAIL for the mail fallback — in .env.local.';
  }

  switch (status) {
    case 'sending':
      return 'Sending your enquiry…';
    case 'sent':
      return 'Sent. Your enquiry has reached the studio.';
    case 'handoff':
      return 'Your email app should now be open with the enquiry filled in — press send there and it is on its way.';
    case 'error':
      return siteConfig.contact.email
        ? `That did not go through. Please write to ${siteConfig.contact.email} instead.`
        : 'That did not go through. Please try one of the channels listed above.';
    default:
      return null;
  }
}
