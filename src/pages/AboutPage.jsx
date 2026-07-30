import {
  BarChart3,
  Rocket,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  Zap,
  ArrowRight,
} from 'lucide-react'

import Container from '@/components/system/Container'
import Eyebrow from '@/components/system/Eyebrow'
import Section from '@/components/system/Section'
import SectionHeading from '@/components/system/SectionHeading'
import TechBackdrop from '@/components/system/TechBackdrop'
import { useEnquiry } from '@/components/enquiry/EnquiryProvider'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { cn } from '@/lib/utils'

/**
 * `/about` - one of the uniform Public_Route pages.
 *
 * The route shell (`PublicLayout`, applied in `App.jsx`) owns the header, the
 * footer, and the floating conversion action, so this page renders page content
 * only; the inline chrome it used to carry is gone (Requirement 11.3).
 *
 * Content is preserved verbatim from the approved baseline (Requirement 5.3):
 * the philosophy statement and its two supporting paragraphs, the four customer
 * groups, all five principles with their descriptions, all four founders with
 * their avatar initials and shared role, and the closing enquiry action with its
 * baseline label ("Start a Conversation") and modal behavior. The `beliefs` and
 * `founders` arrays below are unchanged data; only their wrappers changed.
 *
 * Shell order matches every other public route (Requirement 5.6): hero band with
 * the route's single `h1`, then content bands of card grids, then the closing
 * call-to-action band. Card titles sit one level below each band heading, so the
 * heading outline has no gap and exactly one top-level heading (Requirement
 * 10.5).
 *
 * Presentation is token-only (Requirement 1.1): no literal color values. Accent
 * emphasis uses the cyan/blue tech roles; the orange Brand_Accent appears only
 * on the conversion button (Requirement 1.3).
 *
 * Requirements: 5.3, 5.6, 1.1, 11.3
 */

/** Shared icon-tile treatment for every principle card. */
const ICON_TILE =
  'inline-flex h-[var(--space-7)] w-[var(--space-7)] shrink-0 items-center justify-center rounded-sm bg-tech-cyan/10 text-tech-cyan'

/** Card heading role: one step below a band heading, matching the card title. */
const CARD_TITLE =
  'text-[length:var(--text-body)] font-semibold leading-tight tracking-[-0.01em] text-content'

const beliefs = [
  { icon: Target, title: 'Build For Impact', desc: 'Every system we engineer is built to create measurable outcomes.' },
  { icon: Zap, title: 'Solve Operational Problems', desc: 'We focus on real workflows — not surface-level features.' },
  { icon: TrendingUp, title: 'Create Scalable Systems', desc: 'Software that grows with your business, not against it.' },
  { icon: BarChart3, title: 'Measurable Business Outcomes', desc: 'Data-driven design. Results you can actually track.' },
  { icon: Rocket, title: 'Engineer For Growth', desc: 'Products designed from day one to handle scale.' },
]

const founders = [
  { name: 'Azad Gupta', role: 'Co-Founder' },
  { name: 'Mukul Saini', role: 'Co-Founder' },
  { name: 'Amit', role: 'Co-Founder' },
  { name: 'Anubhav', role: 'Co-Founder' },
]

/** The customer groups, kept with their baseline arrow prefix. */
const audiences = [
  'Startups looking for speed',
  'Local businesses going digital',
  'Enterprises modernizing operations',
  'Industry operators creating sustainable growth',
]

