/**
 * Portfolio project data.
 *
 * Moved verbatim from `src/pages/PortfolioPage.tsx`. Order, copy, image
 * bindings, gradients, tags, tag colors, and external destinations are
 * unchanged; a missing `link` means the project has no navigable destination
 * and renders the "Coming Soon" treatment.
 *
 * Shape (see design.md → Data Models → Project):
 *   { name, description, image, gradient, tag, tagColor, link? }
 */
import scrapcoImg from '@/assets/portfolio/scrapco.png'
import gtcImg from '@/assets/portfolio/gtc.png'
import ezdryImg from '@/assets/portfolio/ezdry.png'
import foggImg from '@/assets/portfolio/fogg.png'
import gurtronImg from '@/assets/portfolio/gurtron.png'
import fleetImg from '@/assets/portfolio/fleet.png'
import restaurantImg from '@/assets/portfolio/restaurant.png'
import policylensImg from '@/assets/portfolio/policylens.png'
import schoolImg from '@/assets/portfolio/school.png'
import hotelImg from '@/assets/portfolio/hotel.png'

export const projects = [
  {
    name: 'Scrapco',
    description:
      'We built a smart scrap management app that makes doorstep scrap collection simple, fast, and hassle-free. It helps users schedule pickups, manage waste efficiently, and promote sustainable recycling — all through an easy-to-use digital platform designed by our software company.',
    image: scrapcoImg,
    gradient: 'linear-gradient(135deg, #1565C0 0%, #1976D2 45%, #2196F3 100%)',
    tag: 'Sustainability',
    tagColor: '#4CAF50',
    link: 'https://www.scrapco.app/',
  },
  {
    name: 'GTC',
    description:
      'We developed a smart GTC management platform that centralizes data from vendors, godowns, and operations into one dashboard. It enables real-time tracking, better decision-making, streamlined workflows, and efficient management — helping scrap businesses improve visibility, control, and overall operational performance.',
    image: gtcImg,
    gradient: 'linear-gradient(135deg, #4E342E 0%, #6D4C41 45%, #8D6E63 100%)',
    tag: 'Enterprise',
    tagColor: '#795548',
    link: 'https://www.scrapco.app/partner-portal',
  },
  {
    name: 'EzDry',
    description:
      'We built a smart laundry management app that makes doorstep pickup and laundry services seamless. Users can schedule pickups, track orders in real time, and enjoy hassle-free service — while businesses manage operations efficiently through one powerful, easy-to-use platform.',
    image: ezdryImg,
    gradient: 'linear-gradient(135deg, #0D47A1 0%, #1565C0 45%, #1976D2 100%)',
    tag: 'On-Demand',
    tagColor: '#2196F3',
    link: 'https://www.ezdry.in/',
  },
  {
    name: 'Fogg Road Safety And Alert System',
    description:
      'We developed an intelligent road safety system designed to reduce accidents in foggy conditions. It alerts nearby vehicles in low visibility and uses eye-tracking sensors to detect driver drowsiness, instantly warning the driver to stay awake and drive safely.',
    image: foggImg,
    gradient: 'linear-gradient(135deg, #1A237E 0%, #283593 45%, #3949AB 100%)',
    tag: 'Safety & IoT',
    tagColor: '#F44336',
    link: 'https://saferaahia.netlify.app/',
  },
  {
    name: 'GurTron',
    description:
      "We developed a smart school management platform where teachers can create papers, manage academic tasks, and track students' real-time performance. Schools get detailed analytics, progress reports, and insights to monitor learning outcomes and improve educational efficiency.",
    image: gurtronImg,
    gradient: 'linear-gradient(135deg, #BF360C 0%, #D84315 45%, #E64A19 100%)',
    tag: 'Education',
    tagColor: '#FF9800',
    link: 'https://app.gurtron.in',
  },
  {
    name: 'Fleet Management & Transportation at Ease',
    description:
      'We built an advanced fleet management platform that provides real-time vehicle tracking, fuel efficiency monitoring, zonal insights, driver performance, and operational analytics — all in one dashboard. It helps businesses optimize fleet operations, reduce costs, and improve overall efficiency.',
    image: fleetImg,
    gradient: 'linear-gradient(135deg, #004D40 0%, #00695C 45%, #00796B 100%)',
    tag: 'Logistics',
    tagColor: '#1976D2',
  },
  {
    name: 'Restaurant Management App',
    description:
      'We developed a smart food tokenization system where customers scan a QR code to order directly from their table. Orders are managed through live token numbers displayed on LED screens, enabling faster pickups, reducing confusion, and improving restaurant operations efficiently.',
    image: restaurantImg,
    gradient: 'linear-gradient(135deg, #4A148C 0%, #6A1B9A 45%, #7B1FA2 100%)',
    tag: 'Food & Hospitality',
    tagColor: '#9C27B0',
  },
  {
    name: 'PolicyLens',
    description:
      'We built PolicyLens, an insurance broker portal that brings clients, policies, renewals, premiums, claims, and commissions together in one clean dashboard. Its smart risk insights automatically flag coverage gaps — like underinsured clients, missing family coverage, or upcoming renewals — so brokers can spot service opportunities and support their customers proactively.',
    image: policylensImg,
    gradient: 'linear-gradient(135deg, #311B92 0%, #4527A0 45%, #5E35B1 100%)',
    tag: 'InsurTech',
    tagColor: '#673AB7',
    link: 'https://policy-lens-gilt.vercel.app/',
  },
  {
    name: 'School Management System',
    description:
      'We built a comprehensive school management platform that streamlines academics, administration, and communication in one place. It covers student enrollment, teacher management, timetables, attendance, fees, examinations, library, hostel, transport, and more — giving schools complete control over daily operations through an intuitive, role-based dashboard.',
    image: schoolImg,
    gradient: 'linear-gradient(135deg, #1B5E20 0%, #2E7D32 45%, #388E3C 100%)',
    tag: 'Education',
    tagColor: '#4CAF50',
    link: 'https://school-management-frontend-ten-sigma.vercel.app/#/dashboard',
  },
  {
    name: 'Hotel Room Management',
    description:
      'We developed a full-featured hotel management system built for front desk efficiency. It handles room bookings, guest check-in/check-out, billing, housekeeping, inventory, kitchen orders, and staff management — all in one real-time dashboard that helps hotels run smoother, reduce manual work, and deliver a better guest experience.',
    image: hotelImg,
    gradient: 'linear-gradient(135deg, #B71C1C 0%, #C62828 45%, #D32F2F 100%)',
    tag: 'Hospitality',
    tagColor: '#FF5722',
    link: 'https://hotel-desk.onrender.com/',
  },
]

export default projects
