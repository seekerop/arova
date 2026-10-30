/**
 * AROVA SEO INFRASTRUCTURE VALIDATION SUITE
 * Automatically inspects SEO assets, sitemap, robots, canonicals, and structured data.
 */

const fs = require("fs");
const path = require("path");

const EXPECTED_DOMAIN = "https://arova.arenova.in";

const PUBLIC_CANONICAL_ROUTES = [
  "/",
  "/categories",
  "/pricing",
  "/how-it-works",
  "/faq",
  "/contact",
  "/privacy",
  "/terms",
  "/refund-policy",
  "/categories/programming-software",
  "/categories/video-editing-production",
  "/categories/digital-marketing-seo",
  "/categories/website-ecommerce",
  "/categories/business-automation-ai",
];

const PRIVATE_DISALLOWED_PATTERNS = [
  "/admin",
  "/dashboard",
  "/api",
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
];

let errors = [];
let warnings = [];

function assert(condition, message) {
  if (!condition) {
    errors.push(message);
    console.error(`  \x1b[31m✖ FAIL:\x1b[0m ${message}`);
  } else {
    console.log(`  \x1b[32m✔ PASS:\x1b[0m ${message}`);
  }
}

function warn(condition, message) {
  if (!condition) {
    warnings.push(message);
    console.warn(`  \x1b[33m▲ WARN:\x1b[0m ${message}`);
  }
}

console.log("\n\x1b[36m==================================================\x1b[0m");
console.log("\x1b[36m AROVA SEO & CRAWLABILITY VALIDATOR\x1b[0m");
console.log("\x1b[36m==================================================\x1b[0m\n");

// 1. Validate SEO Config file
console.log("\x1b[34m[1/6] Validating SEO Configuration & Domain...\x1b[0m");
const configPath = path.join(__dirname, "..", "src", "lib", "seo", "config.ts");
assert(fs.existsSync(configPath), "src/lib/seo/config.ts exists");
const configContent = fs.readFileSync(configPath, "utf8");
assert(
  configContent.includes("https://arova.arenova.in"),
  "Config enforces production domain https://arova.arenova.in"
);
assert(
  !configContent.includes("arova.io"),
  "No obsolete staging/placeholder domains (arova.io) in SEO config"
);

// 2. Validate Sitemap
console.log("\n\x1b[34m[2/6] Validating Sitemap Generation...\x1b[0m");
const sitemapPath = path.join(__dirname, "..", "src", "app", "sitemap.ts");
assert(fs.existsSync(sitemapPath), "src/app/sitemap.ts exists");
const sitemapContent = fs.readFileSync(sitemapPath, "utf8");

PUBLIC_CANONICAL_ROUTES.forEach((route) => {
  const routeIdentifier = route === "/" ? '"/"' : `"${route}"`;
  assert(
    sitemapContent.includes(routeIdentifier) ||
      (route.startsWith("/categories/") && sitemapContent.includes("cat.slug")),
    `Sitemap includes public route: ${route}`
  );
});

PRIVATE_DISALLOWED_PATTERNS.forEach((pattern) => {
  assert(
    !sitemapContent.includes(`"${pattern}"`) &&
      !sitemapContent.includes(`'${pattern}'`),
    `Sitemap strictly EXCLUDES private route: ${pattern}`
  );
});

// 3. Validate Robots.txt
console.log("\n\x1b[34m[3/6] Validating Robots.txt Directives...\x1b[0m");
const robotsPath = path.join(__dirname, "..", "src", "app", "robots.ts");
assert(fs.existsSync(robotsPath), "src/app/robots.ts exists");
const robotsContent = fs.readFileSync(robotsPath, "utf8");

PRIVATE_DISALLOWED_PATTERNS.forEach((pattern) => {
  assert(
    robotsContent.includes(pattern),
    `Robots disallows private path: ${pattern}`
  );
});
assert(
  robotsContent.includes("sitemap.xml"),
  "Robots references sitemap.xml"
);

// 4. Validate Structured Data Engine
console.log("\n\x1b[34m[4/6] Validating Schema.org Structured Data...\x1b[0m");
const schemaPath = path.join(
  __dirname,
  "..",
  "src",
  "lib",
  "seo",
  "structured-data.ts"
);
assert(fs.existsSync(schemaPath), "src/lib/seo/structured-data.ts exists");
const schemaContent = fs.readFileSync(schemaPath, "utf8");
assert(
  schemaContent.includes("SoftwareApplication"),
  "Defines SoftwareApplication schema"
);
assert(schemaContent.includes("Organization"), "Defines Organization schema");
assert(schemaContent.includes("WebSite"), "Defines WebSite schema");
assert(schemaContent.includes("BreadcrumbList"), "Defines BreadcrumbList schema");
assert(schemaContent.includes("FAQPage"), "Defines FAQPage schema");
const plansPath = path.join(__dirname, "..", "src", "lib", "constants", "plans.ts");
const plansContent = fs.readFileSync(plansPath, "utf8");
assert(
  schemaContent.includes("SUBSCRIPTION_PLANS") &&
    plansContent.includes("499") &&
    plansContent.includes("999"),
  "Structured data maps real Starter (₹499) & Growth (₹999) pricing dynamically from plans"
);

// 5. Validate AI Discoverability (llms.txt) & Web Manifest
console.log("\n\x1b[34m[5/6] Validating AI Discoverability & Manifest...\x1b[0m");
const llmsPath = path.join(__dirname, "..", "public", "llms.txt");
assert(fs.existsSync(llmsPath), "public/llms.txt exists");
const llmsContent = fs.readFileSync(llmsPath, "utf8");
assert(
  llmsContent.includes("https://arova.arenova.in"),
  "llms.txt points to canonical production domain"
);
assert(
  llmsContent.includes("Arenova"),
  "llms.txt links Arova to Arenova parent brand"
);

const manifestPath = path.join(__dirname, "..", "public", "manifest.json");
assert(fs.existsSync(manifestPath), "public/manifest.json exists");

// 6. Validate Private Route Protection (noindex)
console.log("\n\x1b[34m[6/6] Validating Private Route Noindex Directives...\x1b[0m");
const dashboardLayoutPath = path.join(
  __dirname,
  "..",
  "src",
  "app",
  "dashboard",
  "layout.tsx"
);
const adminLayoutPath = path.join(
  __dirname,
  "..",
  "src",
  "app",
  "admin",
  "layout.tsx"
);
const loginLayoutPath = path.join(
  __dirname,
  "..",
  "src",
  "app",
  "login",
  "layout.tsx"
);
const signupLayoutPath = path.join(
  __dirname,
  "..",
  "src",
  "app",
  "signup",
  "layout.tsx"
);

assert(
  fs.readFileSync(dashboardLayoutPath, "utf8").includes("index: false"),
  "/dashboard layout enforces noindex"
);
assert(
  fs.readFileSync(adminLayoutPath, "utf8").includes("index: false"),
  "/admin layout enforces noindex"
);
assert(
  fs.readFileSync(loginLayoutPath, "utf8").includes("index: false"),
  "/login layout enforces noindex"
);
assert(
  fs.readFileSync(signupLayoutPath, "utf8").includes("index: false"),
  "/signup layout enforces noindex"
);

console.log("\n--------------------------------------------------");
if (errors.length > 0) {
  console.error(`\x1b[31m[FAILED] ${errors.length} SEO validation checks failed.\x1b[0m`);
  process.exit(1);
} else {
  console.log(`\x1b[32m[SUCCESS] All SEO checks passed with 0 errors!\x1b[0m\n`);
  process.exit(0);
}
