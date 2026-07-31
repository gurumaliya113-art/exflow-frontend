import { BarChart3, Bot, LayoutDashboard, Smartphone, Sparkles, Workflow } from 'lucide-react'

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
 * Positioning: ExFlow is a technology partner, not a "development shop", so this
 * page is organised around business outcomes (automation, customer experience,
 * management, AI, intelligence) rather than a menu of technical services. Each
 * card leads with the problem it removes and the result it creates.
 *
 * The route shell (`PublicLayout`) owns the header, footer, and floating action;
 * this page renders content only. Shell hierarchy is the uniform public-route
 * shape shared with `/industries`: a hero `Section` with the single `h1`, a
 * content `Section` of `Card`s, then a closing call-to-action `Section`.
 * Presentation is token-only: no literal colours, gradients, or inline styles.
 *
 * Requirements: 5.1, 5.2, 5.6, 1.1, 11.3
 */

const solutions = [
  {
    icon: Workflow,
    title: 'Business Automation',
    desc: 'Eliminate the repetitive manual work that quietly eats hundreds of hours every month, so your team can focus on what actually moves the business forward.',
    points: ['Workflow Automation', 'Document Automation', 'Approval Systems'],
  },
  {
    icon: Smartphone,
    title: 'Customer Experience',
    desc: 'Give customers a faster, smoother experience across every touchpoint — website, booking, support — so more of them stay, trust you, and buy.',
    points: ['Websites & Web Apps', 'Mobile Apps', 'Booking & Customer Portals'],
  },
  {
    icon: LayoutDashboard,
    title: 'Business Management',
    desc: 'Run every part of your business from one place instead of scattered spreadsheets and chats — full visibility and control, from anywhere.',
    points: ['ERP & CRM', 'Inventory & Finance', 'HR & Fleet'],
  },
  {
    icon: Bot,
    title: 'AI Solutions',
    desc: 'Put AI to work so your business keeps responding, selling, and supporting customers around the clock — without hiring more people.',
    points: ['AI Customer Support', 'AI WhatsApp & Voice', 'AI Sales Assistant'],
  },
  {
    icon: BarChart3,
    title: 'Business Intelligence',
    desc: 'Turn the data you already have into clear, real-time answers, so you make better decisions faster and spot problems before they grow.',
    points: ['Live Dashboards', 'Reports & Analytics', 'Performance Tracking'],
  },
]

/** The enquiry action label this route carries. */
const ENQUIRY_LABEL = 'Talk to Our Team'

export default function SolutionsPage() {
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
            What We Do
          </Eyebrow>

          <h1 className="text-[length:var(--text-display)] font-extrabold tracking-[-0.02em] text-content">
            Technology That Solves <span className="text-tech-cyan">Real Business</span> Problems.
          </h1>

          <p className="max-w-[var(--measure)] text-[length:var(--text-body)] leading-relaxed text-content-muted">
            We don't sell software — we solve business problems. Every system we build is designed to
            save you time, reduce costs, and help you grow.
          </p>

          <p className="max-w-[var(--measure)] text-[length:var(--text-label)] leading-relaxed text-content-muted">
            Automation, AI, and management systems that make your business run better and give you
            room to scale.
          </p>

          <Button type="button" variant="brand" size="lg" onClick={openEnquiry}>
            {ENQUIRY_LABEL}
          </Button>
        </Container>
      </Section>

      <Section tone="canvas" pad="lg" aria-label="What We Do" data-slot="page-cards">
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
            title="Ready to save time, cut costs, and grow faster?"
            lede="Tell us the problem slowing your business down — we'll design the system that fixes it."
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
