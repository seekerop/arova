const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

// 1. Read DATABASE_URL from .env.local or .env
function getDatabaseUrl() {
  const envFiles = ['.env.local', '.env'];
  for (const file of envFiles) {
    const fullPath = path.join(__dirname, '..', file);
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, 'utf8');
      for (const line of content.split('\n')) {
        const trimmed = line.trim();
        if (trimmed.startsWith('DATABASE_URL=') && !trimmed.startsWith('#')) {
          let url = trimmed.substring('DATABASE_URL='.length).trim();
          if ((url.startsWith('"') && url.endsWith('"')) || (url.startsWith("'") && url.endsWith("'"))) {
            url = url.slice(1, -1);
          }
          return url;
        }
      }
    }
  }
  return process.env.DATABASE_URL;
}

let databaseUrl = getDatabaseUrl();

if (!databaseUrl) {
  console.error('\x1b[31m[ERROR] DATABASE_URL is not set in .env.local or .env\x1b[0m');
  process.exit(1);
}

// Convert direct host to pooler if needed and strip sslmode
if (databaseUrl.includes('db.') && databaseUrl.includes('.supabase.co')) {
  const match = databaseUrl.match(/postgresql:\/\/([^:]+):([^@]+)@db\.([^.]+)\.supabase\.co(?::\d+)?\/(.+)/);
  if (match) {
    const [, user, pass, projectRef, dbName] = match;
    databaseUrl = `postgresql://${user}.${projectRef}:${pass}@aws-0-ap-south-1.pooler.supabase.com:6543/${dbName}`;
  }
}

databaseUrl = databaseUrl.replace(/([?&])sslmode=[^&]+(&|$)/g, '$1').replace(/[?&]$/, '');

const INDIAN_CITIES = [
  { city: 'Bengaluru', state: 'Karnataka' },
  { city: 'Mumbai', state: 'Maharashtra' },
  { city: 'Delhi NCR', state: 'Delhi' },
  { city: 'Pune', state: 'Maharashtra' },
  { city: 'Hyderabad', state: 'Telangana' },
  { city: 'Chennai', state: 'Tamil Nadu' },
  { city: 'Ahmedabad', state: 'Gujarat' },
  { city: 'Kolkata', state: 'West Bengal' },
  { city: 'Jaipur', state: 'Rajasthan' },
  { city: 'Chandigarh', state: 'Punjab' },
];

const FIRST_NAMES = [
  'Arjun', 'Priya', 'Vikram', 'Sneha', 'Rahul', 'Ananya', 'Aditya',
  'Deepa', 'Karthik', 'Neha', 'Rohan', 'Tanvi', 'Siddharth', 'Pooja',
  'Amitav', 'Devika', 'Nikhil', 'Ritu', 'Gaurav', 'Simran', 'Kabir', 'Meera'
];

const LAST_NAMES = [
  'Sharma', 'Mehta', 'Patel', 'Reddy', 'Verma', 'Kulkarni', 'Deshmukh',
  'Nair', 'Iyer', 'Singhania', 'Bansal', 'Chopra', 'Subramanian', 'Joshi',
  'Sengupta', 'Malhotra', 'Kapoor', 'Bhatia', 'Saxena', 'Choudhury'
];

function randomChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generatePhone() {
  const prefixes = ['9820', '9819', '9845', '9811', '9871', '9920', '9711', '9823', '9840', '9980'];
  const prefix = randomChoice(prefixes);
  const suffix = Math.floor(100000 + Math.random() * 900000);
  return `+91 ${prefix.slice(0, 2)}${prefix.slice(2, 4)} ${suffix.toString().slice(0, 3)} ${suffix.toString().slice(3)}`;
}

