export type ServiceCategory = 'Data & Measurement' | 'E-Commerce Engineering' | 'Growth Operations';

export const SERVICE_CATEGORIES: { id: ServiceCategory; title: string; subtitle: string }[] = [
  {
    id: 'Data & Measurement',
    title: 'Data & Measurement',
    subtitle: 'Tracking, CAPI, Analytics'
  },
  {
    id: 'E-Commerce Engineering',
    title: 'E-Commerce Engineering',
    subtitle: 'Shopify, WordPress, GMC'
  },
  {
    id: 'Growth Operations',
    title: 'Growth Operations',
    subtitle: 'SEO, Social Media Management'
  }
];

export interface Service {
  id: string;
  category?: ServiceCategory | string;
  title: string;
  tier?: string;
  price?: number;
  turnaround?: string;
  description: string;
  techStack?: string[];
  deliverables?: string[];
  link?: string;
  imageUrl?: string;
  recommended?: boolean;
  rating?: number;
  ordersCount?: number;
  levelBadge?: string;
}

export interface CaseStudy {
  id: string;
  client: string;
  industry?: string;
  clientType?: string;
  challenge: string;
  solution: string;
  result: string;
  metric?: string;
  imageUrl?: string;
  createdAt?: unknown;
}

export interface Lead {
  id: string;
  websiteUrl: string;
  adPlatform: 'Meta' | 'Google' | 'TikTok' | 'Other' | string;
  monthlyAdSpend: 'Under $10k' | '$10k-$50k' | '$50k+' | string;
  whatsappNumber: string;
  trackingChallenge?: string;
  serviceTier?: string;
  createdAt?: unknown;
}

export interface LabProject {
  id: string;
  name: string;
  description: string;
  techStack: string[];
  url: string;
  category?: string;
  badge?: string;
  imageUrl?: string;
  createdAt?: unknown;
}

export interface LabVideo {
  id: string;
  title: string;
  embedUrl: string;
  description?: string;
  category?: string;
  duration?: string;
  createdAt?: unknown;
}

export const FIVERR_PROFILE_URL = 'https://www.fiverr.com/adesh_chandra';
export const CALENDLY_DISCOVERY_URL = 'https://calendly.com/syncops/discovery-call';
export const APPLICATION_FORM_URL = 'https://tally.so/r/w8ZkNx';
export const WHATSAPP_TRIAGE_URL = 'https://wa.me/8801608533529?text=Hi%20Adesh,%20I%20am%20submitting%20a%20request%20for%20a%20tracking%20architecture%20review.%20My%20domain%20is:%20';
export const WHATSAPP_AUDIT_URL = WHATSAPP_TRIAGE_URL;
export const WHATSAPP_DIRECT_URL = 'https://wa.me/8801608533529';
export const ARCHITECT_EMAIL = 'mailto:iadeshchandra@gmail.com';

