import { EnquiryForm } from './EnquiryForm';
import { Photo } from '@/components/ui/Photo';
import { Reveal } from '@/components/ui/Reveal';
import { describe } from '@/lib/data/captions';
import { hasContactChannel, siteConfig } from '@/lib/site.config';

const FRAME = '0f5a6631';

/** Only channels the studio has actually configured are offered. */
function channels() {
  const { contact, social } = siteConfig;
  const list: Array<{ label: string; value: string; href: string }> = [];

  if (contact.whatsappUrl) {
    list.push({ label: 'WhatsApp', value: 'Message the studio', href: contact.whatsappUrl });
  }
  if (social.instagram) {
    list.push({
      label: 'Instagram',
      value: social.instagramHandle ?? 'See the latest work',
      href: social.instagram,
    });
  }
  if (contact.email) {
    list.push({ label: 'Email', value: contact.email, href: `mailto:${contact.email}` });
  }
  if (contact.phone) {
    list.push({
      label: 'Phone',
      value: contact.phone,
      href: `tel:${contact.phone.replace(/[^+\d]/g, '')}`,
    });
  }
  return list;
}

/**
 * The last page of the site.
 *
 * The channel list is built from configuration, so an unconfigured studio shows
 * an honest note naming the environment variables to set instead of a row of
 * dead links to invented accounts.
 */
export function ContactSection() {
  const list = channels();

  return (
    <section id="contact" aria-labelledby="contact-title" className="rebate-grid py-24 md:py-36">
      <p className="rebate-mark self-start pt-2">Contact</p>

      <div className="shell">
        <Reveal>
          <p className="eyebrow">Enquiries</p>
          <h2 id="contact-title" className="mt-5 max-w-3xl font-display uppercase text-display-l">
            Let&rsquo;s create something timeless.
          </h2>
        </Reveal>

        <div className="mt-16 grid gap-16 lg:grid-cols-[1fr_22rem] lg:gap-20">
          <Reveal delay={0.06}>
            <EnquiryForm />
          </Reveal>

          <Reveal delay={0.12} className="flex flex-col gap-10">
            <div>
              <p className="eyebrow">Or reach us directly</p>

              {list.length > 0 ? (
                <ul className="mt-6 list-none border-t border-hairline p-0">
                  {list.map((channel) => (
                    <li key={channel.label} className="border-b border-hairline">
                      <a
                        href={channel.href}
                        {...(/^https?:/.test(channel.href)
                          ? { target: '_blank', rel: 'noopener noreferrer' }
                          : {})}
                        className="group flex items-baseline justify-between gap-4 py-4"
                      >
                        <span className="eyebrow text-paper-dim transition-colors duration-500 group-hover:text-paper">
                          {channel.label}
                        </span>
                        <span className="link-underline text-sm text-paper">{channel.value}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-6 border border-dashed border-hairline-strong p-6 text-sm text-paper-dim">
                  No contact channels are configured yet. Add{' '}
                  <span className="font-mono text-data tracked-wide">
                    NEXT_PUBLIC_WHATSAPP_NUMBER
                  </span>
                  ,{' '}
                  <span className="font-mono text-data tracked-wide">NEXT_PUBLIC_CONTACT_EMAIL</span>{' '}
                  or{' '}
                  <span className="font-mono text-data tracked-wide">NEXT_PUBLIC_INSTAGRAM_URL</span>{' '}
                  to .env.local — see .env.example.
                </p>
              )}

              {siteConfig.contact.location ? (
                <p className="mt-6 text-sm text-paper-dim">{siteConfig.contact.location}</p>
              ) : null}

              {hasContactChannel ? null : (
                <p className="mt-4 text-data tracked-wide text-muted">
                  Studio details are configuration, never invented.
                </p>
              )}
            </div>

            <Photo
              id={FRAME}
              alt={describe(FRAME)}
              sizes="(min-width: 1024px) 22rem, 92vw"
              aspect={4 / 5}
              className="hidden lg:block"
            />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
