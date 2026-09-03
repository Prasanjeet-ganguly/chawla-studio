import { Hero } from '@/components/hero/Hero';
import { PhilosophySection } from '@/components/about/PhilosophySection';
import { WorkSection } from '@/components/gallery/WorkSection';
import { ServicesSection } from '@/components/services/ServicesSection';
import { AboutSection } from '@/components/about/AboutSection';
import { ContactSection } from '@/components/contact/ContactSection';
import { WhatsAppButton } from '@/components/contact/WhatsAppButton';

/**
 * The home page, read as one continuous scroll:
 * hero → what we photograph → the work → services → the studio → enquiry.
 *
 * Each section owns its own layout and data; this file is only the order.
 */
export default function HomePage() {
  return (
    <>
      <Hero />
      <PhilosophySection />
      <WorkSection />
      <ServicesSection />
      <AboutSection />
      <ContactSection />
      <WhatsAppButton />
    </>
  );
}