export const DEFAULT_SERVICES: Service[] = [
  // Category 1: Data & Measurement (Tracking, CAPI, Analytics)
  {
    id: 'omnichannel-server-capi',
    category: 'Data & Measurement',
    title: 'Omnichannel Server-Side CAPI & Signal Gateway',
    tier: 'Core Architecture',
    recommended: true,
    turnaround: '3-4 Days',
    description: 'Enterprise first-party server tracking architecture engineered to bypass iOS 14.5+ Safari ITP restrictions, ad blockers, and cookie degradation.',
    techStack: ['Meta CAPI', 'TikTok Events API', 'Server GTM', 'Google Cloud Run', 'Consent Mode v2'],
    deliverables: [
      'Server-Side GTM container deployment on Google Cloud Run',
      'Meta Conversions API (CAPI) with 100% deduplication',
      'TikTok Events API & Pinterest server dispatch',
      'First-party custom subdomain routing (e.g., data.yourbrand.com)',
      'Event Match Quality (EMQ) optimization to 8.5+ score'
    ],
    link: APPLICATION_FORM_URL
  },
  {
    id: 'ga4-bigquery-warehouse',
    category: 'Data & Measurement',
    title: 'GA4 Enterprise Pipeline & BigQuery Ingestion',
    tier: 'Analytics Pipeline',
    recommended: false,
    turnaround: '4-5 Days',
    description: 'Direct server-to-warehouse streaming architecture that captures complete, unsampled e-commerce and lead-gen telemetry without browser loss.',
    techStack: ['Google Analytics 4', 'BigQuery SQL', 'GTM Server', 'Measurement Protocol', 'Looker Studio'],
    deliverables: [
      'Server-Side GA4 enhanced e-commerce dataLayer instrumentation',
      'Continuous daily raw event streaming into Google BigQuery',
      'Custom SQL schema mapping for LTV and cohort retention',
      'Looker Studio executive attribution command board'
    ],
    link: APPLICATION_FORM_URL
  },
  {
    id: 'first-party-id-graph',
    category: 'Data & Measurement',
    title: 'First-Party ID Graph & Cookie Recovery Matrix',
    tier: 'Resilience Suite',
    recommended: false,
    turnaround: '3-5 Days',
    description: 'Resilient identity resolution engine combining client fingerprint hashing with server-side cookie lifetime extension for high-ACV cycles.',
    techStack: ['Stape.io', 'DNS Subdomain CNAME', 'SHA-256 Hashing', 'HubSpot Webhooks', 'Stripe Webhooks'],
    deliverables: [
      'Custom CNAME subdomain setup preserving 365-day cookie lifespan',
      'SHA-256 customer data normalization (em, ph, fn, ln, ct, zp)',
      'Offline CRM webhook sync for post-purchase & lead qualification',
      'Bot & crawler signal filtration matrix'
    ],
    link: APPLICATION_FORM_URL
  },

  // Category 2: E-Commerce Engineering (Shopify, WordPress, GMC)
  {
    id: 'headless-shopify-liquid',
    category: 'E-Commerce Engineering',
    title: 'Headless Shopify & Custom Liquid Architecture',
    tier: 'Storefront Optimization',
    recommended: true,
    turnaround: '1-2 Weeks',
    description: 'High-performance Shopify Plus theme engineering, custom Liquid templating, and Web Pixels API integration tailored for sub-second page loads.',
    techStack: ['Shopify Plus', 'Liquid Engine', 'Web Pixels API', 'Hydrogen / Remix', 'GraphQL Storefront'],
    deliverables: [
      'Custom Shopify 2.0 section architecture and Liquid refactoring',
      'Shopify Customer Events / Web Pixels API sandbox synchronization',
      'Checkout Extensibility & post-purchase conversion funnel setup',
      'Sub-second Mobile Core Web Vitals performance tuning'
    ],
    link: APPLICATION_FORM_URL
  },
  {
    id: 'woocommerce-enterprise-hardening',
    category: 'E-Commerce Engineering',
    title: 'WooCommerce & WordPress Infrastructure Hardening',
    tier: 'Full-Stack WP',
    recommended: false,
    turnaround: '5-7 Days',
    description: 'Enterprise WordPress and WooCommerce performance architecture built to withstand high concurrency sales bursts with zero server timeouts.',
    techStack: ['WordPress Core', 'WooCommerce REST', 'Redis Object Cache', 'Custom DataLayer', 'Cloudflare Edge'],
    deliverables: [
      'High-concurrency checkout throughput and database index tuning',
      'Native PHP dataLayer injection for 100% order capture reliability',
      'Redis in-memory caching and Cloudflare Enterprise edge rules',
      'Automated automated backup and failover recovery pipeline'
    ],
    link: APPLICATION_FORM_URL
  },
  {
    id: 'gmc-product-feed-engine',
    category: 'E-Commerce Engineering',
    title: 'Google Merchant Center & Multi-Feed Automation',
    tier: 'Feed Protocol',
    recommended: false,
    turnaround: '3-4 Days',
    description: 'Automated product catalog feed synchronization, schema diagnostics resolution, and Google Shopping approval infrastructure.',
    techStack: ['Google Merchant Center', 'Content API for Shopping', 'Supplemental Feeds', 'PMax Alignment', 'Schema.org Product'],
    deliverables: [
      'GMC diagnostic error remediation (disapprovals, GTIN, policy flags)',
      'Automated supplemental rules for margin and custom product labeling',
      'Real-time price & stock inventory sync via Content API',
      'Google Performance Max asset and feed alignment'
    ],
    link: APPLICATION_FORM_URL
  },

  // Category 3: Growth Operations (SEO, Social Media Management)
  {
    id: 'semantic-technical-seo',
    category: 'Growth Operations',
    title: 'Semantic & Programmatic Technical SEO',
    tier: 'Search Infrastructure',
    recommended: true,
    turnaround: 'Ongoing / Sprint',
    description: 'Full-site crawl budget optimization, Schema.org entity knowledge graphs, and programmatic indexation architecture for high-intent search visibility.',
    techStack: ['Schema.org JSON-LD', 'Google Search Console API', 'Core Web Vitals', 'IndexNow Protocol', 'Next.js SSR'],
    deliverables: [
      'Comprehensive semantic entity markup and JSON-LD knowledge graph',
      'Internal link equity redistribution and crawl path streamlining',
      'Automated instant URL indexing via IndexNow and Search Console APIs',
      'International hreflang and localized canonical routing'
    ],
    link: APPLICATION_FORM_URL
  },
  {
    id: 'b2b-growth-distribution',
    category: 'Growth Operations',
    title: 'B2B Performance Creative & Social Distribution',
    tier: 'Demand Gen',
    recommended: false,
    turnaround: 'Ongoing / Sprint',
    description: 'Systematic social media management and high-yield creative testing engine designed to generate and capture inbound B2B pipeline.',
    techStack: ['Meta Ads Manager', 'LinkedIn Campaign Manager', 'HubSpot CRM', 'Klaviyo', 'Figma'],
    deliverables: [
      'Multi-angle ad creative sprints and dynamic product ad structuring',
      'Organic LinkedIn executive personal brand thought leadership distribution',
      'Automated email nurture sequences mapped to conversion intent stages',
      'Cross-platform creative attribution and asset fatigue monitoring'
    ],
    link: APPLICATION_FORM_URL
  },
  {
    id: 'conversion-rate-optimization',
    category: 'Growth Operations',
    title: 'Conversion Rate Optimization (CRO) & Signal Testing',
    tier: 'Conversion Yield',
    recommended: false,
    turnaround: '2-Week Sprints',
    description: 'Scientific UX audit and split-testing program eliminating checkout friction points to maximize revenue per visitor across all traffic channels.',
    techStack: ['PostHog', 'Hotjar Heatmaps', 'A/B Testing Framework', 'Tailwind CSS', 'VWO'],
    deliverables: [
      'Full-funnel dropoff behavioral audit with session recording synthesis',
      'High-velocity A/B testing roadmap prioritizing bottom-of-funnel wins',
      'Mobile-first checkout micro-copy and trust indicator restructuring',
      'Statistically valid lift verification and winner rollout'
    ],
    link: APPLICATION_FORM_URL
  }
];