const CATEGORY_TEMPLATES = {
  'programming-software': {
    businessNames: [
      'Nexora Cloud Technologies', 'Zyphron Labs Pvt Ltd', 'Dataprism Analytics',
      'HyperSync Systems', 'CodeVibe Tech Solutions', 'Algoma Infotech',
      'QuantumByte Logic', 'CloudKite Technologies', 'FinStack Core Technologies'
    ],
    businessTypes: ['FinTech Platform', 'B2B SaaS Provider', 'Enterprise Logistics', 'Healthcare ERP'],
    requirements: [
      'Modernization of legacy ERP backend into Node.js/TypeScript microservices architecture with PostgreSQL read-replicas and sub-second querying.',
      'Custom multi-tenant SaaS customer portal built in Next.js 16 with role-based access control, Stripe/Razorpay billing, and audit logs.',
      'Cross-platform React Native / Flutter mobile app development with real-time push notifications and biometric authentication.',
      'High-throughput REST and GraphQL API layer development for financial analytics aggregation handling 50k+ daily transactions.',
      'Cloud architecture migration from on-premise hardware to scalable AWS ECS / Kubernetes clusters with CI/CD automation.'
    ],
    tagsPool: ['Next.js', 'TypeScript', 'Node.js', 'PostgreSQL', 'AWS', 'GraphQL', 'SaaS', 'Microservices', 'REST API'],
    valueRangePaise: [12000000, 38000000],
  },
  'video-editing-production': {
    businessNames: [
      'Lumina Frames Studio', 'Pixeled Motion House', 'CineVibe Productions',
      'Aura Wave Visuals', 'FrameSmith Media', 'Horizon Cut Studios',
      'Velvet Lens Creative Films', 'Vivid Narrative Productions'
    ],
    businessTypes: ['D2C Lifestyle Brand', 'EdTech Academy', 'Consumer Electronics', 'Luxury Hospitality'],
    requirements: [
      'Production of 12 commercial Instagram Reels & YouTube Shorts with motion graphics, captions, and high-energy pacing for Q4 product launch.',
      'End-to-end post-production for 6-episode founder documentary and YouTube podcast series, including 4K multicam sync and color grading.',
      '3D product animation and cinematic CGI rendering for upcoming consumer electronics launch on Amazon & Shopify.',
      'High-impact 60-second brand manifesto film with professional voiceover, licensed cinematic score, and Davinci Resolve grade.',
      'High-converting video ad variation batch (15 variations with distinct opening hooks) for Meta Ads performance scaling.'
    ],
    tagsPool: ['Premiere Pro', 'DaVinci Resolve', 'After Effects', 'Color Grading', 'Commercial Reels', 'YouTube 4K', 'Motion Graphics'],
    valueRangePaise: [4500000, 16000000],
  },
  'digital-marketing-seo': {
    businessNames: [
      'Apex Velocity Media', 'GrowthPulse Digital', 'BrandForge Performance',
      'ClickScale Growth Agency', 'RankSphere Marketing', 'AdSpark Digital Ventures',
      'ScaleCraft Omnichannel', 'Beacon Outreach Partners'
    ],
    businessTypes: ['B2B Consulting Firm', 'D2C Apparel Brand', 'EdTech Startup', 'Real Estate Developer'],
    requirements: [
      'Full-funnel Google Search & Performance Max ads management with monthly budget of ₹3L+ targeting ROAS above 4.5x.',
      'Comprehensive technical and content SEO audit with 6-month organic search rank recovery and high-intent programmatic keyword strategy.',
      'Meta Ads (Facebook & Instagram) conversion rate optimization with creative fatigue rotation and Custom Audience lookalikes.',
      'B2B LinkedIn Account-Based Marketing (ABM) lead generation campaign targeting C-suite tech decision makers in India & US.',
      'Local SEO dominance across 15 retail outlet locations with Google Business Profile optimization and high-authority local citations.'
    ],
    tagsPool: ['Google Ads', 'Performance Max', 'Technical SEO', 'Meta Ads', 'LinkedIn ABM', 'ROAS Scaling', 'CRO'],
    valueRangePaise: [5000000, 18000000],
  },
  'website-ecommerce': {
    businessNames: [
      'TrendCart Lifestyle Stores', 'Aura Chic Fashion', 'UrbanNest Living Pvt Ltd',
      'SpiceRoute Gourmet Foods', 'KisaanDirect Organics', 'CraftVilla Luxury Furnishings',
      'PebbleStone Ceramics', 'NovaPure Cosmetics'
    ],
    businessTypes: ['Omnichannel Retailer', 'D2C Fashion Label', 'Specialty Food Brand', 'Modern Home Decor'],
    requirements: [
      'Custom Shopify Plus store redesign with sub-2 second mobile load speed, custom bundle builder, and Cash on Delivery verification app.',
      'High-converting WooCommerce to Shopify migration with complete customer, order, and inventory sync without SEO traffic loss.',
      'Headless e-commerce storefront development utilizing Next.js Commerce and Shopify Storefront GraphQL API.',
      'Conversion-focused B2B wholesale order catalog and quote request portal with tiered pricing and GST invoicing.',
      'Landing page design and split-testing optimization targeting >4.5% conversion rate for flagship direct-to-consumer product.'
    ],
    tagsPool: ['Shopify Plus', 'WooCommerce', 'Next.js Commerce', 'Speed Optimization', 'COD Verification', 'Headless', 'UI/UX'],
    valueRangePaise: [6000000, 22000000],
  },
  'business-automation-ai': {
    businessNames: [
      'Synthetix Automations', 'WorkFlowr AI Systems', 'CogniFlow Robotic Ops',
      'BotCraft Automated Intelligence', 'FlowEngine Ops Tech', 'AutoBiz Systems Pvt Ltd',
      'NeuraSync Automated Workflows'
    ],
    businessTypes: ['Logistics & Warehousing', 'Financial Services', 'Immigration & Legal Consultancy', 'Healthcare Diagnostic Labs'],
    requirements: [
      'End-to-end WhatsApp Business API integration with automated appointment booking, payment link dispatch, and CRM sync via n8n.',
      'Automated lead routing and qualification pipeline connecting Meta Lead Ads directly to HubSpot CRM and sales representative Slack alerts.',
      'Custom AI document extraction pipeline using LLMs to parse incoming PDF vendor invoices and reconcile ERP accounting entries.',
      'Automated customer support triage chatbot with OpenAI embeddings trained on company knowledge base and Zendesk handoff.',
      'Comprehensive Make.com / Zapier cross-system data synchronization connecting Shopify, Zoho Books, Shiprocket, and Google Sheets.'
    ],
    tagsPool: ['WhatsApp API', 'n8n', 'Make.com', 'Zapier', 'HubSpot CRM', 'LLM Extraction', 'AI Chatbot', 'Zoho Books'],
    valueRangePaise: [5500000, 24000000],
  },
};

