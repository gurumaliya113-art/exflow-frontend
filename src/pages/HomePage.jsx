import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, FileText, Search, Shield } from 'lucide-react'

import { useEnquiry } from '@/components/enquiry/EnquiryProvider'
import Badge from '@/components/system/Badge'
import Container from '@/components/system/Container'
import Reveal from '@/components/system/Reveal'
import Section from '@/components/system/Section'
import SectionHeading from '@/components/system/SectionHeading'
import SelectionGroup, { useSelectionMember } from '@/components/system/SelectionGroup'
import TechBackdrop from '@/components/system/TechBackdrop'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useMotionSafe } from '@/hooks/useMotionSafe'
import { cn } from '@/lib/utils'

/**
 * `/home-old` - a Legacy_Route page.
 *
 * `LegacyLayout` (applied in `App.jsx`) owns the legacy header, the `main`
 * landmark, and the compact footer, so this page renders content only and
 * declares no chrome of its own (Requirements 8.1, 2.1).
 *
 * Everything a visitor could do here before the redesign still exists, with the
 * same destination or outcome (Requirements 8.2, 11.1, 11.6):
 *
 * - the service selector, now a `SelectionGroup` of `Badge`-styled real buttons
 *   that expose their state through `aria-pressed`, so exactly one service can
 *   be selected at a time and assistive technology is told which one;
 * - the selected-service feedback, which - as before - appears only after a
 *   chip has been activated and never on first paint;
 * - all seven case studies with their badges, titles, subtitles, problem lists,
 *   solution lists, impact lists, and the recognition note;
 * - the `id="work"` anchor on the case-study band, which the legacy header's
 *   "Our Work" item scrolls to, plus the same hash handling on mount;
 * - the navigation actions, all still links: Explore Solutions and Partner With
 *   Us to `/partner`, Enquire Now and Enquire For Work to `/enquire`
 *   (Requirement 11.8);
 * - the two enquiry actions that opened the enquiry workflow, Request A Quote
 *   and the fixed Book A Call, now routed through the shared opener so the
 *   workflow has a single activation surface.
 *
 * Motion (Requirement 9.5): activating a chip briefly rings the Enquire Now
 * action, as the pre-redesign pulse did. The ring is decorative reinforcement,
 * so it is not applied at all while Reduced_Motion_Preference is active, and
 * the on-mount hash scroll falls back to an instant jump to the same anchor.
 * Selecting a service still shows its own state (chip fill, underline, and the
 * selected-service line) either way.
 *
 * Heading structure (Requirement 10.5): one `h1` in the hero, level 2 for each
 * band, level 3 per case study, level 4 for the two panels inside a case study,
 * and level 5 for the notes inside the solution panel - the same gap-free
 * outline the page had before. The Why Us entries and the rating labels are not
 * headings, exactly as before.
 *
 * Presentation is token-only: no literal color value in any form, every size
 * and space from the token scales (Requirements 1.1, 1.2). The Brand_Accent
 * appears only on conversion actions (Requirement 1.3).
 *
 * Requirements: 1.1, 1.2, 8.1, 8.2, 9.5, 10.5, 11.1, 11.6
 */

/** How long the Enquire Now ring stays on after a chip activation, in ms. */
export const PULSE_MS = 1400

/** Entrance stagger per card, in ms. `Reveal` clamps the total for us. */
const CARD_STAGGER_MS = 60

/** Shared icon tile for the Why Us entries. */
const ICON_TILE =
  'inline-flex h-[var(--space-7)] w-[var(--space-7)] shrink-0 items-center justify-center rounded-sm bg-tech-cyan/10 text-tech-cyan'

/** Case-study panel heading role: one step below the case-study title. */
const PANEL_TITLE =
  'text-[length:var(--text-body)] font-semibold leading-snug tracking-[-0.01em] text-content'

/** Note heading inside a case-study panel. */
const NOTE_TITLE =
  'text-[length:var(--text-label)] font-semibold tracking-[0.01em] text-content'

