import { useState } from "react";
import { Link } from "react-router-dom";
import { GiOwl } from "react-icons/gi";
import { Play } from "lucide-react";

import Badge from "@/components/system/Badge";
import Container from "@/components/system/Container";
import Eyebrow from "@/components/system/Eyebrow";
import Reveal from "@/components/system/Reveal";
import SafeImage from "@/components/system/SafeImage";
import Section from "@/components/system/Section";
import SectionHeading from "@/components/system/SectionHeading";
import StatBlock from "@/components/system/StatBlock";
import TechBackdrop from "@/components/system/TechBackdrop";
import { useEnquiry } from "@/components/enquiry/EnquiryProvider";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

/**
 * `/` - the homepage, on the uniform public page shell.
 *
 * The route shell (PublicLayout, applied in App.jsx) owns the header, the
 * footer, and the floating conversion action, so this page renders page
 * content only. The inline sticky navbar with its mobile drawer, the inline
 * footer, and the scroll-triggered floating action the page used to mount are
 * all gone; mounting them here as well is what produced the duplicated header
 * (Requirements 1.1, 2.1). Dropping the inline footer is a recorded, approved
 * content change: its links were dead placeholders and its copyright named a
 * different company, both superseded by the canonical shared footer
 * (Requirement 11.3).
 *
 * Content_Region order is preserved exactly (Requirement 4.1): hero, client or
 * partner indicators, business metrics, service offerings, the comparison, the
 * development process, the testimonial, the media placeholder, the scheduling
 * calendar, and the contact area - ten regions, each a distinct Section.
 *
 * The hero presents the value proposition, trust indicators, the portfolio
 * action, and the enquiry action as separate elements (Requirement 4.2); the
 * portfolio action navigates to the portfolio route (Requirement 4.6) and the
 * enquiry action opens the shared Enquiry_Modal (Requirement 4.7).
 *
 * The scheduling calendar's selected day lives in page state and is never
 * reset when a conversion action opens the modal, so the selection survives for
 * as long as the page stays mounted or until another day is chosen
 * (Requirements 4.7, 4.8).
 *
 * Presentation is token-only and dark by default (Requirement 1.1); the orange
 * Brand_Accent is reserved for the conversion buttons (Requirement 1.3). The
 * route's single top-level heading is the hero headline (Requirement 10.5).
 *
 * Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 1.1, 1.3, 10.5, 11.3
 */

/** Business metrics, verbatim from the pre-redesign page (Requirement 4.3). */
const metrics = [
  { value: "35", suffix: "+", label: "Projects Delivered" },
  { value: "3", suffix: "+", label: "Countries Served" },
  { value: "3", suffix: "+", label: "Years of Industry Experience" },
  { value: "15", suffix: "+", label: "Tech Stack Mastered" },
];

/** Service offerings, with their original titles and image URLs (Requirement 4.4). */
const services = [
  {
    title: "Website Design & Development",
    img: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800",
  },
  {
    title: "Web Application Development",
    img: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=800",
  },
  {
    title: "Search Engine Optimisation",
    img: "https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?auto=format&fit=crop&q=80&w=800",
  },
];

/** Client or partner indicators, kept as neutral token-styled marks. */
const clients = ["Amazon", "RK Travels", "Adarsh School", "Shree Krishna Drycleaners"];

/** Comparison lists, verbatim from the pre-redesign page (Requirement 4.5). */
const otherAgencies = [
  "Poor Collaboration",
  "No Support After Delivery",
  "Generic, Template-Based Solutions",
  "Slow, Unstructured Process",
  "Limited Understanding of Your Business",
];

const exflowStrengths = [
  "Quick & Clear Communication",
  "Free Post-Launch Maintenance",
  "Custom-Built Digital Solutions",
  "Transparent Process & Timelines",
  "Deep Industry, Brand and UX Research",
];

