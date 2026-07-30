import { Mail, MapPin, Phone, Send } from 'lucide-react'
import { GiOwl } from 'react-icons/gi'

import Eyebrow from '@/components/system/Eyebrow'
import Modal from '@/components/system/Modal'
import { CONTACT } from '@/content/site'
import { cn } from '@/lib/utils'

import EnquiryFormFields from './EnquiryFormFields'
import { useEnquiry } from './EnquiryProvider'

/**
 * `EnquiryModal` - the one Enquiry_Modal, mounted once from `EnquiryProvider`.
 *
 * Composition, not new mechanics: the dialog role, the three close
 * affordances, the focus trap, and the scroll lock all live in the `Modal`
 * shell, and the fields, validation, and submission lifecycle all live in
 * `EnquiryFormFields`. This component only supplies what is specific to the
 * enquiry dialog:
 *
 * - Two columns (Requirement 7.7): the EXFLOW telephone, email, and office
 *   details on the left, the Project_Enquiry_Form on the right. Contact values
 *   come from `content/site.js`, so the modal, the footer, and `/contact` cannot
 *   drift apart, and the typed destinations stay unchanged (Requirement 11.6).
 * - The dialog name: `labelledBy` points at the panel's own `h2`, so the
 *   accessible name is the visible title (Requirement 10.9). The lede is wired
 *   as the description.
 * - Closing on success: `onSubmitted` is `closeEnquiry`, so an accepted
 *   submission dismisses the dialog while the standalone `/enquire` page, which
 *   renders the same fields without this callback, stays open
 *   (Requirements 7.11, 7.13).
 *
 * Open state comes from `useEnquiry()`, so both activation paths - the context
 * API and the legacy `open-enquire` window event the provider bridges - land
 * here and exactly one dialog opens per activation (Requirement 7.1). `open`
 * and `onClose` may also be passed explicitly, which is what keeps the
 * component renderable in isolation.
 *
 * Escape, the close control, and an activation on the backdrop outside the
 * panel all route through `onClose`, so all three close the dialog and release
 * the scroll lock through the same path (Requirement 7.5). Focus restoration is
 * the shell's: `useFocusTrap` records the element focused at activation and
 * refocuses it on deactivation, which is the same element the provider records
 * in `openerRef`, so the opener regains focus on every close path
 * (Requirement 7.6).
 *
 * While closed nothing is rendered: the shell returns null, so the form is
 * unmounted and each open starts from empty fields.
 *
 * Requirements: 7.1, 7.5, 7.6, 7.7, 7.11, 10.9
 */

/** Ids wired into the dialog's name and description. */
export const ENQUIRY_MODAL_IDS = {
  title: 'enquiry-modal-title',
  description: 'enquiry-modal-description',
}

/** Modal copy, carried over from the pre-redesign enquiry modal. */
export const ENQUIRY_MODAL_COPY = {
  title: "Let's build something great together.",
  lede: "Drop us your details and we'll get back within 24 hours with a plan, timeline, and transparent pricing.",
  eyebrow: 'Enquire For Work',
  formTitle: 'Request A Quote',
  formLede: 'Tell us about your project.',
  closeLabel: 'Close',
  contactLabels: {
    phone: 'Call Us',
    email: 'Email',
    office: 'Office',
  },
}

const iconClass = 'size-[var(--size-icon-sm)]'

const contactLinkClass = cn(
  'break-words font-semibold text-content transition-colors',
  'text-[length:var(--text-body)]',
  'hover:text-tech-cyan focus-visible:text-tech-cyan',
)

/** One contact row: decorative glyph, meta label, then the value. */
function ContactDetail({ icon, label, children }) {
  return (
    <div className="flex items-start gap-[var(--space-3)]">
      <span
        aria-hidden="true"
        className={cn(
          'flex size-[var(--space-7)] shrink-0 items-center justify-center',
          'rounded-[var(--radius-pill)] border-[length:var(--border-1)] border-line',
          'bg-surface-high text-tech-cyan',
        )}
      >
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-[length:var(--text-meta)] font-medium uppercase tracking-[0.08em] text-content-muted">
          {label}
        </p>
        {children}
      </div>
    </div>
  )
}