export const DEFAULT_CASE_STUDIES: CaseStudy[] = [
  {
    id: 'dtc-luxury-apparel',
    client: 'Velour & Oak (Shopify Plus DTC)',
    industry: 'E-Commerce Fashion ($12M ARR)',
    clientType: 'E-Commerce Fashion ($12M ARR)',
    challenge: 'iOS 14.5 and Safari ITP browser restrictions caused 38% loss of purchase signals. Meta ROAS reported falsely dropped from 3.4x to 1.8x, triggering erroneous ad scale reductions.',
    solution: 'Deployed isolated Server-Side GTM container on Google Cloud Run via custom subdomain (data.velouroak.com). Enforced strict SHA-256 hashed customer parameters (em, ph, fn, ln) with dual-stream Meta CAPI + client deduplication.',
    metric: '+41% ROAS Recovery',
    result: '+41% Recovered Attributed Revenue • Meta EMQ increased from 4.8 to 9.6/10 • Match Rate > 92%'
  },
  {
    id: 'fintech-b2b-saas',
    client: 'LedgerStack (B2B FinTech Platform)',
    industry: 'B2B FinTech ($45k ACV)',
    clientType: 'High-Ticket SaaS ($45k ACV)',
    challenge: 'Multi-step demo booking and trial signups failed to attribute to high-cost Google Search ads due to cross-domain iframe embedding and strict cookie privacy policies.',
    solution: 'Engineered server-side event pipeline linking HubSpot webhook callbacks directly to Google Ads Enhanced Conversions API and GA4 Measurement Protocol with client ID persistence.',
    metric: '-29% Cost Per Qualified Lead',
    result: '100% Offline Revenue Attribution • -29% Google Ads Cost-Per-Qualified-Lead • Zero Ad Blocker Signal Drop'
  },
  {
    id: 'supplements-brand',
    client: 'Aura Nutrition (Omnichannel Health)',
    industry: 'E-Commerce Health & CPG',
    clientType: 'High-Velocity CPG Brand',
    challenge: 'TikTok Pixel and Meta CAPI simultaneously suffered catastrophic over-reporting and double-counting during Black Friday, inflating CPA models and distorting budget allocation.',
    solution: 'Architected unified Stape.io server proxy with synthetic unique event_id generation. Added Google Consent Mode v2 strict payload gating with automated event throttling.',
    metric: '9.8/10 EMQ & $35k Saved',
    result: 'Zero Duplicate Conversions • 9.8 Event Match Quality Score • Saved $35k in wasted ad spend'
  }
];