export default function Home() {
  // Single enquiry activation surface. Outside a provider the hook still
  // reaches the mounted modal through its window bridge, so no CTA is inert.
  const { openEnquiry } = useEnquiry();

  // The calendar's selected day. It is page state, so opening the modal (which
  // does not touch this state) leaves the selection intact (Requirements 4.7, 4.8).
  const [date, setDate] = useState<Date | undefined>(new Date());

  return (
    <>
      {/* 1. Hero */}
      <Section
        tone="surface"
        pad="lg"
        backdrop={<TechBackdrop variant="mesh" intensity="subtle" />}
        data-slot="home-hero"
      >
        <Container
          width="narrow"
          className="flex flex-col items-center gap-[var(--space-5)] text-center"
        >
          <Reveal as="h1" className="text-[length:var(--text-display)] font-extrabold leading-tight tracking-[-0.02em] text-content">
            Websites &amp; Software That Actually Grow Your Business — Not Just
            Sit There Looking Pretty.
          </Reveal>

          <Reveal
            as="p"
            delay={80}
            className="max-w-[var(--measure)] text-[length:var(--text-body)] leading-relaxed text-content-muted"
          >
            We build software that runs your business smoothly — so every task
            doesn&apos;t end with &quot;Sir dekhte hain.&quot;
          </Reveal>

          {/* Trust indicators (Requirement 4.2). */}
          <Reveal
            as="div"
            delay={120}
            className="flex flex-col items-center gap-[var(--space-3)] sm:flex-row sm:gap-[var(--space-5)]"
          >
            <Badge accent="tech" tone="outline">
              Google — 4.8 Star Ratings
            </Badge>
            <Badge accent="tech" tone="outline">
              Software &amp; Co — 4.9/5.0{" "}
              <span aria-hidden="true" className="text-warning">
                ★★★★★
              </span>
            </Badge>
          </Reveal>

          <Reveal
            as="div"
            delay={160}
            className="flex flex-col items-center gap-[var(--space-3)] sm:flex-row"
          >
            <Button asChild variant="outline" size="lg" data-slot="home-portfolio-cta">
              <Link to="/portfolio">View Portfolio</Link>
            </Button>
            <Button
              type="button"
              variant="brand"
              size="lg"
              onClick={openEnquiry}
              data-slot="home-hero-enquiry-cta"
            >
              Book A Call
            </Button>
          </Reveal>
        </Container>
      </Section>

      {/* 2. Client / partner indicators (separate from the metrics, Requirement 4.3). */}
      <Section tone="canvas" pad="md" aria-label="Trusted by" data-slot="home-clients">
        <Container className="flex flex-col items-center gap-[var(--space-6)]">
          <p className="text-[length:var(--text-meta)] font-medium uppercase tracking-[0.08em] text-content-muted">
            Trusted By B2B Businesses Worldwide
          </p>
          <ul className="flex flex-wrap items-center justify-center gap-[var(--space-4)]">
            {clients.map((client) => (
              <li key={client}>
                <Badge accent="blue" tone="soft">
                  {client}
                </Badge>
              </li>
            ))}
          </ul>
        </Container>
      </Section>

      {/* 3. Business metrics (Requirement 4.3). */}
      <Section tone="surface" pad="lg" aria-label="Business metrics" data-slot="home-metrics">
        <Container>
          <div className="grid grid-cols-2 gap-[var(--space-7)] md:grid-cols-4">
            {metrics.map((metric) => (
              <Reveal key={metric.label}>
                <StatBlock
                  value={metric.value}
                  suffix={metric.suffix}
                  label={metric.label}
                  align="center"
                />
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>

      {/* 4. Service offerings (Requirement 4.4). */}
      <Section tone="canvas" pad="lg" data-slot="home-services">
        <Container className="flex flex-col gap-[var(--space-7)]">
          <SectionHeading
            level={2}
            eyebrow="What We Do"
            title="Custom Digital Solutions, Designed For Growth."
            action={
              <Button
                type="button"
                variant="brand"
                size="lg"
                onClick={openEnquiry}
                data-slot="home-services-cta"
              >
                Contact Us
              </Button>
            }
          />

          <div className="grid grid-cols-1 gap-[var(--space-5)] md:grid-cols-3">
            {services.map((service) => (
              <Card
                key={service.title}
                tone="raised"
                interactive
                className="overflow-hidden"
                data-slot="home-service"
              >
                <SafeImage
                  src={service.img}
                  alt={service.title}
                  ratio="4/3"
                  className="w-full"
                />
                <div className="flex flex-col gap-[var(--space-3)] p-[var(--space-6)]">
                  <h3 className="text-[length:var(--text-heading)] font-bold tracking-[-0.01em] text-content">
                    {service.title}
                  </h3>
                  <p className="flex items-center gap-[var(--space-2)] text-[length:var(--text-label)] font-semibold text-tech-cyan">
                    Learn More <span aria-hidden="true">→</span>
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </Container>
      </Section>

      {/* 5. Comparison band (dark, token-driven) (Requirement 4.5). */}
      <Section tone="deep" pad="lg" data-slot="home-comparison">
        <Container className="flex flex-col gap-[var(--space-8)]">
          <SectionHeading
            level={2}
            align="center"
            title="Why would you want to settle for less?"
            className="items-center"
          />

          <div className="mx-auto grid w-full max-w-[var(--container-narrow)] gap-[var(--space-5)] md:grid-cols-2">
            <Card tone="surface" className="p-[var(--space-6)] md:p-[var(--space-7)]">
              <h3 className="mb-[var(--space-6)] text-[length:var(--text-heading)] font-bold text-content-muted">
                Other Agencies
              </h3>
              <ul className="flex flex-col gap-[var(--space-4)]">
                {otherAgencies.map((item) => (
                  <li key={item} className="flex items-center gap-[var(--space-3)] text-[length:var(--text-body)] text-content">
                    <span
                      aria-hidden="true"
                      className="flex size-[var(--space-6)] shrink-0 items-center justify-center rounded-pill bg-danger/10 font-bold text-danger"
                    >
                      ✗
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </Card>

            <Card
              tone="raised"
              className="p-[var(--space-6)] shadow-glow md:p-[var(--space-7)]"
            >
              <h3 className="mb-[var(--space-6)] flex items-center gap-[var(--space-3)] text-[length:var(--text-heading)] font-extrabold text-tech-cyan">
                <GiOwl aria-hidden="true" className="size-[var(--size-icon-lg)]" />
                exflow
              </h3>
              <ul className="flex flex-col gap-[var(--space-4)]">
                {exflowStrengths.map((item) => (
                  <li key={item} className="flex items-center gap-[var(--space-3)] text-[length:var(--text-body)] font-medium text-content">
                    <span
                      aria-hidden="true"
                      className="flex size-[var(--space-6)] shrink-0 items-center justify-center rounded-pill bg-success/10 font-bold text-success"
                    >
                      ✓
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </Container>
      </Section>

      {/* 6. Development process band (dark, token-driven) (Requirement 4.5). */}
      <Section tone="canvas" pad="lg" data-slot="home-process">
        <Container className="flex flex-col gap-[var(--space-8)]">
          <p className="mx-auto max-w-[var(--container-narrow)] text-center text-[length:var(--text-body)] leading-relaxed text-content-muted">
            Unlike most agencies, we don&apos;t cut corners. We deep dive into
            understanding your business, crafting user experiences that engage,
            and execute those with precision.
          </p>

          <div className="grid items-center gap-[var(--space-7)] md:grid-cols-2">
            <Reveal>
              {/* Editor mockup with a token-based syntax palette. */}
              <div className="overflow-hidden rounded-md border border-line bg-surface shadow-raise">
                <div className="flex items-center gap-[var(--space-2)] border-b border-line bg-surface-high px-[var(--space-4)] py-[var(--space-3)]">
                  <span aria-hidden="true" className="size-3 rounded-pill bg-danger" />
                  <span aria-hidden="true" className="size-3 rounded-pill bg-warning" />
                  <span aria-hidden="true" className="size-3 rounded-pill bg-success" />
                </div>
                <pre className="overflow-x-auto p-[var(--space-6)] font-mono text-[length:var(--text-label)] leading-relaxed text-content">
                  <code>
                    <span className="text-tech-violet">export default function </span>
                    <span className="text-tech-blue">Software</span>() {"{"}
                    {"\n"}
                    {"  "}
                    <span className="text-content-muted">// Building digital experiences</span>
                    {"\n"}
                    {"  "}
                    <span className="text-tech-violet">return </span>(
                    {"\n"}
                    {"    "}
                    <span className="text-tech-cyan">&lt;ExFlow</span>
                    {"\n"}
                    {"      "}
                    <span className="text-tech-blue">performance=</span>
                    <span className="text-success">&quot;optimal&quot;</span>
                    {"\n"}
                    {"      "}
                    <span className="text-tech-blue">design=</span>
                    <span className="text-success">&quot;pixel-perfect&quot;</span>
                    {"\n"}
                    {"      "}
                    <span className="text-tech-blue">growth=</span>
                    <span className="text-warning">{"{true}"}</span>
                    {"\n"}
                    {"    "}
                    <span className="text-tech-cyan">/&gt;</span>
                    {"\n"}
                    {"  "}
                    <span className="text-tech-violet">);</span>
                    {"\n"}
                    <span className="text-tech-violet">{"}"}</span>
                  </code>
                </pre>
              </div>
            </Reveal>

            <Reveal delay={80} className="flex flex-col gap-[var(--space-4)]">
              <Eyebrow>Step 03</Eyebrow>
              <h2 className="text-[length:var(--text-heading)] font-extrabold tracking-[-0.01em] text-content">
                Development
              </h2>
              <p className="max-w-[var(--measure)] text-[length:var(--text-body)] leading-relaxed text-content-muted">
                With designs and content finalized, our development team
                translates them into a fully functional website. We focus on
                clean coding, responsiveness, and ensure that the site works
                flawlessly across all devices.
              </p>
            </Reveal>
          </div>
        </Container>
      </Section>

      {/* 7. Testimonial (Requirement 4.5). */}
      <Section tone="surface" pad="lg" data-slot="home-testimonial">
        <Container className="flex flex-col gap-[var(--space-8)]">
          <SectionHeading
            level={2}
            align="center"
            title="What It's Like to Work With Us, Straight From Our Clients"
            className="items-center"
          />

          <div className="grid items-center gap-[var(--space-7)] md:grid-cols-2">
            <div className="relative">
              <SafeImage
                src="/manoj-sir.jpg"
                alt="Manoj Sir — Senior Faculty Physics, Gurukul Institute"
                ratio="16/9"
                className="w-full rounded-md border border-line"
              />
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 flex items-center justify-center"
              >
                <span className="flex size-[var(--space-8)] items-center justify-center rounded-pill bg-surface text-tech-cyan shadow-float">
                  <Play className="size-[var(--size-icon-md)]" />
                </span>
              </span>
            </div>

            <div className="flex flex-col gap-[var(--space-5)]">
              <blockquote className="text-[length:var(--text-heading)] font-medium leading-snug text-content">
                “Gurtron completely transformed Gurukul Institute’s online
                presence. The website looks professional, works smoothly, and
                has helped us build more trust with students and parents. We’re
                extremely happy with the quality and support provided.”
              </blockquote>
              <div className="flex flex-col gap-[var(--space-1)]">
                <p className="text-[length:var(--text-body)] font-bold text-content">
                  Manoj Sir
                </p>
                <p className="text-[length:var(--text-label)] font-medium text-tech-cyan">
                  Senior Faculty Physics, Gurukul Institute
                </p>
              </div>

              <div className="flex gap-[var(--space-3)]">
                <Button variant="outline" size="icon" aria-label="Previous testimonial">
                  <span aria-hidden="true">←</span>
                </Button>
                <Button variant="outline" size="icon" aria-label="Next testimonial">
                  <span aria-hidden="true">→</span>
                </Button>
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* 8. Media placeholder (Requirement 4.5). */}
      <Section tone="canvas" pad="lg" data-slot="home-media">
        <Container className="flex flex-col items-center gap-[var(--space-7)]">
          <SectionHeading level={2} align="center" title="In the Media" className="items-center" />
          <div className="flex h-[var(--space-9)] w-full max-w-[var(--container-narrow)] items-center justify-center rounded-md border-2 border-dashed border-line bg-surface">
            <span className="text-[length:var(--text-body)] font-medium text-content-muted">
              Media highlights coming soon
            </span>
          </div>
        </Container>
      </Section>

      {/* 9. Scheduling calendar (Requirement 4.5, 4.7, 4.8). */}
      <Section tone="surface" pad="lg" data-slot="home-calendar">
        <Container className="flex flex-col items-center gap-[var(--space-7)]">
          <SectionHeading
            level={2}
            align="center"
            title="Let's Talk About Your Next Big Move."
            className="items-center"
          />

          <Card tone="raised" className="w-full max-w-[var(--container-narrow)] p-[var(--space-6)] md:p-[var(--space-7)]">
            <h3 className="mb-[var(--space-6)] text-[length:var(--text-heading)] font-bold text-content">
              Schedule Your Discovery Call
            </h3>
            <div className="rounded-md border border-line bg-surface p-[var(--space-4)]">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="mx-auto"
              />
            </div>
          </Card>
        </Container>
      </Section>

      {/* 10. Contact area (Requirement 4.5). */}
      <Section
        tone="canvas"
        pad="lg"
        backdrop={<TechBackdrop variant="grid" intensity="subtle" />}
        data-slot="home-contact"
      >
        <Container width="narrow">
          <Card tone="raised" className="p-[var(--space-6)] md:p-[var(--space-7)]">
            <h3 className="mb-[var(--space-6)] text-[length:var(--text-heading)] font-bold text-content">
              Request A Quote
            </h3>
            <form
              className="flex flex-col gap-[var(--space-5)]"
              onSubmit={(event) => event.preventDefault()}
            >
              <div className="flex flex-col gap-[var(--space-2)]">
                <Label htmlFor="home-name">Full Name*</Label>
                <Input id="home-name" placeholder="John Doe" />
              </div>
              <div className="flex flex-col gap-[var(--space-2)]">
                <Label htmlFor="home-company">Company Name*</Label>
                <Input id="home-company" placeholder="Acme Inc." />
              </div>
              <div className="flex flex-col gap-[var(--space-2)]">
                <Label htmlFor="home-email">Email*</Label>
                <Input id="home-email" type="email" placeholder="john@example.com" />
              </div>
              <Button
                type="button"
                variant="brand"
                size="lg"
                onClick={openEnquiry}
                className={cn("w-full")}
                data-slot="home-contact-cta"
              >
                Book A Call
              </Button>
            </form>
          </Card>
        </Container>
      </Section>
    </>
  );
}