async function seed() {
  console.log('\x1b[36mConnecting to Supabase PostgreSQL...\x1b[0m');
  const pool = new Pool({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false },
    max: 5,
    connectionTimeoutMillis: 10000,
  });

  try {
    // 1. Fetch categories
    const catRes = await pool.query('SELECT id, slug, name FROM public.categories ORDER BY name');
    if (catRes.rows.length === 0) {
      console.error('\x1b[31m[ERROR] No categories found in public.categories table.\x1b[0m');
      process.exit(1);
    }

    const catMap = new Map();
    for (const row of catRes.rows) {
      catMap.set(row.slug, row.id);
    }
    console.log(`\x1b[32m✔ Loaded ${catRes.rows.length} approved categories from database.\x1b[0m`);

    const countPerCategory = 5;
    let insertedTotal = 0;

    for (const [slug, template] of Object.entries(CATEGORY_TEMPLATES)) {
      const categoryId = catMap.get(slug);
      if (!categoryId) {
        console.warn(`[WARN] Category slug ${slug} not found in database categories.`);
        continue;
      }

      console.log(`\n\x1b[33mGenerating ${countPerCategory} leads for: ${slug}...\x1b[0m`);

      for (let i = 0; i < countPerCategory; i++) {
        const location = randomChoice(INDIAN_CITIES);
        const firstName = randomChoice(FIRST_NAMES);
        const lastName = randomChoice(LAST_NAMES);
        const contactName = `${firstName} ${lastName}`;
        const rawBusiness = randomChoice(template.businessNames);
        const suffix = randomInt(10, 99);
        const businessName = `${rawBusiness} #${suffix}`;
        const domainPart = rawBusiness.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 14);
        const email = `${firstName.toLowerCase()}.${lastName.toLowerCase().slice(0, 3)}@${domainPart}.in`;
        const website = `https://www.${domainPart}.in`;
        const shuffledTags = [...template.tagsPool].sort(() => 0.5 - Math.random());
        const tags = shuffledTags.slice(0, 3);
        const estimatedValuePaise = Math.round(randomInt(template.valueRangePaise[0], template.valueRangePaise[1]) / 100000) * 100000;
        const requirement = randomChoice(template.requirements);
        const businessType = randomChoice(template.businessTypes);

        const insertQuery = `
          INSERT INTO public.leads (
            business_name,
            contact_name,
            phone,
            email,
            website,
            category_id,
            generalized_requirement,
            estimated_value_paise,
            estimated_value_currency,
            country,
            state,
            city,
            business_type,
            tags,
            source_name,
            source_url,
            collection_date,
            verification_date,
            data_quality_status,
            availability_status,
            admin_notes
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, CURRENT_DATE, CURRENT_DATE, 'verified', 'available', $17
          )
          RETURNING id, business_name;
        `;

        const values = [
          businessName,
          contactName,
          generatePhone(),
          email,
          website,
          categoryId,
          requirement,
          estimatedValuePaise,
          'INR',
          'India',
          location.state,
          location.city,
          businessType,
          tags,
          'Beta Lead Generator',
          website,
          'Verified prospective beta commercial requirement'
        ];

        const res = await pool.query(insertQuery, values);
        console.log(`  + [${slug}] ${res.rows[0].business_name} (${location.city}) — ₹${(estimatedValuePaise / 100).toLocaleString('en-IN')}`);
        insertedTotal++;
      }
    }

    console.log(`\n\x1b[32m✔ Successfully seeded ${insertedTotal} random beta leads into public.leads!\x1b[0m`);

    const countRes = await pool.query('SELECT count(*) FROM public.leads WHERE availability_status = \'available\'');
    console.log(`Total available leads in database: \x1b[36m${countRes.rows[0].count}\x1b[0m\n`);

  } catch (err) {
    console.error('\x1b[31m[ERROR] Failed to seed beta leads:\x1b[0m', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

seed();
