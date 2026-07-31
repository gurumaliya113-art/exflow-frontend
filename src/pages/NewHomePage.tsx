import { useState } from "react";
import { Link } from "react-router-dom";
import { GiOwl } from "react-icons/gi";
import { Play } from "lucide-react";

import Badge from "@/components/system/Badge";
import Container from "@/components/system/Container";
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
 * `/` - the ExFlow homepage.
 *
 * Positioning: ExFlow is a **technology partner** that helps businesses launch,
 * automate, optimise and scale — not a "website / app development agency".
 * Every region answers one question: "How will ExFlow help my business grow?"
 * so the copy leads with business outcomes, not technologies.
 *
 * The route shell (PublicLayout) owns the header, footer and floating action;
 * this page renders content only. Presentation stays token-only and dark by
 * default; the orange Brand_Accent is reserved for conversion buttons. The
 * route's single top-level heading is the hero headline.
 */

/** Impact-oriented metrics (outcomes, not vanity counts). */
const metrics = [
  { value: "500", suffix: "+", label: "Hours Saved / Month" },
  { value: "50", suffix: "+", label: "Processes Automated" },
  { value: "35", suffix: "+", label: "Businesses Digitised" },
  { value: "10", suffix: "K+", label: "Users Served" },
];

/** Client / partner indicators, kept as neutral token-styled marks. */
const clients = ["Amazon", "RK Travels", "Adarsh School", "Shree Krishna Drycleaners"];

/** Business challenges → the ExFlow answer. The section that sets us apart. */
const challenges = [
  { problem: "Too much manual work", solution: "AI & Workflow Automation" },
  { problem: "Business scattered across Excel & WhatsApp", solution: "Centralised Management System" },
  { problem: "Losing customers due to slow response", solution: "AI Customer Support" },
  { problem: "No visibility into operations", solution: "Live Dashboards & Reports" },
  { problem: "Employees wasting time on repetitive tasks", solution: "Process Automation" },
  { problem: "Multiple software subscriptions", solution: "One Custom Integrated Platform" },
  { problem: "Business not ready to scale", solution: "Scalable Digital Infrastructure" },
];

/** What we actually do — organised around business problems, not tech stacks. */
const capabilities = [
  {
    title: "Business Automation",
    lead: "Eliminate repetitive manual work.",
    benefit: "Save hundreds of working hours every month.",
    examples: ["Workflow Automation", "AI Automation", "Document Automation", "Employee Automation", "Approval Systems"],
  },
  {
    title: "Customer Experience",
    lead: "Serve your customers faster.",
    benefit: "Increase customer satisfaction and conversions.",
    examples: ["Websites", "Mobile Apps", "Customer Portals", "Booking Systems", "Client Dashboards"],
  },
  {
    title: "Business Management",
    lead: "Run every operation from one place.",
    benefit: "Full control over your business from anywhere.",
    examples: ["ERP", "CRM", "Inventory", "HR", "Finance", "Fleet", "School Management"],
  },
  {
    title: "AI Solutions",
    lead: "Make your business work even while you sleep.",
    benefit: "24×7 customer support without hiring more staff.",
    examples: ["AI Customer Support", "AI Voice Assistant", "AI WhatsApp Assistant", "AI Sales Assistant", "AI Knowledge Assistant"],
  },
  {
    title: "Business Intelligence",
    lead: "Turn your data into decisions.",
    benefit: "Make better business decisions using real-time data.",
    examples: ["Reports", "Analytics", "Live Dashboards", "Performance Tracking"],
  },
];

/** Why businesses choose ExFlow — outcomes, never generic "quality team" lines. */
const whyChoose = [
  "Reduce Operational Costs",
  "Save Time Through Automation",
  "Increase Business Productivity",
  "Scale Faster",
  "Centralise Business Operations",
  "Improve Customer Experience",
  "AI-Ready Solutions",
  "Long-Term Technology Partner",
];

/** Industries we help grow through technology. */
const industries = [
  "Education", "Healthcare", "Transport", "Retail", "Manufacturing",
  "Restaurants", "Construction", "Real Estate", "Finance", "Startups",
];

/** How we work — framed around the business, not a dev checklist. */
const process = [
  { step: "01", title: "Understand Your Business", desc: "We learn how your business actually runs — your goals, bottlenecks and day-to-day reality." },
  { step: "02", title: "Identify Problems", desc: "We pinpoint what slows you down: manual work, scattered data, lost customers, blind spots." },
  { step: "03", title: "Design the Best Solution", desc: "We design the right system around your workflow — not a generic template." },
  { step: "04", title: "Develop", desc: "We build it with clean, reliable technology that works across every device." },
  { step: "05", title: "Launch", desc: "We roll it out smoothly and make sure your team is comfortable using it." },
  { step: "06", title: "Support & Improve", desc: "We stay on as your technology partner — improving and scaling as you grow." },
];

