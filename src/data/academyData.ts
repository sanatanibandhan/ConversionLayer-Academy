export interface Course {
  id: string;
  title: string;
  badge: string;
  price: number;
  description: string;
  duration: string;
  bullets: string[];
  tagColor: string;
  popular?: boolean;
}

export interface Service {
  id: string;
  title: string;
  tier: string;
  price: number;
  turnaround: string;
  description: string;
  deliverables: string[];
  recommended?: boolean;
}

export const COURSES_DATA: Course[] = [
  {
    id: 'meta-capi-blueprint',
    title: 'Meta CAPI Blueprint',
    badge: 'Flagship Masterclass',
    price: 99,
    description: 'Master enterprise-grade Meta Conversions API implementation with Stape.io & Google Cloud Run.',
    duration: '6.5 Hours • 18 Modules',
    bullets: [
      'Server-Side GTM & Stape.io / AWS cloud container deployment',
      'Event Deduplication & Event Match Quality (EMQ 9.0+) optimization',
      'iOS 14.5+ & Safari ITP cookie lifetime recovery techniques'
    ],
    tagColor: 'indigo',
    popular: true
  },
  {
    id: 'ga4-ecommerce-protocol',
    title: 'GA4 E-Commerce Protocol',
    badge: 'Analytics Architecture',
    price: 99,
    description: 'Architect bulletproof dataLayer schemas and real-time BigQuery streaming for modern e-commerce.',
    duration: '5 Hours • 14 Modules',
    bullets: [
      'Custom DataLayer pushes for Shopify, WooCommerce & headless carts',
      'BigQuery automated raw export schema modeling & attribution',
      'Google Consent Mode v2 strict & advanced parameter validation'
    ],
    tagColor: 'emerald'
  },
  {
    id: 'gtm-serverside-mastery',
    title: 'GTM Server-Side Mastery',
    badge: 'Infrastructure & DevOps',
    price: 99,
    description: 'Transform client-side tracking bloat into lean, high-velocity first-party proxy servers.',
    duration: '8 Hours • 22 Modules',
    bullets: [
      'Custom sub-domain first-party proxy routing (ssgtm.domain.com)',
      'Multi-platform server pipeline (Meta, TikTok, Google & Pinterest)',
      'Client-side tag pruning resulting in sub-second page performance'
    ],
    tagColor: 'cyan'
  }
];

export const SERVICES_DATA: Service[] = [
  {
    id: 'full-tracking-audit',
    title: 'Full Tracking Audit',
    tier: 'Diagnostic Protocol',
    price: 150,
    turnaround: '2-3 Business Days',
    description: 'Comprehensive signal leakage audit identifying broken pixels, unhashed parameters, and missing revenue signals.',
    deliverables: [
      'Comprehensive 25-point signal leakage audit across all pixels',
      'DataLayer & client-side trigger inspection report with fix checklist',
      'Consent Mode v2 & Safari ITP browser cookie vulnerability analysis',
      '20-minute private Loom video walkthrough with actionable remediation steps'
    ]
  },
  {
    id: 'capi-server-setup',
    title: 'CAPI + Server Setup',
    tier: 'Full Implementation',
    price: 395,
    turnaround: '3-5 Business Days',
    recommended: true,
    description: 'End-to-end server-side tracking architecture built to maximize Meta EMQ and eliminate ad spend waste.',
    deliverables: [
      'Dedicated Server-Side GTM container deployment (Stape or GCP Cloud Run)',
      'Meta Conversions API (CAPI) with guaranteed 100% event deduplication',
      'Custom first-party tracking subdomain setup (e.g., ssgtm.yourdomain.com)',
      'GA4 Enhanced E-commerce & Google Ads Enhanced Conversions integration'
    ]
  },
  {
    id: 'custom-event-trigger-logic',
    title: 'Custom Event Trigger Logic',
    tier: 'Advanced Architecture',
    price: 250,
    turnaround: '2-4 Business Days',
    description: 'Surgical JavaScript event listeners and custom parameters for multi-step funnels and high-ticket checkouts.',
    deliverables: [
      'Custom JavaScript triggers for complex multi-step checkout funnels',
      'Scroll depth, video watch time, and AJAX form submit handlers',
      'Dynamic currency and high-ticket customer parameter pass-through',
      'Cross-domain tracking and QA staging-to-production validation matrix'
    ]
  }
];
