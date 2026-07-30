import {
  Truck,
  Utensils,
  Recycle,
  ShoppingBag,
  Rocket,
  Building2,
  HeartPulse,
  Factory,
  Briefcase,
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
 * The route shell (`PublicLayout`, applied in `App.jsx`) owns the header, the
 * footer, and the floating conversion action, so this page renders page content
 * only; the inline chrome it used to carry is gone (Requirements 1.1, 11.3).
 *
 * Shell hierarchy is the same uniform public-route shape as `/solutions`
 * (Requirement 5.6): a hero `Section` carrying the route's single `h1`, its
 * lede, and one Primary_CTA, then a content `Section` of `Card`s, then a closing
 * call-to-action `Section`. Card titles sit one level below the `h1`, so heading
 * order has no gap and no second top-level heading (Requirement 10.5).
 *
 * Content is data (Requirement 5.2): every industry category and description
 * below is the approved baseline string, rendered unchanged, and the enquiry
 * action keeps its baseline label and modal behavior. The per-industry gradient
 * that used to tint each card is gone: card and icon treatment now comes from
 * the token layer, identical for every industry (Requirement 1.1).
 *
 * Requirements: 5.1, 5.2, 5.6, 1.1, 11.3
 */

const industries = [
  {
    icon: Truck,
    title: 'Logistics & Transportation',
    desc: 'Fleet monitoring systems, GPS tracking, fuel management, maintenance analytics, and operational dashboards.',
  },
  {
    icon: Utensils,
    title: 'Restaurants & Food Businesses',
    desc: 'Ordering systems, kitchen workflows, token management, analytics, remote monitoring, and customer experience optimization.',
  },
  {
    icon: Recycle,
    title: 'Scrap & Recycling Industry',
    desc: 'Digital systems for scrap collection networks, supplier management, aggregation operations, inventory tracking, and marketplace solutions.',
  },
  {
    icon: ShoppingBag,
    title: 'Retail Businesses',
    desc: 'Billing systems, inventory management, customer analytics, and operational automation.',
  },
  {
    icon: Rocket,
    title: 'Startups',
    desc: 'Rapid MVP development, scalable web platforms, and technology solutions designed to accelerate growth.',
  },
  {
    icon: Building2,
    title: 'Enterprises',
    desc: 'Custom internal software, dashboards, workflow automation, and large-scale digital transformation solutions.',
  },
  {
    icon: HeartPulse,
    title: 'Healthcare',
    desc: 'Operational systems, workflow management, automation tools, and analytics.',
  },
  {
    icon: Factory,
    title: 'Manufacturing',
    desc: 'Production tracking, reporting systems, inventory management, and efficiency monitoring.',
  },
]

/** The enquiry action label this route carries, per the content baseline. */
const ENQUIRY_LABEL = 'Discuss Your Project'

export default function IndustriesPage() {
  // Single enquiry activation surface (Requirement 7.1). Outside a provider the
  // hook still reaches the mounted modal through its window bridge.
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
            Industry-Specific Software,{' '}
            <span className="text-tech-cyan">Not Generic Templates.</span>
          </h1>

          <p className="max-w-[var(--measure)] text-[length:var(--text-body)] leading-relaxed text-content-muted">
            exflow develops solutions designed around operational realities — not cookie-cutter
            products. Every system we build understands the specific workflows of your industry.
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
            title={
              <>
                Don't see your industry?{' '}
                <span className="text-tech-cyan">Talk to us anyway.</span>
              </>
            }
            lede="We've built systems across many sectors. If you have an operational challenge, chances are we can solve it."
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