/** Body copy inside a case-study panel. */
const PANEL_BODY =
  'text-[length:var(--text-label)] leading-relaxed text-content-muted'

/** The services a visitor can pick from, unchanged from the baseline. */
export const services = [
  'Coding',
  'Editing',
  'Social media manager',
  'Brand building',
  'Content creation',
  'Advertisements',
  'Software and tech',
  'Financing',
  'Auditing',
  'Interactive dashboard and analytics',
  'Startup building',
  'Ecommerce',
  'Dropshipping',
]

/** The third-party rating badges from the baseline hero. */
export const ratings = [
  { initial: 'D', name: 'DESIGNRUSH', score: '4.8 Star Ratings' },
  { initial: 'C', name: 'Clutch', score: '4.9/5.0 ★★★★★' },
]

/** The Why Us entries, unchanged from the baseline. */
export const whyUs = [
  { title: 'On-time delivery', desc: 'Committed timelines and clear milestones.' },
  {
    title: 'No full advanced payment',
    desc: 'Work starts without demanding full payment upfront.',
  },
  {
    title: 'Industry expertise free of cost',
    desc: 'Consulting, planning, and guidance included.',
  },
  {
    title: 'Industry cheapest price',
    desc: 'If anyone matches or goes below it (verified), we will do the entire work for free.',
    emphasis: true,
  },
]

/**
 * The case studies, unchanged from the baseline. `overview` is retained as the
 * fallback for a case study without a problem list; every entry has one today,
 * so - exactly as before - no overview string is rendered.
 */
