# R2R Studio Marketing Hub (`src/app/marketing`)

This folder contains all public-facing marketing assets, landing pages, interactive lead capture forms, CORS-enabled API endpoints, and embeddable iframe widgets for **R2R Studio**.

---

## 📁 Directory Overview

```
src/app/marketing/
├── page.tsx                        # Main R2R Public Marketing Landing Page (/marketing)
├── components/
│   ├── Navbar.tsx                  # Marketing Navigation Header
│   ├── HeroSection.tsx             # Hero Banner with CTA & Highlight Stats
│   ├── PackagesSection.tsx         # R2R Photography & Film Packages
│   ├── PortfolioSection.tsx        # Portfolio Gallery Grid
│   ├── LeadInquiryForm.tsx         # Interactive CRM-linked Lead Capture Form
│   └── Footer.tsx                  # Marketing Footer
├── embed/
│   └── page.tsx                    # Standalone Embeddable Form (/marketing/embed)
└── README.md                       # Documentation & Integration Guide
```

---

## 🔗 Public Routes

1. **R2R Landing Page**: `https://your-domain.com/marketing`
2. **Embeddable Lead Form**: `https://your-domain.com/marketing/embed`
3. **Public Lead Capture API**: `POST https://your-domain.com/api/marketing/leads`

---

## 🌐 Embedding the R2R Lead Form on External Websites

### Option 1: Using an `<iframe>` (Easiest)
Paste this snippet on your WordPress, Webflow, Squarespace, or HTML website:

```html
<iframe
  src="https://your-domain.com/marketing/embed"
  width="100%"
  height="600px"
  style="border:none; border-radius:16px;"
  title="R2R Studio Inquiry Form">
</iframe>
```

---

### Option 2: Custom JavaScript / AJAX Submission
Send inquiries directly from your custom marketing site via HTTP `POST`:

```javascript
fetch('https://your-domain.com/api/marketing/leads', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    name: 'Client Name',
    phone: '+919876543210',
    email: 'client@example.com',
    event: 'Wedding Photography & Film',
    eventDate: '2026-12-25',
    budget: 75000,
    source: 'WEBSITE',
    notes: 'Inquiry submitted from custom web form',
  }),
})
.then(res => res.json())
.then(data => console.log('Lead recorded:', data));
```

---

## 📊 How Leads Flow into the CRM
Whenever an inquiry is submitted through the marketing form or API:
1. A new record is automatically created in the PostgreSQL `Lead` database table.
2. The lead source is tagged as `WEBSITE` and status is set to `NEW`.
3. The lead immediately appears in the staff CRM dashboard under **Inquiries & Lead Pipeline** ([`/dashboard/leads`](file:///d:/studiooo/src/app/dashboard/leads/page.tsx)).
