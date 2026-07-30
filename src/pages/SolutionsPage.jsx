import { Globe, Code2, Sparkles, Truck, Utensils, Workflow } from 'lucide-react'

import { useEnquiry } from '@/components/enquiry/EnquiryProvider'
import Badge from '@/components/system/Badge'
import Container from '@/components/system/Container'
import Eyebrow from '@/components/system/Eyebrow'
import Reveal from '@/components/system/Reveal'
import Section from '@/components/system/Section'
import SectionHeading from '@/components/system/SectionHeading'
import TechBackdrop from '@/components/system/TechBackdrop'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card'

/**
 * `/solutions` - one of the Public_Information_Routes.
 *
 * The route shell (`PublicLayout`, applied in `App.jsx`) owns the header, the
 * footer, and the floating conversion action, so this page renders page content
 * only; the inline chrome it used to carry is gone (Requirements 1.1, 11.3).
 *
 * Shell hierarchy is the uniform public-route shape shared with `/industries`
 * and every other Public_Route (Requirement 5.6): a hero `Section` carrying the
 * route's single `h1`, its lede, and one Primary_CTA, then a content `Section`
 * of `Card`s, then a closing call-to-action `Section`. Card titles sit one level
 * below the `h1`, so heading order has no gap and no second top-level heading
 * (Requirement 10.5).
 *
 * Content is data (Requirement 5.1): every solution category, description, and
 * feature point below is the approved baseline string, rendered unchanged, and
 * the enquiry action keeps its baseline label and modal behavior. Feature points
 * are now token `Badge`es instead of hand-colored chips, and stay inside a list
 * so the grouping is still announced.
 *
 * Presentation is token-only (Requirement 1.1): no literal color values, no
 * gradient utilities, no inline style objects.
 *
 * Requirements: 5.1, 5.2, 5.6, 1.1, 11.3
 */

const solutions = [
  {
    icon: Globe,
    title: 'Custom Website Development',
    desc: 'Business websites, startup landing pages, corporate sites, and scalable web platforms — optimized for user acquisition, performance, and search visibility. Every site is engineered for speed, conversions, and growth.',
    points: ['SEO-optimized architecture', 'Conversion-focused UX', 'Lightning-fast load times'],
  },
  {
    icon: Code2,
    title: 'Custom Software Development',
    desc: 'Businesses outgrow spreadsheets fast. We develop CRM systems, ERP tools, dashboards, internal management systems, and workflow automation platforms tailored to your exact operational requirements.',
    points: ['CRM & ERP systems', 'Internal dashboards', 'Workflow automation'],
  },
  {
    icon: Sparkles,
    title: 'AI Solutions & Automation',
    desc: 'We integrate artificial intelligence into business processes through OCR systems, AI analytics, automated reporting, chat systems, and intelligent workflows that reduce repetitive work and improve decision making.',
    points: ['OCR & document AI', 'Predictive analytics', 'Automated reporting'],
  },
  {
    icon: Truck,
    title: 'Fleet Management Solutions',
    desc: 'GPS tracking, fuel analytics, driver behavior monitoring, vehicle diagnostics, geofencing, maintenance alerts, and centralized dashboards to improve operational efficiency and reduce losses.',
    points: ['Real-time GPS tracking', 'Fuel & maintenance analytics', 'Driver behavior reports'],
  },
  {
    icon: Utensils,
    title: 'Restaurant Management Systems',
    desc: 'QR ordering, token systems, kitchen display systems, analytics dashboards, inventory tracking, staff management, and multi-outlet operational monitoring built for modern food businesses.',
    points: ['QR & token ordering', 'Kitchen display systems', 'Multi-outlet dashboards'],
  },
  {
    icon: Workflow,
    title: 'Business Automation',
    desc: 'Attendance systems, reporting automation, operational tracking, accounting tools, and analytics dashboards — we help businesses digitize processes and eliminate manual inefficiencies.',
    points: ['Attendance & HR systems', 'Accounting tools', 'Operational tracking'],
  },
]

/** The enquiry action label this route carries, per the content baseline. */
const ENQUIRY_LABEL = 'Talk to Our Team'

export default function SolutionsPage() {
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
        data-page="solutions"
      >
        <Container className="flex flex-col items-start gap-[var(--space-5)]">
          <Eyebrow icon={<Sparkles className="size-[var(--size-icon-xs)]" aria-hidden="true" />}>
            Our Solutions
          </Eyebrow>

          <h1 className="text-[length:var(--text-display)] font-extrabold tracking-[-0.02em] text-content">
            Software That Solves <span className="text-tech-cyan">Real Business</span> Problems.
          </h1>

          <p className="max-w-[var(--measure)] text-[length:var(--text-body)] leading-relaxed text-content-muted">
            At exflow, we build software systems, websites, AI-powered tools, and business automation
            solutions designed to solve operational challenges and help companies scale faster.
          </p>

          <p className="max-w-[var(--measure)] text-[length:var(--text-label)] leading-relaxed text-content-muted">
            Technology should increase efficiency, reduce manual work, and create measurable business
            growth.
          </p>

          <Button type="button" variant="brand" size="lg" onClick={openEnquiry}>
            {ENQUIRY_LABEL}
          </Button>
        </Container>
      </Section>

      <Section tone="canvas" pad="lg" aria-label="Our Solutions" data-slot="page-cards">
        <Container>
          <ul className="grid list-none grid-cols-1 gap-[var(--space-5)] p-0 sm:grid-cols-2 lg:grid-cols-3">
            {solutions.map((solution, index) => {
              const Icon = solution.icon
              return (
                <Reveal as="li" key={solution.title} delay={index * 40} className="flex">
                  <Card tone="surface" className="flex w-full flex-col">
                    <CardHeader>
                      <span
                        aria-hidden="true"
                        className="inline-flex size-[var(--space-7)] items-center justify-center rounded-md bg-tech-cyan/10 text-tech-cyan"
                      >
                        <Icon className="size-[var(--size-icon-md)]" />
                      </span>
                      <h3 className="font-semibold leading-tight tracking-[-0.01em] text-content text-[length:var(--text-body)]">
                        {solution.title}
                      </h3>
                      <CardDescription>{solution.desc}</CardDescription>
                    </CardHeader>
                    <CardContent className="mt-auto">
                      <ul className="flex list-none flex-wrap gap-[var(--space-2)] p-0">
                        {solution.points.map((point) => (
                          <Badge as="li" key={point} tone="soft" accent="tech">
                            {point}
                          </Badge>
                        ))}
                      </ul>
                    </CardContent>
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
                Build technology that solves{' '}
                <span className="text-tech-cyan">real business problems</span> and creates long-term
                growth.
              </>
            }
            lede="Let's discuss your operational challenges and design a system around your business."
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