export const projects = [
  {
    id: 'fog-safety-ai',
    badge: 'Featured Project',
    title: 'FOGG SAFETY AI SYSTEM',
    subtitle: 'Intelligent Driver Assistance & Fog Detection Technology',
    overview: 'We developed an advanced AI-powered Fog Safety & Driver Monitoring System designed to prevent highway accidents caused by low visibility and driver fatigue.',
    features: ['Real-time Fog Detection', 'Vehicle & Truck Recognition in Low Visibility', 'AI Vision-Based Object Detection', 'Driver Eye-Closure Detection', 'Instant Audio Alert System', 'Fatigue Monitoring', 'Smart Risk Prediction Engine'],
    problem: ['Highway accidents due to dense fog', 'Driver micro-sleep accidents', 'Poor visibility collision risk', 'Lack of intelligent alert system'],
    impact: ['Reduced accident risk in low-visibility conditions', 'Enhanced driver awareness', 'Smart AI integration for real-world safety'],
    recognition: 'Currently in strategic discussion with major mapping & geospatial technology companies including Mappls and Maps India regarding potential collaboration and acquisition opportunities.',
  },
  {
    id: 'rk-travels-fleet',
    badge: 'Enterprise System',
    title: 'Enterprise Fleet Management System',
    subtitle: 'Developed for RK Travels',
    overview: 'Complete Fleet Management + Analytics + Automation System for large-scale labor transport operations.',
    features: ['Real-time fleet tracking', 'Labor pickup-drop route optimization', 'Vehicle health monitoring', 'Driver performance tracking', 'Fuel monitoring system', 'Data analytics dashboard', 'Reporting automation'],
    problem: ['Manual fleet management inefficiency', 'No real-time tracking', 'Fuel wastage and route issues', 'Lack of performance data'],
    impact: ['6-figure project revenue', 'Operational efficiency improvement', 'Cost optimization & performance tracking'],
  },
  {
    id: 'mills-dashboard',
    badge: 'SaaS Product',
    title: 'Mills Business Dashboard',
    subtitle: 'Accounting + End-to-End Management SaaS',
    overview: 'Cloud-based business dashboard & accounting platform to replace offline manual processes that caused time waste, accounting confusion, and poor data management.',
    features: ['Complete accounting system', 'Inventory management', 'Sales & purchase tracking', 'Owner analytics dashboard', 'Membership-based SaaS model'],
    problem: ['Manual accounting errors', 'Time-consuming processes', 'Poor data management', 'No business analytics'],
    impact: ['Reduced manual workload', 'Increased operational efficiency', 'Enabled owners to focus on business growth'],
  },
  {
    id: 'scrap-app',
    badge: 'Startup Venture',
    title: 'SCRAP APP',
    subtitle: 'End-to-End Scrap Supply Chain Platform',
    overview: "Digitizing India's scrap & waste ecosystem with an end-to-end platform across collection, aggregation, logistics, and buyer-seller matchmaking.",
    features: ['Collection', 'Aggregation', 'Logistics', 'Buyer-Seller matchmaking', 'Digital records'],
    problem: ['Unorganized supply chain', 'No digital records', 'Inefficient logistics', 'Lack of buyer-seller matching'],
    impact: ['Seed stage, scalable model', 'Recognized by government departments including waste management authorities'],
  },
  {
    id: 'ecommerce-ops',
    badge: 'Operations & Growth',
    title: 'E-commerce Operations',
    subtitle: 'Meesho | Amazon | Flipkart',
    overview: 'Built and scaled fashion-category operations across major marketplaces with structured GST & Non-GST workflows.',
    features: ['Supply chain + catalog optimization', 'Marketplace algorithm understanding', 'Branding & product positioning', 'Performance marketing insights'],
    problem: ['No structured operations', 'Poor catalog management', 'Marketplace compliance gaps'],
    impact: ['5-figure revenue within initial launch days'],
  },
  {
    id: 'zubilo',
    badge: 'Global Brand',
    title: 'ZUBILO — USA Brand Launch',
    subtitle: 'Luxury-ready D2C launch (India → Worldwide)',
    overview: 'Global-ready fashion brand built for USA & international markets: website, mobile app, identity, and logistics planning — manufactured in India and exported worldwide.',
    features: ['Full website', 'Mobile app', 'Brand identity', 'International logistics'],
    problem: ['No global brand presence', 'No D2C infrastructure', 'Complex international logistics'],
    impact: ['Global-ready brand', 'Full D2C ecosystem built'],
  },
  {
    id: 'transformations',
    badge: 'Business Transformation',
    title: 'Business Transformation Projects',
    subtitle: 'Offline → Structured Digital Growth',
    overview: 'We helped offline businesses go digital with accounting dashboards, online presence, analytics, and operations consulting — focusing on measurable structure and growth.',
    features: ['Business digitization', 'Accounting dashboards', 'Online presence creation', 'Performance analytics', 'Branding & operations consulting'],
    problem: ['Zero digital presence', 'Manual operations', 'No performance tracking'],
    impact: ['Nursery Business: Zero → Hero', 'Hookah Show: Hero → Restructured Digital Model', 'RK Garments: Offline Struggling → Profitable Structured Retail'],
  },
]

