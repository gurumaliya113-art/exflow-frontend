/**
 * Site-wide navigation, contact, and footer configuration.
 *
 * Every destination here is captured verbatim from the pre-redesign source so
 * the redesign cannot silently change where anything points (Requirement 11.6).
 */

/**
 * Public navigation (six Public_Routes).
 * Labels and destinations match the canonical public header.
 */
export const PUBLIC_NAV = [
  { id: 'work', to: '/portfolio', label: 'Our Work' },
  { id: 'solutions', to: '/solutions', label: 'Solutions' },
  { id: 'industries', to: '/industries', label: 'Industries' },
  { id: 'about', to: '/about', label: 'About' },
  { id: 'blogs', to: '/blogs', label: 'Blogs' },
  { id: 'contact', to: '/contact', label: 'Contact' },
]

/**
 * Legacy navigation, preserved verbatim from `components/Navbar.jsx`.
 *
 * The labels deliberately do NOT match their paths ("Solutions" → `/partner`,
 * "Industries" → `/partner-benefits`, "About" → `/work-benefits`, and both
 * "Blogs" and "Contact" → `/enquire`). Requirement 11.6 requires the baseline
 * destinations, so this mismatch must be preserved, not corrected.
 */
export const LEGACY_NAV = [
  { id: 'l-work', to: '/#work', label: 'Our Work', hashScroll: 'work' },
  { id: 'l-solutions', to: '/partner', label: 'Solutions' },
  { id: 'l-industries', to: '/partner-benefits', label: 'Industries' },
  { id: 'l-about', to: '/work-benefits', label: 'About' },
  { id: 'l-blogs', to: '/enquire', label: 'Blogs' },
  { id: 'l-contact', to: '/enquire', label: 'Contact' },
]

/**
 * Contact values, verbatim from `components/PublicFooter.jsx`.
 * `href` values are the typed destinations Requirement 2.8 must keep unchanged.
 */
export const CONTACT = {
  phone: { label: '+91 80533 1748', href: 'tel:+91805331748' },
  email: {
    label: 'azadgupta1010@gmail.com',
    href: 'mailto:azadgupta1010@gmail.com',
  },
  office: { label: 'Office', address: 'Narnaul' },
}

/** Footer brand blurb and conversion CTA label, verbatim from PublicFooter. */
export const FOOTER_BRAND = {
  name: 'exflow',
  blurb: 'Building technology that powers modern businesses.',
  ctaLabel: 'Book A Call',
}

/** Five solution links; every one navigates to `/solutions` today. */
export const FOOTER_SOLUTION_LINKS = [
  { label: 'Custom Software', to: '/solutions' },
  { label: 'Website Development', to: '/solutions' },
  { label: 'AI & Automation', to: '/solutions' },
  { label: 'Fleet Management', to: '/solutions' },
  { label: 'Restaurant Systems', to: '/solutions' },
]

/** Six quick links with their current destinations. */
export const FOOTER_QUICK_LINKS = [
  { label: 'Home', to: '/' },
  { label: 'Our Work', to: '/portfolio' },
  { label: 'Industries', to: '/industries' },
  { label: 'About', to: '/about' },
  { label: 'Blogs', to: '/blogs' },
  { label: 'Contact', to: '/contact' },
]

/** Column headings, verbatim from PublicFooter. */
export const FOOTER_HEADINGS = {
  solutions: 'Solutions',
  quickLinks: 'Quick Links',
  office: 'Office',
  phone: 'Call Us',
  email: 'Email',
}

/** Legal placeholders; both are `#` in the current footer and stay unchanged. */
export const FOOTER_LEGAL_LINKS = [
  { label: 'Privacy Policy', href: '#' },
  { label: 'Terms of Service', href: '#' },
]

/** Rights statement suffix; rendered as `© {currentYear} exflow. All rights reserved.` */
export const FOOTER_RIGHTS = 'exflow. All rights reserved.'

/**
 * Parent company. ExFlow is the technology business under ExCompany, so the
 * footer carries a quiet link back to the holding company — the same way the
 * ExCompany site links out to ExFlow. Update `href` when the ExCompany domain
 * is finalised.
 */
export const PARENT_COMPANY = {
  label: 'Part of ExCompany',
  href: 'https://excompany.in',
}