export const DEFAULT_LAB_PROJECTS: LabProject[] = [
  {
    id: 'sanatani-bandhan',
    name: 'Sanatani Bandhan',
    category: 'Community & Matchmaking App',
    badge: 'Proprietary Startup',
    description: 'High-trust cultural matrimonial and community platform engineered with end-to-end user verification, encrypted matchmaking preferences, and low-latency real-time synchronization.',
    techStack: ['React Native', 'Firebase Firestore', 'Cloud Functions', 'TypeScript', 'Tailwind CSS'],
    url: 'https://sanatanibandhan.com'
  },
  {
    id: 'ultra-calculator',
    name: 'Ultra Calculator',
    category: 'Utility & Scientific Engine',
    badge: 'Proprietary Utility',
    description: 'High-precision mathematical and programmatic computation engine designed for offline-first operations, algorithmic equation solving, and financial telemetry modeling.',
    techStack: ['React Native', 'TypeScript', 'WebAssembly (WASM)', 'Tailwind CSS', 'Firebase'],
    url: 'https://ultracalculator.app'
  }
];

export const DEFAULT_LAB_VIDEOS: LabVideo[] = [
  {
    id: 'video-sgtm-cloud-run',
    title: 'Server-Side GTM on Cloud Run vs Stape.io: Zero Data Loss Guide',
    embedUrl: 'https://www.youtube.com/embed/fD3_P_q5Nqg',
    description: 'Comprehensive architectural breakdown comparing dedicated GCP Cloud Run clusters with edge Stape.io instances, covering ITP cookie bypass and custom subdomain routing.',
    category: 'Architecture Deep-Dive',
    duration: '18:42'
  },
  {
    id: 'video-meta-capi-emq',
    title: 'Meta Conversions API (CAPI) Deduplication & Event Match Quality (EMQ)',
    embedUrl: 'https://www.youtube.com/embed/7V2Y3lKjI58',
    description: 'How to implement deterministic SHA-256 customer data hashing, cryptographic event_id generation, and eliminate 100% of double-counted conversion spikes in Meta Ads Manager.',
    category: 'Telemetry Engineering',
    duration: '22:15'
  }
];