/** Token-bulleted list used by every case-study panel. */
function FeatureList({ items }) {
  return (
    <ul className={cn('flex list-none flex-col gap-[var(--space-3)] p-0', PANEL_BODY)}>
      {items.map((item) => (
        <li key={item} className="flex gap-[var(--space-3)]">
          <span
            aria-hidden="true"
            className="mt-[var(--space-2)] h-[var(--space-2)] w-[var(--space-2)] shrink-0 rounded-[var(--radius-pill)] bg-tech-cyan"
          />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  )
}

/**
 * One service chip: a real `button` inside the `SelectionGroup`, so pointer,
 * Enter, and Space activation come from the platform and the selected state is
 * exposed through `aria-pressed` (Requirements 8.2, 10.9). Selected differs
 * from unselected by an outline change and an underline, not by color alone
 * (Requirement 9.2).
 */
function ServiceChip({ service }) {
  const { selected, select } = useSelectionMember({ id: service, value: service })

  return (
    <Badge
      as="button"
      type="button"
      tone={selected ? 'solid' : 'outline'}
      accent="tech"
      aria-pressed={selected}
      onClick={select}
      data-slot="home-old-service-chip"
      data-selected={selected ? 'true' : undefined}
      className={cn(
        'min-h-[var(--size-touch)] cursor-pointer md:min-h-8',
        'aria-pressed:underline aria-pressed:underline-offset-4 aria-pressed:decoration-2',
        'focus-visible:outline-[var(--border-2)] focus-visible:outline-offset-2 focus-visible:outline-focus',
        selected && 'ring-2 ring-tech-cyan',
      )}
    >
      {service}
    </Badge>
  )
}

export default function HomePage() {
  // Single enquiry activation surface. Outside a provider the hook still
  // reaches the mounted modal through its window bridge, so no CTA is inert.
  const { openEnquiry } = useEnquiry()
  const motionSafe = useMotionSafe()

  const [selected, setSelected] = useState(null)
  const [ringOn, setRingOn] = useState(false)
  const ringTimerRef = useRef(null)
  const hashHandledRef = useRef(false)

  // The legacy header's "Our Work" item is a hash destination, so an inbound
  // request carrying it lands on the anchor below. Under a reduced-motion
  // preference the same anchor is reached without the animated scroll.
  useEffect(() => {
    if (hashHandledRef.current) return undefined
    if (typeof window === 'undefined' || window.location.hash !== '#work') return undefined

    hashHandledRef.current = true
    const timer = window.setTimeout(() => {
      document.getElementById('work')?.scrollIntoView({
        behavior: motionSafe ? 'smooth' : 'auto',
        block: 'start',
      })
    }, 0)

    return () => window.clearTimeout(timer)
  }, [motionSafe])

  useEffect(
    () => () => {
      if (ringTimerRef.current) clearTimeout(ringTimerRef.current)
    },
    [],
  )

  // A preference change mid-session drops the decorative ring immediately.
  useEffect(() => {
    if (motionSafe) return
    if (ringTimerRef.current) clearTimeout(ringTimerRef.current)
    setRingOn(false)
  }, [motionSafe])

  /**
   * Record the picked service and, when decorative motion is allowed, ring the
   * Enquire Now action for the same window the pre-redesign pulse used. The
   * selected-service feedback itself is state, not decoration, so it is set
   * regardless of the preference.
   */
  function handleSelectService(service) {
    setSelected(service)

    if (ringTimerRef.current) clearTimeout(ringTimerRef.current)
    if (!motionSafe) {
      setRingOn(false)
      return
    }

    setRingOn(true)
    ringTimerRef.current = setTimeout(() => setRingOn(false), PULSE_MS)
  }

  const ringActive = ringOn && motionSafe

  return (
    <>
      <Section
        tone="surface"
        pad="lg"
        backdrop={<TechBackdrop variant="grid" intensity="subtle" />}
        data-slot="home-old-hero"
      >
        <Container
          width="narrow"
          className="flex flex-col items-center gap-[var(--space-5)] text-center"
        >
          <h1 className="text-[length:var(--text-display)] font-extrabold tracking-[-0.02em] text-content">
            Building High-Performance Websites and Software That Power Growing Businesses.
          </h1>
          <p className="max-w-[var(--measure)] text-[length:var(--text-body)] leading-relaxed text-content-muted">
            We design and develop custom websites, web applications, and software platforms that
            help businesses acquire users, streamline operations, and scale with confidence.
          </p>

          <div className="flex flex-col items-center gap-[var(--space-3)] sm:flex-row">
            <Button
              type="button"
              variant="brand"
              size="lg"
              onClick={openEnquiry}
              data-slot="home-old-quote-cta"
            >
              Request A Quote
            </Button>
            <Button asChild variant="outline" size="lg" data-slot="home-old-solutions-cta">
              <Link to="/partner">Explore Solutions</Link>
            </Button>
          </div>

          <div className="flex flex-col items-center gap-[var(--space-5)] sm:flex-row sm:justify-center">
            {ratings.map((rating) => (
              <div
                key={rating.name}
                data-slot="home-old-rating"
                className="flex flex-col items-center gap-[var(--space-2)]"
              >
                <div className="inline-flex items-center gap-[var(--space-3)] rounded-md border border-line bg-surface-high px-[var(--space-4)] py-[var(--space-3)]">
                  <span className="inline-flex h-[var(--space-6)] w-[var(--space-6)] items-center justify-center rounded-sm bg-tech-blue text-[length:var(--text-label)] font-semibold text-canvas">
                    {rating.initial}
                  </span>
                  <span className="text-[length:var(--text-label)] font-semibold tracking-[0.16em] text-content">
                    {rating.name}
                  </span>
                </div>
                <p className="text-[length:var(--text-meta)] text-content-muted">{rating.score}</p>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* Kept from the baseline: the page's own fixed conversion action, shown
          from the md breakpoint up. */}
      <Button
        type="button"
        variant="brand"
        onClick={openEnquiry}
        data-slot="home-old-call-cta"
        className="fixed right-[var(--space-5)] bottom-[var(--space-5)] z-50 hidden shadow-float md:inline-flex"
      >
        Book A Call
      </Button>

      <Section tone="canvas" pad="lg" data-slot="home-old-services">
        <Container className="flex flex-col gap-[var(--space-5)]">
          <SectionHeading
            level={2}
            title="Any Work or Workforce Are you looking To get Your Work Done?"
            lede="We Help You Get it Done in Minimum days With Experienced Workforce of us."
          />

          <p
            id="home-old-service-prompt"
            className="text-[length:var(--text-label)] font-semibold text-content"
          >
            What kind of service you are looking for?
          </p>

          <SelectionGroup
            name="home-old-services"
            value={selected}
            onChange={handleSelectService}
            aria-labelledby="home-old-service-prompt"
            data-slot="home-old-service-selector"
            className="flex flex-wrap gap-[var(--space-2)]"
          >
            {services.map((service) => (
              <ServiceChip key={service} service={service} />
            ))}
          </SelectionGroup>

          <div className="flex flex-col gap-[var(--space-3)] sm:flex-row sm:items-center">
            <Button
              asChild
              variant="brand"
              size="lg"
              data-slot="home-old-enquire-cta"
              data-pulse={ringActive ? 'true' : undefined}
              className={cn(
                ringActive && 'ring-2 ring-tech-cyan ring-offset-2 ring-offset-canvas',
              )}
            >
              <Link to="/enquire">
                Enquire Now
                <ArrowRight aria-hidden="true" />
              </Link>
            </Button>

            {selected ? (
              <p
                data-slot="home-old-selected-service"
                className="text-[length:var(--text-label)] text-content-muted"
              >
                Selected: <span className="font-semibold text-content">{selected}</span>
              </p>
            ) : null}
          </div>
        </Container>
      </Section>

      <Section tone="surface" pad="lg" data-slot="home-old-why-us">
        <Container className="flex flex-col gap-[var(--space-6)]">
          <SectionHeading
            level={2}
            title="Why Us"
            lede="Simple, transparent terms — focused on outcomes."
          />

          <ul className="grid list-none grid-cols-1 gap-[var(--space-4)] p-0 md:grid-cols-2">
            {whyUs.map((item, index) => (
              <Reveal
                key={item.title}
                as="li"
                delay={index * CARD_STAGGER_MS}
                className="h-full"
              >
                <Card tone="raised" className="h-full" data-slot="home-old-why-us-item">
                  <CardHeader className="flex-row items-start gap-[var(--space-4)]">
                    <span aria-hidden="true" className={ICON_TILE}>
                      <Shield className="h-[var(--size-icon-sm)] w-[var(--size-icon-sm)]" />
                    </span>
                    <div className="flex flex-col gap-[var(--space-2)]">
                      <CardTitle>{item.title}</CardTitle>
                      <CardDescription>
                        {item.emphasis ? (
                          <span className="rounded-xs bg-danger/10 px-[var(--space-2)] py-[var(--space-1)] font-semibold text-danger">
                            {item.desc}
                          </span>
                        ) : (
                          item.desc
                        )}
                      </CardDescription>
                    </div>
                  </CardHeader>
                </Card>
              </Reveal>
            ))}
          </ul>
        </Container>
      </Section>

      <Section id="work" tone="canvas" pad="lg" data-slot="home-old-work">
        <Container className="flex flex-col gap-[var(--space-7)]">
          <SectionHeading
            level={2}
            title="Our Work"
            lede="Scroll through premium case studies — enterprise systems, SaaS products, startup ventures, global brands, and transformation stories."
          />

          <div className="flex flex-col gap-[var(--space-6)]">
            {projects.map((project, index) => {
              const swap = index % 2 === 1
              return (
                <Reveal key={project.id} delay={CARD_STAGGER_MS}>
                  <Card
                    tone="surface"
                    data-slot="home-old-case-study"
                    className="p-[var(--space-5)] md:p-[var(--space-7)]"
                  >
                    <div className="grid gap-[var(--space-6)] md:grid-cols-2 md:items-start">
                      <div
                        className={cn(
                          'flex flex-col gap-[var(--space-4)]',
                          swap ? 'md:order-2' : 'md:order-1',
                        )}
                      >
                        <div className="flex flex-wrap items-center gap-[var(--space-2)]">
                          <Badge accent="tech" tone="soft">
                            {project.badge}
                          </Badge>
                          <Badge accent="tech" tone="outline">
                            EXFLOW
                          </Badge>
                        </div>

                        <div className="flex flex-col gap-[var(--space-2)]">
                          <h3 className="text-[length:var(--text-heading)] font-bold tracking-[-0.01em] text-content">
                            {project.title}
                          </h3>
                          <p className={PANEL_BODY}>{project.subtitle}</p>
                        </div>

                        <div className="flex flex-col gap-[var(--space-3)] sm:flex-row">
                          <Button
                            asChild
                            variant="tech"
                            data-slot="home-old-case-study-enquire"
                          >
                            <Link to="/enquire">
                              <Search aria-hidden="true" />
                              Enquire For Work
                              <ArrowRight aria-hidden="true" />
                            </Link>
                          </Button>
                          <Button
                            asChild
                            variant="outline"
                            data-slot="home-old-case-study-partner"
                          >
                            <Link to="/partner">
                              <FileText aria-hidden="true" />
                              Partner With Us
                            </Link>
                          </Button>
                        </div>
                      </div>

                      <div
                        className={cn(
                          'flex flex-col gap-[var(--space-4)]',
                          swap ? 'md:order-1' : 'md:order-2',
                        )}
                      >
                        <Card tone="raised" data-slot="home-old-case-study-problems">
                          <CardHeader>
                            <h4 className={PANEL_TITLE}>What are the problems?</h4>
                          </CardHeader>
                          <CardContent>
                            {project.problem?.length ? (
                              <FeatureList items={project.problem} />
                            ) : (
                              <p className={PANEL_BODY}>{project.overview}</p>
                            )}
                          </CardContent>
                        </Card>

                        <Card tone="raised" data-slot="home-old-case-study-solution">
                          <CardHeader>
                            <h4 className={PANEL_TITLE}>What solution we built</h4>
                          </CardHeader>
                          <CardContent className="flex flex-col gap-[var(--space-5)]">
                            <FeatureList items={project.features} />

                            {project.impact?.length ? (
                              <div className="flex flex-col gap-[var(--space-3)]">
                                <h5 className={NOTE_TITLE}>Impact</h5>
                                <FeatureList items={project.impact} />
                              </div>
                            ) : null}

                            {project.recognition ? (
                              <div className="flex flex-col gap-[var(--space-2)]">
                                <h5 className={NOTE_TITLE}>Industry Recognition</h5>
                                <p className={PANEL_BODY}>{project.recognition}</p>
                              </div>
                            ) : null}
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </Card>
                </Reveal>
              )
            })}
          </div>
        </Container>
      </Section>
    </>
  )
}
