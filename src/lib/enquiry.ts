/**
 * The enquiry: what a visitor sends, and how it reaches the studio.
 *
 * Kept out of the component so the shape, the messages and the mailto: fallback
 * are all in one readable place — and so a real endpoint (or a route handler,
 * later) can validate against exactly the same schema the browser did.
 */
import { z } from 'zod';

/**
 * The kinds of work a visitor can enquire about. These mirror the five services
 * the studio offers, plus an escape hatch — the list must never force someone
 * to mislabel their own event.
 */
export const EVENT_TYPES = [
  'Wedding',
  'Pre-Wedding',
  'Portraits',
  'Event or Function',
  'Cinematic Film',
  'Something else',
] as const;

/** Optional fields are empty strings rather than undefined, which keeps the
 *  form's default values, the schema and the payload one single shape. */
export const enquirySchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, { error: 'Please tell us your name.' })
    .max(80, { error: 'That is longer than we can store.' }),

  email: z.email({ error: 'That email address does not look right.' }),

  phone: z
    .string()
    .trim()
    .max(24, { error: 'That is longer than a phone number.' })
    .refine((value) => value === '' || /^[+(\d][\d\s()-]{5,}$/.test(value), {
      error: 'Digits, spaces and brackets — with a leading + for a country code.',
    }),

  eventType: z.enum(EVENT_TYPES, { error: 'Choose the kind of work.' }),

  eventDate: z
    .string()
    .trim()
    .refine((value) => value === '' || /^\d{4}-\d{2}-\d{2}$/.test(value), {
      error: 'Use the date picker, or leave this blank.',
    }),

  location: z
    .string()
    .trim()
    .max(120, { error: 'A city or venue name is plenty.' }),

  message: z
    .string()
    .trim()
    .min(10, { error: 'A sentence or two about the day is plenty.' })
    .max(1500, { error: 'Please keep this under 1500 characters.' }),
});

export type Enquiry = z.infer<typeof enquirySchema>;

/** A blank enquiry. Every field is a string, so nothing is ever uncontrolled. */
export const EMPTY_ENQUIRY: Enquiry = {
  name: '',
  email: '',
  phone: '',
  eventType: 'Wedding',
  eventDate: '',
  location: '',
  message: '',
};

/**
 * The enquiry as an email the visitor's own client opens.
 *
 * Used when no form endpoint is configured. It is not a silent send — the
 * visitor sees the message and presses send themselves — so the UI says exactly
 * that rather than claiming delivery.
 */
export function enquiryMailto(values: Enquiry, to: string): string {
  const lines = [
    `Name: ${values.name}`,
    `Email: ${values.email}`,
    values.phone ? `Phone: ${values.phone}` : null,
    `Enquiring about: ${values.eventType}`,
    values.eventDate ? `Date: ${values.eventDate}` : null,
    values.location ? `Location: ${values.location}` : null,
    '',
    values.message,
  ].filter((line): line is string => line !== null);

  const subject = `Enquiry: ${values.eventType} — ${values.name}`;
  return `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(
    lines.join('\n')
  )}`;
}
