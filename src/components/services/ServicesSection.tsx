import { Button } from '@/components/ui/Button';
import { Photo } from '@/components/ui/Photo';
import { Reveal } from '@/components/ui/Reveal';
import { describe } from '@/lib/data/captions';
import { services, servicesClosing } from '@/lib/data/services';
import { frameNumber } from '@/lib/utils';

/**
 * What the studio does, as a five-line index.
 *
 * No prices: rates are quoted per event, and a number invented here would be a
 * lie on a page a client makes decisions from. Two of the five services have no
 * published frames yet, and their picture cell is simply empty rather than
 * borrowing a photograph from a different kind of work.
 */
export function ServicesSection() {
  return (
    <section id="services" aria-labelledby="services-title" className="rebate-grid py-24 md:py-36">
      <p className="rebate-mark self-start pt-2">Services</p>

      <div className="shell">
        <Reveal>
          <p className="eyebrow">What we do</p>
          <h2 id="services-title" className="mt-5 font-display uppercase text-display-l">
            Services
          </h2>
        </Reveal>

        <ul className="mt-14 list-none border-t border-hairline p-0">
          {services.map((service, index) => (
            <Reveal
              as="li"
              key={service.id}
              delay={index * 0.05}
              className="grid grid-cols-1 items-start gap-6 border-b border-hairline py-10 md:grid-cols-[3.5rem_minmax(0,1fr)_13rem] md:gap-10 md:py-12"
            >
              <p className="eyebrow md:pt-3">{frameNumber(index)}</p>

              <div>
                <h3 className="font-display text-display-s">{service.title}</h3>
                <p className="mt-3 max-w-md text-sm text-paper-dim">{service.summary}</p>
              </div>

              {/* No placeholder cell when a service has no frame yet: the three
                  columns are declared on the grid, so an empty element buys
                  nothing from `md` up — and in the single-column phone layout it
                  opens a 24px row gap under a row that has nothing in it. */}
              {service.photoId ? (
                <Photo
                  id={service.photoId}
                  alt={describe(service.photoId)}
                  sizes="(min-width: 768px) 13rem, 60vw"
                  aspect={3 / 2}
                  className="w-full max-w-[13rem]"
                />
              ) : null}
            </Reveal>
          ))}
        </ul>

        <Reveal className="mt-16 flex flex-col items-start gap-8 md:flex-row md:items-center md:justify-between">
          <p className="max-w-lg font-display text-display-s">{servicesClosing}</p>
          <Button href="/#contact" variant="solid" withArrow>
            Get in touch
          </Button>
        </Reveal>
      </div>
    </section>
  );
}
