# Standalone R2R Marketing Website (`r2r-marketing`)

This is a standalone, independent Next.js project created specifically for the **R2R Photography & Film Studio Marketing Website**.

It is completely separated from the main CRM app and can be deployed directly to Vercel on its own dedicated domain (e.g. `https://r2rstudio.com`).

---

## 🚀 Quick Vercel Deployment Instructions

### 1. Environment Variable Setup
Before deploying, set the following environment variable in Vercel:

| Variable Name | Description & Example |
| :--- | :--- |
| `NEXT_PUBLIC_CRM_API_URL` | The public lead API URL of your deployed CRM backend.<br>`https://your-crm-app.vercel.app/api/marketing/leads` |

---

### 2. Deployment Steps
1. Push this `r2r-marketing` folder (or repository) to GitHub.
2. Go to [Vercel Dashboard](https://vercel.com/new).
3. Click **Add New Project** $\rightarrow$ **Import Git Repository**.
4. Select `r2r-marketing` repository.
5. In **Environment Variables**, add `NEXT_PUBLIC_CRM_API_URL`.
6. Click **Deploy**.

---

## 🌐 Routes Included
- `/`: Main R2R Public Marketing Website & Portfolio Showcase
- `/embed`: Standalone embeddable form for `<iframe>` embedding