export default function Home() {
  const { openEnquiry } = useEnquiry();

  // The calendar's selected day is page state, so opening the modal (which does
  // not touch this state) leaves the selection intact.
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
        <Container width="narrow" className="flex flex-col items-center gap-[var(--space-5)] text-center">
          <Reveal as="h1" className="text-[length:var(--text-display)] font-extrabold leading-tight tracking-[-0.02em] text-content">
            We Build Technology That Helps Businesses Grow.
          </Reveal>

          <Reveal as="p" delay={80} className="max-w-[var(--measure)] text-[length:var(--text-body)] leading-relaxed text-content-muted">
            We help businesses streamline operations, automate repetitive work, build powerful
            digital products, and grow faster with modern technology.
          </Reveal>

          <Reveal as="div" delay={120} className="flex flex-col items-center gap-[var(--space-3)] sm:flex-row sm:gap-[var(--space-5)]">
            <Badge accent="tech" tone="outline">Automate</Badge>
            <Badge accent="tech" tone="outline">Optimise</Badge>
            <Badge accent="tech" tone="outline">Scale</Badge>
          </Reveal>

          <Reveal as="div" delay={160} className="flex flex-col items-center gap-[var(--space-3)] sm:flex-row">
            <Button type="button" variant="brand" size="lg" onClick={openEnquiry} data-slot="home-hero-enquiry-cta">
              Start Your Project
            </Button>
            <Button asChild variant="outline" size="lg" data-slot="home-portfolio-cta">
              <Link to="/portfolio">View Our Work</Link>
            </Button>
          </Reveal>
        </Container>
      </Section>

      {/* 2. Client / partner indicators. */}
      <Section tone="canvas" pad="md" aria-label="Trusted by" data-slot="home-clients">
        <Container className="flex flex-col items-center gap-[var(--space-6)]">
          <p className="text-[length:var(--text-meta)] font-medium uppercase tracking-[0.08em] text-content-muted">
            Trusted By Businesses Across Industries
          </p>
          <ul className="flex flex-wrap items-center justify-center gap-[var(--space-4)]">
            {clients.map((client) => (
              <li key={client}>
                <Badge accent="blue" tone="soft">{client}</Badge>
              </li>
            ))}
          </ul>
        </Container>
      </Section>

      {/* 3. Business Challenges We Solve — the differentiator. */}
      <Section tone="surface" pad="lg" data-slot="home-challenges">
        <Container className="flex flex-col gap-[var(--space-7)]">
          <SectionHeading
            level={2}
            eyebrow="Business Challenges We Solve"
            title="Every growing business hits the same walls. We remove them."
          />
          <div className="grid grid-cols-1 gap-[var(--space-4)] md:grid-cols-2 lg:grid-cols-3">
            {challenges.map((c) => (
              <Reveal key={c.problem}>
                <Card tone="raised" className="flex h-full flex-col gap-[var(--space-3)] p-[var(--space-6)]" data-slot="home-challenge">
                  <p className="flex items-start gap-[var(--space-3)] text-[length:var(--text-body)] text-content-muted">
                    <span aria-hidden="true" className="mt-[2px] flex size-[var(--space-5)] shrink-0 items-center justify-center rounded-pill bg-danger/10 text-[length:var(--text-label)] font-bold text-danger">✗</span>
                    {c.problem}
                  </p>
                  <p className="flex items-start gap-[var(--space-3)] text-[length:var(--text-body)] font-semibold text-content">
                    <span aria-hidden="true" className="mt-[2px] flex size-[var(--space-5)] shrink-0 items-center justify-center rounded-pill bg-success/10 text-[length:var(--text-label)] font-bold text-success">✓</span>
                    {c.solution}
                  </p>
                </Card>
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>

      {/* 4. What we actually do — business outcomes, not tech services. */}
      <Section tone="canvas" pad="lg" data-slot="home-services">
        <Container className="flex flex-col gap-[var(--space-7)]">
          <SectionHeading
            level={2}
            eyebrow="What We Do"
            title="Technology that solves real business problems."
            action={
              <Button type="button" variant="brand" size="lg" onClick={openEnquiry} data-slot="home-services-cta">
                Book Free Consultation
              </Button>
            }
          />
          <div className="grid grid-cols-1 gap-[var(--space-5)] md:grid-cols-2 lg:grid-cols-3">
            {capabilities.map((cap) => (
              <Card key={cap.title} tone="raised" className="flex h-full flex-col gap-[var(--space-4)] p-[var(--space-6)]" data-slot="home-service">
                <div className="flex flex-col gap-[var(--space-2)]">
                  <h3 className="text-[length:var(--text-heading)] font-bold tracking-[-0.01em] text-content">{cap.title}</h3>
                  <p className="text-[length:var(--text-label)] text-content-muted">{cap.lead}</p>
                </div>
                <ul className="flex flex-wrap gap-[var(--space-2)]">
                  {cap.examples.map((ex) => (
                    <li key={ex}>
                      <Badge accent="tech" tone="soft">{ex}</Badge>
                    </li>
                  ))}
                </ul>
                <p className="mt-auto flex items-start gap-[var(--space-2)] text-[length:var(--text-label)] font-semibold text-tech-cyan">
                  <span aria-hidden="true">✓</span> {cap.benefit}
                </p>
              </Card>
            ))}
          </div>
        </Container>
      </Section>

      {/* 5. Why businesses choose ExFlow — outcomes. */}
      <Section tone="deep" pad="lg" data-slot="home-why">
        <Container className="flex flex-col gap-[var(--space-8)]">
          <SectionHeading level={2} align="center" title="Why Businesses Choose ExFlow" className="items-center" />
          <div className="mx-auto grid w-full max-w-[var(--container-narrow)] grid-cols-1 gap-[var(--space-4)] sm:grid-cols-2">
            {whyChoose.map((item) => (
              <div key={item} className="flex items-center gap-[var(--space-3)] text-[length:var(--text-body)] font-medium text-content">
                <span aria-hidden="true" className="flex size-[var(--space-6)] shrink-0 items-center justify-center rounded-pill bg-success/10 font-bold text-success">✓</span>
                {item}
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* 6. Industries. */}
      <Section tone="canvas" pad="lg" data-slot="home-industries">
        <Container className="flex flex-col items-center gap-[var(--space-6)]">
          <SectionHeading
            level={2}
            align="center"
            eyebrow="Industries"
            title="Helping businesses across industries grow through technology."
            className="items-center"
          />
          <ul className="flex flex-wrap items-center justify-center gap-[var(--space-3)]">
            {industries.map((industry) => (
              <li key={industry}>
                <Badge accent="blue" tone="soft">{industry}</Badge>
              </li>
            ))}
          </ul>
        </Container>
      </Section>

      {/* 7. How we work — business-framed process. */}
      <Section tone="surface" pad="lg" data-slot="home-process">
        <Container className="flex flex-col gap-[var(--space-8)]">
          <SectionHeading level={2} align="center" eyebrow="How We Work" title="A partnership, from first call to long-term growth." className="items-center" />
          <div className="grid grid-cols-1 gap-[var(--space-5)] md:grid-cols-2 lg:grid-cols-3">
            {process.map((p) => (
              <Reveal key={p.step}>
                <Card tone="raised" className="flex h-full flex-col gap-[var(--space-3)] p-[var(--space-6)]">
                  <span className="text-[length:var(--text-heading)] font-extrabold text-tech-cyan">{p.step}</span>
                  <h3 className="text-[length:var(--text-body)] font-bold text-content">{p.title}</h3>
                  <p className="text-[length:var(--text-label)] leading-relaxed text-content-muted">{p.desc}</p>
                </Card>
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>

      {/* 8. Featured work — Problem → Solution → Impact (not "tech used"). */}
      <Section tone="canvas" pad="lg" data-slot="home-work">
        <Container className="flex flex-col gap-[var(--space-7)]">
          <SectionHeading level={2} eyebrow="Featured Work" title="GurTron — a complete digital learning ecosystem." />
          <div className="grid grid-cols-1 gap-[var(--space-5)] md:grid-cols-3">
            <Card tone="raised" className="flex flex-col gap-[var(--space-2)] p-[var(--space-6)]">
              <span className="text-[length:var(--text-label)] font-semibold uppercase tracking-[0.08em] text-danger">Problem</span>
              <p className="text-[length:var(--text-body)] text-content">Managing educational content, exams and students manually.</p>
            </Card>
            <Card tone="raised" className="flex flex-col gap-[var(--space-2)] p-[var(--space-6)]">
              <span className="text-[length:var(--text-label)] font-semibold uppercase tracking-[0.08em] text-tech-cyan">Our Solution</span>
              <p className="text-[length:var(--text-body)] text-content">A complete digital learning ecosystem for content, exams and students.</p>
            </Card>
            <Card tone="raised" className="flex flex-col gap-[var(--space-2)] p-[var(--space-6)]">
              <span className="text-[length:var(--text-label)] font-semibold uppercase tracking-[0.08em] text-success">Business Impact</span>
              <p className="text-[length:var(--text-body)] text-content">Better content management, online learning, higher student engagement and improved operational efficiency.</p>
            </Card>
          </div>
          <div>
            <Button asChild variant="outline" size="lg">
              <Link to="/portfolio">See more of our work</Link>
            </Button>
          </div>
        </Container>
      </Section>

      {/* 9. Testimonial. */}
      <Section tone="surface" pad="lg" data-slot="home-testimonial">
        <Container className="flex flex-col gap-[var(--space-8)]">
          <SectionHeading level={2} align="center" title="What It's Like to Work With Us, Straight From Our Clients" className="items-center" />
          <div className="grid items-center gap-[var(--space-7)] md:grid-cols-2">
            <div className="relative">
              <SafeImage src="/manoj-sir.jpg" alt="Manoj Sir — Senior Faculty Physics, Gurukul Institute" ratio="16/9" className="w-full rounded-md border border-line" />
              <span aria-hidden="true" className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <span className="flex size-[var(--space-8)] items-center justify-center rounded-pill bg-surface text-tech-cyan shadow-float">
                  <Play className="size-[var(--size-icon-md)]" />
                </span>
              </span>
            </div>
            <div className="flex flex-col gap-[var(--space-5)]">
              <blockquote className="text-[length:var(--text-heading)] font-medium leading-snug text-content">
                “Gurtron completely transformed Gurukul Institute’s online presence. The website
                looks professional, works smoothly, and has helped us build more trust with
                students and parents. We’re extremely happy with the quality and support provided.”
              </blockquote>
              <div className="flex flex-col gap-[var(--space-1)]">
                <p className="text-[length:var(--text-body)] font-bold text-content">Manoj Sir</p>
                <p className="text-[length:var(--text-label)] font-medium text-tech-cyan">Senior Faculty Physics, Gurukul Institute</p>
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* 10. Impact metrics. */}
      <Section tone="canvas" pad="lg" aria-label="Impact metrics" data-slot="home-metrics">
        <Container>
          <div className="grid grid-cols-2 gap-[var(--space-7)] md:grid-cols-4">
            {metrics.map((metric) => (
              <Reveal key={metric.label}>
                <StatBlock value={metric.value} suffix={metric.suffix} label={metric.label} align="center" />
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>

      {/* 11. Scheduling calendar. */}
      <Section tone="surface" pad="lg" data-slot="home-calendar">
        <Container className="flex flex-col items-center gap-[var(--space-7)]">
          <SectionHeading level={2} align="center" title="Let's Talk About Your Next Big Move." className="items-center" />
          <Card tone="raised" className="w-full max-w-[var(--container-narrow)] p-[var(--space-6)] md:p-[var(--space-7)]">
            <h3 className="mb-[var(--space-6)] text-[length:var(--text-heading)] font-bold text-content">Schedule Your Discovery Call</h3>
            <div className="rounded-md border border-line bg-surface p-[var(--space-4)]">
              <Calendar mode="single" selected={date} onSelect={setDate} className="mx-auto" />
            </div>
          </Card>
        </Container>
      </Section>

      {/* 12. Closing CTA + contact. */}
      <Section
        tone="canvas"
        pad="lg"
        backdrop={<TechBackdrop variant="grid" intensity="subtle" />}
        data-slot="home-contact"
      >
        <Container width="narrow" className="flex flex-col gap-[var(--space-7)]">
          <div className="flex flex-col items-center gap-[var(--space-4)] text-center">
            <h2 className="flex items-center gap-[var(--space-3)] text-[length:var(--text-display)] font-extrabold tracking-[-0.02em] text-content">
              <GiOwl aria-hidden="true" className="size-[var(--size-icon-lg)] text-tech-cyan" />
              Ready to Transform Your Business?
            </h2>
            <p className="max-w-[var(--measure)] text-[length:var(--text-body)] leading-relaxed text-content-muted">
              Let's discuss how technology and AI can help you save time, reduce costs, and grow faster.
            </p>
          </div>
          <Card tone="raised" className="p-[var(--space-6)] md:p-[var(--space-7)]">
            <h3 className="mb-[var(--space-6)] text-[length:var(--text-heading)] font-bold text-content">Tell us about your business</h3>
            <form className="flex flex-col gap-[var(--space-5)]" onSubmit={(event) => event.preventDefault()}>
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
              <Button type="button" variant="brand" size="lg" onClick={openEnquiry} className={cn("w-full")} data-slot="home-contact-cta">
                Start Your Project
              </Button>
            </form>
          </Card>
        </Container>
      </Section>
    </>
  );
}
