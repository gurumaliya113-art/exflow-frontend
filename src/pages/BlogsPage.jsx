import {
  ArrowRight,
  BookOpen,
  Code2,
  Globe,
  Rocket,
  Sparkles,
  TrendingUp,
  Truck,
  Utensils,
  Workflow,
} from 'lucide-react'

import Badge from '@/components/system/Badge'
import Container from '@/components/system/Container'
import Eyebrow from '@/components/system/Eyebrow'
import Section from '@/components/system/Section'
import SectionHeading from '@/components/system/SectionHeading'
import TechBackdrop from '@/components/system/TechBackdrop'
import { useEnquiry } from '@/components/enquiry/EnquiryProvider'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

/**
 * `/blogs` - one of the uniform Public_Route pages.
 *
 * The route shell (`PublicLayout`, applied in `App.jsx`) owns the header, the
 * footer, and the floating conversion action, so this page renders page content
 * only; the inline chrome it used to carry is gone (Requirement 11.3).
 *
 * Content is preserved verbatim from the approved baseline (Requirement 5.4):
 * all eight topic previews from the unchanged `topics` array, each with its
 * category label and reading-time label, the coming-soon status on every card
 * plus the "Coming Soon" band kicker and the "Articles publishing soon."
 * note, and the closing contact action with its baseline label ("Get In Touch")
 * and modal behavior. The coming-soon status is now always rendered rather than
 * revealed on hover, so it is available without pointer interaction.
 *
 * Shell order matches every other public route (Requirement 5.6): hero band with
 * the route's single `h1`, then a content band of a card grid, then the closing
 * call-to-action band. Topic titles sit one level below the band heading, so the
 * heading outline has no gap and exactly one top-level heading (Requirement
 * 10.5).
 *
 * Presentation is token-only (Requirement 1.1): no literal color values. Category
 * and reading-time chips are token `Badge`s on the cyan tech accent; the orange
 * Brand_Accent appears only on the conversion button (Requirement 1.3).
 *
 * Requirements: 5.4, 5.6, 1.1, 11.3
 */

/** Shared icon-tile treatment for every topic card. */
const ICON_TILE =
  'inline-flex h-[var(--space-7)] w-[var(--space-7)] shrink-0 items-center justify-center rounded-sm bg-tech-cyan/10 text-tech-cyan'

/** Card heading role: one step below a band heading, matching the card title. */
const CARD_TITLE =
  'text-[length:var(--text-body)] font-semibold leading-snug tracking-[-0.01em] text-content'

const topics = [
  { icon: Sparkles, title: 'How AI is Changing Business Operations', tag: 'AI & Automation', read: '6 min read' },
  { icon: Code2, title: 'Why Custom Software Outperforms Generic Solutions', tag: 'Software', read: '5 min read' },
  { icon: Workflow, title: 'The Future of Business Automation', tag: 'Automation', read: '7 min read' },
  { icon: Truck, title: 'How Fleet Analytics Reduce Fuel Losses', tag: 'Fleet Tech', read: '5 min read' },
  { icon: Utensils, title: 'Why Restaurants Need Digital Ordering Systems', tag: 'Restaurant Tech', read: '4 min read' },
  { icon: Rocket, title: 'Building Scalable MVPs for Startups', tag: 'Startups', read: '6 min read' },
  { icon: TrendingUp, title: 'Software Trends Businesses Should Watch', tag: 'Trends', read: '5 min read' },
  { icon: Globe, title: 'Digital Transformation Strategies for Growing Companies', tag: 'Strategy', read: '8 min read' },
]

export default function BlogsPage() {
  // Single enquiry activation surface (Requirement 6.10).
  const { openEnquiry } = useEnquiry()

  return (
    <>
      <Section
        tone="surface"
        pad="lg"
        backdrop={<TechBackdrop variant="mesh" intensity="subtle" />}
        data-slot="blogs-hero"
      >
        <Container
          width="narrow"
          className="flex flex-col items-center gap-[var(--space-5)] text-center"
        >
          <Eyebrow icon={<BookOpen className="h-[var(--size-icon-xs)] w-[var(--size-icon-xs)]" />}>
            Blog &amp; Insights
          </Eyebrow>
          <h1 className="text-[length:var(--text-display)] font-extrabold tracking-[-0.02em] text-content">
            Ideas, Trends &amp; <span className="text-tech-cyan">Practical Insights.</span>
          </h1>
          <p className="max-w-[var(--measure)] text-[length:var(--text-body)] leading-relaxed text-content-muted">
            Our blog covers software development, AI, automation, business growth, fleet technology,
            restaurant systems, and digital transformation.
          </p>
        </Container>
      </Section>

      <Section tone="canvas" pad="lg" data-slot="blogs-topics">
        <Container className="flex flex-col gap-[var(--space-7)]">
          <div className="flex flex-col gap-[var(--space-4)] md:flex-row md:items-end md:justify-between">
            <SectionHeading
              level={2}
              eyebrow="Coming Soon"
              title="Topics We're Writing About"
            />
            <p className="text-[length:var(--text-label)] italic text-content-muted">
              Articles publishing soon. Stay tuned.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-[var(--space-5)] md:grid-cols-2 lg:grid-cols-4">
            {topics.map((topic) => {
              const Icon = topic.icon
              return (
                <Card key={topic.title} tone="raised" interactive data-slot="blogs-topic">
                  <CardHeader>
                    <div className="flex items-center justify-between gap-[var(--space-3)]">
                      <span className={ICON_TILE}>
                        <Icon
                          aria-hidden="true"
                          className="h-[var(--size-icon-md)] w-[var(--size-icon-md)]"
                        />
                      </span>
                      <Badge accent="tech" tone="soft" data-slot="blogs-topic-category">
                        {topic.tag}
                      </Badge>
                    </div>
                    <h3 className={CARD_TITLE}>{topic.title}</h3>
                  </CardHeader>
                  <CardContent className="flex flex-wrap items-center gap-[var(--space-2)]">
                    <Badge accent="tech" tone="outline" data-slot="blogs-topic-read">
                      {topic.read}
                    </Badge>
                    <Badge tone="muted" data-slot="blogs-topic-status">
                      Coming soon →
                    </Badge>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </Container>
      </Section>

      <Section
        tone="surface"
        pad="lg"
        backdrop={<TechBackdrop variant="grid" intensity="subtle" />}
        data-slot="blogs-cta"
      >
        <Container width="prose">
          <SectionHeading
            level={2}
            align="center"
            title="Want these in your inbox?"
            lede="We'll let you know when we publish. No spam. Just useful insights."
            className="items-center"
            action={
              <Button
                type="button"
                variant="brand"
                size="lg"
                onClick={openEnquiry}
                data-slot="blogs-contact-cta"
              >
                Get In Touch
                <ArrowRight aria-hidden="true" />
              </Button>
            }
          />
        </Container>
      </Section>
    </>
  )
}
