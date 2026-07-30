import Container from "@/components/system/Container";
import Section from "@/components/system/Section";
import TechBackdrop from "@/components/system/TechBackdrop";
import ProjectCarousel from "@/components/portfolio/ProjectCarousel";
import { useEnquiry } from "@/components/enquiry/EnquiryProvider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * `/portfolio` - the Portfolio_Experience page.
 *
 * The route shell (`PublicLayout`, applied in `App.jsx`) owns the header, the
 * footer, and the floating conversion action, so this page renders page content
 * only. The inline header it used to carry - a placeholder brand plus three
 * dead placeholder nav items - and its own fixed booking control are gone, per
 * the recorded approved changes for this route (Requirements 1.1, 2.1, 11.3).
 *
 * Project data comes from `content/projects.js` through `ProjectCarousel`,
 * which owns the carousel's single selection state. Every project's image,
 * description, category, availability, and external destination reaches the
 * page from that module unchanged (Requirement 6.1); the page never re-declares
 * project content.
 *
 * Presentation is token-only (Requirements 1.1, 1.2): the page declares no
 * literal color anywhere, including the decorative bottom wave, whose fill is
 * `currentColor` resolved from a token color role. Per-project `gradient` and
 * `tagColor` values remain content and are applied inside the carousel's own
 * components, not here.
 *
 * The page keeps its "Request A Quote" action with the same behavior it had
 * before the redesign (Requirement 11.1), now activated through the shared
 * `useEnquiry()` opener so the Enquiry_Modal has exactly one activation surface
 * (Requirement 6.10).
 *
 * Heading structure: the route's single `h1` lives here, and the carousel's
 * featured project name renders one level below it, so the page's heading order
 * has no gap and no second top-level heading (Requirement 10.5).
 *
 * Requirements: 1.1, 1.2, 6.1, 6.10, 11.1
 */

/**
 * The decorative wave that separates the intro band from the carousel band.
 * Kept from the pre-redesign page, now filled from a token color role and
 * hidden from assistive technologies.
 */
function PortfolioWave({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      data-slot="portfolio-wave"
      className={cn(
        "pointer-events-none absolute inset-x-0 bottom-0 leading-none text-canvas",
        className,
      )}
    >
      <svg
        viewBox="0 0 1440 64"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
        focusable="false"
        className="block h-[var(--space-7)] w-full"
      >
        <path d="M0,64 C360,0 1080,0 1440,64 L1440,64 L0,64 Z" fill="currentColor" />
      </svg>
    </div>
  );
}

export default function PortfolioPage() {
  // Single enquiry activation surface (Requirement 6.10). Outside a provider
  // the hook still reaches the mounted modal through its window bridge, so the
  // CTA is never inert.
  const { openEnquiry } = useEnquiry();

  return (
    <>
      <Section
        tone="surface"
        pad="lg"
        backdrop={<TechBackdrop variant="mesh" intensity="subtle" />}
        data-slot="portfolio-intro"
      >
        <Container className="flex flex-col items-start gap-[var(--space-5)]">
          <h1 className="text-[length:var(--text-display)] font-extrabold tracking-[-0.02em] text-content">
            Our Work
          </h1>

          <Button
            type="button"
            variant="brand"
            size="lg"
            onClick={openEnquiry}
            data-slot="portfolio-enquiry-cta"
          >
            Request A Quote
          </Button>
        </Container>

        <PortfolioWave />
      </Section>

      <Section tone="canvas" pad="lg" aria-label="Projects" data-slot="portfolio-projects">
        <Container>
          {/* Featured project name sits one level below the page h1. */}
          <ProjectCarousel headingLevel={2} headingId="featured-project" />
        </Container>
      </Section>
    </>
  );
}