export default function AboutPage() {
  // Single enquiry activation surface (Requirement 6.10).
  const { openEnquiry } = useEnquiry()

  return (
    <>
      <Section
        tone="surface"
        pad="lg"
        backdrop={<TechBackdrop variant="mesh" intensity="subtle" />}
        data-slot="about-hero"
      >
        <Container
          width="narrow"
          className="flex flex-col items-center gap-[var(--space-5)] text-center"
        >
          <Eyebrow icon={<Sparkles className="h-[var(--size-icon-xs)] w-[var(--size-icon-xs)]" />}>
            About exflow
          </Eyebrow>
          <h1 className="text-[length:var(--text-display)] font-extrabold tracking-[-0.02em] text-content">
            Engineered Digital Solutions for <span className="text-tech-cyan">Real Businesses.</span>
          </h1>
          <p className="max-w-[var(--measure)] text-[length:var(--text-body)] leading-relaxed text-content-muted">
            exflow is a software development and digital solutions company focused on building
            systems that help businesses automate operations, improve efficiency, and scale
            sustainably.
          </p>
        </Container>
      </Section>

      <Section tone="canvas" pad="lg" data-slot="about-philosophy">
        <Container className="grid items-start gap-[var(--space-7)] md:grid-cols-2">
          <div className="flex flex-col gap-[var(--space-4)]">
            <SectionHeading
              level={2}
              eyebrow="Our Philosophy"
              title={
                <>
                  Technology should <span className="text-tech-cyan">simplify</span> business
                  operations, not complicate them.
                </>
              }
            />
            <p className="max-w-[var(--measure)] text-[length:var(--text-body)] leading-relaxed text-content-muted">
              The modern business environment demands speed, automation, and better decision
              making. Companies relying on outdated workflows often face inefficiencies,
              operational losses, and limited scalability.
            </p>
            <p className="max-w-[var(--measure)] text-[length:var(--text-body)] leading-relaxed text-content-muted">
              exflow exists to solve those challenges through engineered digital solutions.
            </p>
          </div>

          <Card tone="raised" data-slot="about-audiences">
            <CardHeader>
              <h3 className={cn(CARD_TITLE, 'flex items-center gap-[var(--space-2)]')}>
                <Users
                  aria-hidden="true"
                  className="h-[var(--size-icon-sm)] w-[var(--size-icon-sm)] text-tech-cyan"
                />
                Who We Work With
              </h3>
            </CardHeader>
            <CardContent>
              <ul className="flex flex-col gap-[var(--space-3)] text-[length:var(--text-body)] text-content-muted">
                {audiences.map((audience) => (
                  <li key={audience} className="flex items-start gap-[var(--space-2)]">
                    <span aria-hidden="true" className="font-bold text-tech-cyan">
                      →
                    </span>
                    {audience}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </Container>
      </Section>

      <Section tone="surface" pad="lg" data-slot="about-beliefs">
        <Container className="flex flex-col gap-[var(--space-7)]">
          <SectionHeading
            level={2}
            align="center"
            eyebrow="What We Believe"
            title="Principles That Guide Every System We Build"
            className="items-center"
          />
          <div className="grid grid-cols-1 gap-[var(--space-5)] sm:grid-cols-2 lg:grid-cols-5">
            {beliefs.map((belief) => {
              const Icon = belief.icon
              return (
                <Card key={belief.title} tone="raised" interactive data-slot="about-belief">
                  <CardHeader>
                    <span className={ICON_TILE}>
                      <Icon
                        aria-hidden="true"
                        className="h-[var(--size-icon-md)] w-[var(--size-icon-md)]"
                      />
                    </span>
                    <h3 className={CARD_TITLE}>{belief.title}</h3>
                  </CardHeader>
                  <CardContent>
                    <p className="text-[length:var(--text-label)] leading-relaxed text-content-muted">
                      {belief.desc}
                    </p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </Container>
      </Section>

      <Section tone="canvas" pad="lg" data-slot="about-founders">
        <Container className="flex flex-col gap-[var(--space-7)]">
          <SectionHeading
            level={2}
            align="center"
            eyebrow="Co-Founded By"
            title="Builders Solving Real-World Problems Through Technology"
            lede="Founded by engineers who believe great software comes from understanding businesses, not just writing code."
            className="items-center"
          />
          <div className="grid grid-cols-2 gap-[var(--space-5)] md:grid-cols-4">
            {founders.map((founder) => (
              <Card key={founder.name} tone="surface" data-slot="about-founder">
                <CardHeader className="items-center text-center">
                  <span className="mx-auto inline-flex h-[var(--space-8)] w-[var(--space-8)] items-center justify-center rounded-pill bg-tech-blue/15 text-[length:var(--text-heading)] font-extrabold text-tech-cyan">
                    {founder.name.charAt(0)}
                  </span>
                  <h3 className={CARD_TITLE}>{founder.name}</h3>
                  <p className="text-[length:var(--text-label)] font-semibold text-tech-cyan">
                    {founder.role}
                  </p>
                </CardHeader>
              </Card>
            ))}
          </div>
        </Container>
      </Section>

      <Section
        tone="surface"
        pad="lg"
        backdrop={<TechBackdrop variant="grid" intensity="subtle" />}
        data-slot="about-cta"
      >
        <Container width="prose">
          <SectionHeading
            level={2}
            align="center"
            title={
              <>
                Ready to build something that{' '}
                <span className="text-tech-cyan">actually works?</span>
              </>
            }
            className="items-center"
            action={
              <Button
                type="button"
                variant="brand"
                size="lg"
                onClick={openEnquiry}
                data-slot="about-enquiry-cta"
              >
                Start a Conversation
                <ArrowRight aria-hidden="true" />
              </Button>
            }
          />
        </Container>
      </Section>
    </>
  )
}
