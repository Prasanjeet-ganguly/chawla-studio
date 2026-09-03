'use client';

import Link from 'next/link';
import { useRef, useState, type ReactNode } from 'react';
import { useReducedMotion, useIsTouch } from '@/lib/hooks/useMediaQuery';
import { cx } from '@/lib/utils';

type Variant = 'solid' | 'outline' | 'bare' | 'gold' | 'gilt';
type Size = 'default' | 'hero' | 'compact';

type CommonProps = {
  children: ReactNode;
  variant?: Variant;
  /** `hero` is the wider pill the opening frame is composed around. */
  size?: Size;
  className?: string;
  /** Draws the trailing arrow that slides on hover. */
  withArrow?: boolean;
};

type ButtonAsLink = CommonProps & {
  href: string;
  external?: boolean;
  /** A link may still want to close the drawer it was tapped in. */
  onClick?: () => void;
  type?: never;
  disabled?: never;
};

type ButtonAsButton = CommonProps & {
  href?: never;
  external?: never;
  onClick?: () => void;
  type?: 'button' | 'submit';
  disabled?: boolean;
};

export type ButtonProps = ButtonAsLink | ButtonAsButton;

const VARIANTS: Record<Variant, string> = {
  solid: 'bg-paper text-ink hover:bg-selenium hover:text-paper',
  outline:
    'border border-hairline-strong text-paper hover:border-selenium hover:text-selenium',
  bare: 'text-paper-dim hover:text-paper',
  // The one filled gold action on the site. Rounded, because the hero's primary
  // CTA is the single pill in an otherwise square design — and it brightens and
  // grows a fraction on hover rather than changing colour.
  gold: 'rounded-full bg-gold text-ink hover:bg-gold-bright hover:scale-[1.015]',
  // The masthead pill: nothing but a gold hairline until it is hovered.
  gilt: 'rounded-full border border-gold-line-strong text-ivory hover:border-gold hover:bg-gold/10',
};

/**
 * Padding only, with one exception: `hero` is the reference pill's more generous
 * measure, and `compact` carries a minimum height because its padding alone
 * comes to about 40px — under the 44 a thumb needs, and it is the drawer's
 * "Book a shoot" as well as the masthead's.
 */
const SIZES: Record<Size, string> = {
  default: 'px-7 py-4',
  hero: 'px-9 py-[1.15rem] md:px-10',
  compact: 'min-h-11 px-6 py-3',
};

/** Magnetic pull, in px, at the pointer's furthest useful distance. */
const PULL = 5;

/**
 * The studio's action. Uppercase, tracked, square — and on a fine pointer it
 * leans a few pixels toward the cursor, which is the whole of its personality.
 *
 * The pull is skipped on touch devices and when reduced motion is requested.
 */
export function Button(props: ButtonProps) {
  const {
    children,
    variant = 'outline',
    size = 'default',
    className,
    withArrow = false,
  } = props;
  const ref = useRef<HTMLSpanElement>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const reduced = useReducedMotion();
  const touch = useIsTouch();
  const magnetic = !reduced && !touch;

  const onMove = (event: React.MouseEvent) => {
    if (!magnetic || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const dx = (event.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
    const dy = (event.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);
    setOffset({ x: dx * PULL, y: dy * PULL });
  };

  const reset = () => setOffset({ x: 0, y: 0 });

  const inner = (
    <span
      ref={ref}
      className="inline-flex items-center gap-3 transition-transform duration-500 ease-[var(--ease-out-expo)]"
      style={{ transform: `translate3d(${offset.x}px, ${offset.y}px, 0)` }}
    >
      <span>{children}</span>
      {withArrow ? (
        <span aria-hidden="true" className="transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:translate-x-1">
          &#8594;
        </span>
      ) : null}
    </span>
  );

  const shared = cx(
    'group relative inline-flex items-center justify-center text-label tracked',
    SIZES[size],
    // Transform is transitioned here so a variant can add a hover scale; the
    // magnetic pull lives on the inner span and composes with it.
    'transition-[color,background-color,border-color,transform] duration-500 ease-[var(--ease-out-expo)]',
    'disabled:cursor-not-allowed disabled:opacity-40',
    VARIANTS[variant],
    className
  );

  if (props.href !== undefined) {
    const external = props.external ?? /^https?:/.test(props.href);
    if (external) {
      return (
        <a
          href={props.href}
          target="_blank"
          rel="noopener noreferrer"
          className={shared}
          onClick={props.onClick}
          onMouseMove={onMove}
          onMouseLeave={reset}
        >
          {inner}
        </a>
      );
    }
    return (
      <Link
        href={props.href}
        className={shared}
        onClick={props.onClick}
        onMouseMove={onMove}
        onMouseLeave={reset}
      >
        {inner}
      </Link>
    );
  }

  return (
    <button
      type={props.type ?? 'button'}
      onClick={props.onClick}
      disabled={props.disabled}
      className={shared}
      onMouseMove={onMove}
      onMouseLeave={reset}
    >
      {inner}
    </button>
  );
}
