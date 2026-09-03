import Link from 'next/link';
import { canSendEnquiry, navLinks, siteConfig } from '@/lib/site.config';

const { contact, social } = siteConfig;

/**
 * Channels the studio has actually configured.
 *
 * A footer full of dead links is worse than a short footer, so anything without
 * a real value in the environment is simply absent here. The contact section
 * upstream is where a missing channel is called out as a placeholder.
 */
const channels = [
  contact.whatsappUrl ? { label: 'WhatsApp', href: contact.whatsappUrl } : null,
  social.instagram
    ? { label: social.instagramHandle ?? 'Instagram', href: social.instagram }
    : null,
  social.youtube ? { label: 'YouTube', href: social.youtube } : null,
  contact.email ? { label: contact.email, href: `mailto:${contact.email}` } : null,
  contact.phone ? { label: contact.phone, href: `tel:${contact.phone.replace(/[^\d+]/g, '')}` } : null,
].filter((channel): channel is { label: string; href: string } => channel !== null);

/** Quiet close: a wordmark, the way out, and nothing that asks for attention. */
export function Footer() {
  return (
    <footer className="border-t border-hairline">
      <div className="shell grid gap-12 py-16 md:grid-cols-[1.4fr_1fr_1fr] md:gap-8 md:py-20">
        <div>
          <p className="font-display text-display-s leading-none">{siteConfig.brandName}</p>
          <p className="mt-3 eyebrow">{siteConfig.discipline}</p>
          <p className="mt-6 max-w-xs text-sm text-paper-dim">{siteConfig.tagline}</p>
        </div>

        <nav aria-label="Footer">
          <h2 className="eyebrow">Index</h2>
          {/* Below `lg` each row is a 44px thumb target and the list closes up to
              compensate, so the rhythm reads the same while the hit areas touch.
              From `lg` the pointer is fine and the list returns to its designed
              density — a 44px row for a 14px link is a lot of air on a desktop
              footer. */}
          <ul className="mt-5 flex flex-col gap-1 lg:gap-3">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="link-underline inline-flex min-h-11 items-center text-sm text-paper-dim transition-colors duration-500 hover:text-paper lg:min-h-0"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="eyebrow">Reach us</h2>
          {channels.length > 0 ? (
            <ul className="mt-5 flex flex-col gap-1 lg:gap-3">
              {channels.map((channel) => (
                <li key={channel.href}>
                  <a
                    href={channel.href}
                    target={channel.href.startsWith('http') ? '_blank' : undefined}
                    rel={channel.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                    className="link-underline inline-flex min-h-11 items-center text-sm text-paper-dim transition-colors duration-500 hover:text-paper lg:min-h-0"
                  >
                    {channel.label}
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-5 text-sm text-muted">
              {canSendEnquiry
                ? 'Use the enquiry form — it reaches the studio directly.'
                : 'Contact channels are not configured yet.'}
            </p>
          )}
        </div>
      </div>

      <div className="shell flex flex-col gap-2 border-t border-hairline py-7 text-data tracked-wide text-muted sm:flex-row sm:items-center sm:justify-between">
        <p>
          © {new Date().getFullYear()} {siteConfig.brandName}
        </p>
        <p>{siteConfig.footerLine}</p>
      </div>
    </footer>
  );
}