/**
 * @param {object} props
 * @param {boolean} [props.open] Overrides the provider's open state.
 * @param {() => void} [props.onClose] Overrides the provider's close action.
 */
export function EnquiryModal({ open: openProp, onClose, className, ...rest }) {
  const { open: openFromContext, closeEnquiry } = useEnquiry()
  const open = openProp ?? openFromContext
  const close = onClose ?? closeEnquiry

  return (
    <Modal
      open={open}
      onClose={close}
      labelledBy={ENQUIRY_MODAL_IDS.title}
      describedBy={ENQUIRY_MODAL_IDS.description}
      closeLabel={ENQUIRY_MODAL_COPY.closeLabel}
      panelClassName={cn('overflow-hidden', className)}
      data-slot="enquiry-modal"
      {...rest}
    >
      <div className="grid grid-cols-1 md:grid-cols-2">
        {/* Contact details */}
        <div
          data-slot="enquiry-modal-contact"
          className="flex flex-col gap-[var(--space-6)] bg-surface-high p-[var(--space-6)] md:p-[var(--space-7)]"
        >
          <div className="flex items-center gap-[var(--space-3)]">
            <GiOwl
              aria-hidden="true"
              focusable="false"
              className="size-[var(--size-icon-lg)] text-tech-cyan"
            />
            <span className="font-bold text-content text-[length:var(--text-heading)]">
              exflow
            </span>
          </div>

          <div className="flex flex-col gap-[var(--space-3)]">
            <h2
              id={ENQUIRY_MODAL_IDS.title}
              className="font-extrabold tracking-[-0.01em] text-content text-[length:var(--text-heading)]"
            >
              {ENQUIRY_MODAL_COPY.title}
            </h2>
            <p
              id={ENQUIRY_MODAL_IDS.description}
              className="max-w-[var(--measure)] text-content-muted text-[length:var(--text-body)]"
            >
              {ENQUIRY_MODAL_COPY.lede}
            </p>
          </div>

          <div className="flex flex-col gap-[var(--space-5)]">
            <ContactDetail
              icon={<Phone className={iconClass} />}
              label={ENQUIRY_MODAL_COPY.contactLabels.phone}
            >
              <a href={CONTACT.phone.href} className={contactLinkClass}>
                {CONTACT.phone.label}
              </a>
            </ContactDetail>

            <ContactDetail
              icon={<Mail className={iconClass} />}
              label={ENQUIRY_MODAL_COPY.contactLabels.email}
            >
              <a href={CONTACT.email.href} className={contactLinkClass}>
                {CONTACT.email.label}
              </a>
            </ContactDetail>

            <ContactDetail
              icon={<MapPin className={iconClass} />}
              label={ENQUIRY_MODAL_COPY.contactLabels.office}
            >
              <p className="font-semibold text-content text-[length:var(--text-body)]">
                {CONTACT.office.address}
              </p>
            </ContactDetail>
          </div>
        </div>

        {/* Project enquiry form */}
        <div
          data-slot="enquiry-modal-form"
          className="flex flex-col gap-[var(--space-5)] bg-surface p-[var(--space-6)] md:p-[var(--space-7)]"
        >
          <div className="flex flex-col gap-[var(--space-2)] pr-[var(--space-7)]">
            <Eyebrow icon={<Send className={iconClass} />}>
              {ENQUIRY_MODAL_COPY.eyebrow}
            </Eyebrow>
            <h3 className="font-bold text-content text-[length:var(--text-heading)]">
              {ENQUIRY_MODAL_COPY.formTitle}
            </h3>
            <p className="text-content-muted text-[length:var(--text-label)]">
              {ENQUIRY_MODAL_COPY.formLede}
            </p>
          </div>

          <EnquiryFormFields idPrefix="enquiry-modal" onSubmitted={close} />
        </div>
      </div>
    </Modal>
  )
}

export default EnquiryModal
