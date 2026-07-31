import {
  Briefcase,
  Building2,
  Factory,
  GraduationCap,
  HardHat,
  HeartPulse,
  Home,
  Landmark,
  Rocket,
  ShoppingBag,
  Truck,
  Utensils,
} from 'lucide-react'

import { useEnquiry } from '@/components/enquiry/EnquiryProvider'
import Container from '@/components/system/Container'
import Eyebrow from '@/components/system/Eyebrow'
import Reveal from '@/components/system/Reveal'
import Section from '@/components/system/Section'
import SectionHeading from '@/components/system/SectionHeading'
import TechBackdrop from '@/components/system/TechBackdrop'
import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardHeader } from '@/components/ui/card'

/**
 * `/industries` - one of the Public_Information_Routes.
 *
 * Positioning: ExFlow helps businesses across industries grow through
 * technology, so each entry is framed by the outcome it creates for that
 * sector, not the software category it belongs to.
 *
 * Same uniform public-route shape as `/solutions`: hero `Section` with the
 * single `h1`, a content `Section` of `Card`s, then a closing call-to-action.
 * Presentation is token-only; every card shares one treatment.
 *
 * Requirements: 5.1, 5.2, 5.6, 1.1, 11.3
 */

const industries = [
  {
    icon: GraduationCap,
    title: 'Education',
    desc: 'Digital learning, admissions, exams and student management that cut manual work and improve engagement.',
  },
  {
    icon: HeartPulse,
    title: 'Healthcare',
    desc: 'Operational systems, scheduling and analytics that let teams focus on patients, not paperwork.',
  },
  {
    icon: Truck,
    title: 'Transport & Logistics',
    desc: 'Fleet tracking, fuel and route insights, and dashboards that cut losses and keep operations moving.',
  },
  {
    icon: ShoppingBag,
    title: 'Retail',
    desc: 'Billing, inventory and customer insights that keep stores stocked and customers coming back.',
  },
  {
    icon: Factory,
    title: 'Manufacturing',
    desc: 'Production tracking, inventory and reporting that improve efficiency on the floor.',
  },
  {
    icon: Utensils,
    title: 'Restaurants',
    desc: 'Ordering, kitchen and multi-outlet systems that speed up service and sharpen operations.',
  },
  {
    icon: HardHat,
    title: 'Construction',
    desc: 'Project, resource and site tracking that keep timelines and budgets under control.',
  },
  {
    icon: Home,
    title: 'Real Estate',
    desc: 'Listing, lead and client management that turn enquiries into closed deals.',
  },
  {
    icon: Landmark,
    title: 'Finance',
    desc: 'Secure workflows, reporting and automation that reduce risk and manual effort.',
  },
  {
    icon: Rocket,
    title: 'Startups',
    desc: 'Rapid MVPs and scalable platforms built to help you launch fast and grow.',
  },
]

/** The enquiry action label this route carries. */
const ENQUIRY_LABEL = 'Discuss Your Project'

export default function IndustriesPage() {
  const { openEnquiry } = useEnquiry()

  return (
    <>
      <Section
        tone="surface"
        pad="lg"
        backdrop={<TechBackdrop variant="mesh" intensity="subtle" />}
        data-slot="page-hero"
        data-page="industries"
      >
        <Container className="flex flex-col items-start gap-[var(--space-5)]">
          <Eyebrow icon={<Briefcase className="size-[var(--size-icon-xs)]" aria-hidden="true" />}>
            Industries We Serve
          </Eyebrow>

          <h1 className="text-[length:var(--text-display)] font-extrabold tracking-[-0.02em] text-content">
            Helping Businesses Across Industries{' '}
            <span className="text-tech-cyan">Grow Through Technology.</span>
          </h1>

          <p className="max-w-[var(--measure)] text-[length:var(--text-body)] leading-relaxed text-content-muted">
            Whatever your industry, the goal is the same — save time, cut costs, serve customers
            better, and scale. We build technology around how your business actually works.
          </p>

          <Button type="button" variant="brand" size="lg" onClick={openEnquiry}>
            {ENQUIRY_LABEL}
          </Button>
        </Container>
      </Section>

      <Section tone="canvas" pad="lg" aria-label="Industries We Serve" data-slot="page-cards">
        <Container>
          <ul className="grid list-none grid-cols-1 gap-[var(--space-5)] p-0 sm:grid-cols-2 lg:grid-cols-3">
            {industries.map((industry, index) => {
              const Icon = industry.icon
              return (
                <Reveal as="li" key={industry.title} delay={index * 40} className="flex">
                  <Card tone="surface" className="flex w-full flex-col">
                    <CardHeader>
                      <span
                        aria-hidden="true"
                        className="inline-flex size-[var(--space-7)] items-center justify-center rounded-md bg-tech-cyan/10 text-tech-cyan"
                      >
                        <Icon className="size-[var(--size-icon-md)]" />
                      </span>
                      <h3 className="font-semibold leading-tight tracking-[-0.01em] text-content text-[length:var(--text-body)]">
                        {industry.title}
                      </h3>
                      <CardDescription>{industry.desc}</CardDescription>
                    </CardHeader>
                  </Card>
                </Reveal>
              )
            })}
          </ul>
        </Container>
      </Section>

      <Section tone="deep" pad="lg" data-slot="page-cta">
        <Container>
          <SectionHeading
            level={2}
            title="Don't see your industry? Let's talk anyway."
            lede="We've built systems across very different sectors. If something in your operations is slow, manual, or scattered, there's a good chance we can fix it."
            action={
              <Button type="button" variant="brand" size="lg" onClick={openEnquiry}>
                {ENQUIRY_LABEL}
              </Button>
            }
          />
        </Container>
      </Section>
    </>
  )
}
