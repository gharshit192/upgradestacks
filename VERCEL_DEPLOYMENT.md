# Vercel Deployment Guide for UpgradeStacks

## Prerequisites
- GitHub repo connected to Vercel
- Supabase project with database tables and data
- Domain (optional, uses vercel.app by default)

---

## Step 1: Connect GitHub to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Click "Add New" → "Project"
4. Import the repository: `https://github.com/gharshit192/upgradestacks.git`
5. Vercel auto-detects Next.js project

---

## Step 2: Configure Environment Variables in Vercel

In Vercel Dashboard → Project Settings → Environment Variables, add:

### Production Variables

| Variable | Value | Notes |
|----------|-------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://wlalgleepkdvtebmfxfn.supabase.co` | Public URL from Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `sb_publishable_Jeb5CmiC5xou60eijYSMcQ_T-Vmwndj` | Anon key from Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | [Get from Supabase Settings] | **KEEP SECRET** - Backend only |
| `NEXT_PUBLIC_SITE_URL` | `https://upgradestacks.vercel.app` | Or your custom domain |
| `REVALIDATE_SECRET` | [Generate strong random secret] | For ISR revalidation |

**Where to find Supabase credentials:**
- Go to Supabase Dashboard → Project → Settings → API
- Copy `Project URL` and `Anon Public Key`
- For Service Role Key: Settings → API → Service Role Secret

### Optional Variables

```
RESEND_API_KEY=re_your_key_here          # For email notifications
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX           # For Google Analytics
```

---

## Step 3: Deploy

### Option A: Auto-Deploy (Recommended)
- Every push to `master` branch auto-deploys to production
- Vercel shows build status in GitHub PR comments

### Option B: Manual Deploy
```bash
npm i -g vercel
vercel --prod
```

---

## Step 4: Verify Deployment

After deployment completes:

1. Check Vercel deployment logs for errors
2. Visit `https://upgradestacks.vercel.app` (or your domain)
3. Test:
   - Homepage loads with all 8 categories
   - Category links work (e.g., `/category/finance`)
   - Profession pages load (e.g., `/stack/graphic-designer`)
   - Tools display correctly

---

## Step 5: Custom Domain (Optional)

In Vercel → Project Settings → Domains:
1. Add your domain (e.g., `upgradestacks.com`)
2. Follow DNS configuration steps
3. Update `NEXT_PUBLIC_SITE_URL` in environment variables

---

## Troubleshooting

### Build Fails with "Module not found"
**Solution:** Check `tsconfig.json` has path aliases correctly configured
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {"@/*": ["./*"]}
  }
}
```

### CSS Not Loading in Production
**Solution:** Ensure `postcss.config.js` exists with Tailwind config

### Pages Return 404 in Production
**Solution:** Check ISR settings in `next.config.js` and ensure build completes fully

### Database Connection Failed
**Solution:** 
- Verify `SUPABASE_SERVICE_ROLE_KEY` is set correctly
- Check Supabase database hasn't run out of quota
- Ensure Row Level Security (RLS) policies allow read access

---

## ISR Configuration

UpgradeStacks uses Incremental Static Regeneration (ISR):

- **Homepage:** Revalidates every 24 hours
- **Profession pages:** Revalidates every 24 hours
- **Category pages:** Revalidates every 24 hours

To manually trigger revalidation:
```bash
curl -X POST "https://upgradestacks.vercel.app/api/revalidate?secret=YOUR_SECRET&path=/stack/graphic-designer"
```

Replace `YOUR_SECRET` with your `REVALIDATE_SECRET`.

---

## Production Checklist

- [ ] All environment variables set in Vercel
- [ ] Homepage displays all 8 categories
- [ ] Category links work without "Stack Not Found" errors
- [ ] Profession pages load with tools
- [ ] Tools display with pricing and links
- [ ] Search functionality works
- [ ] Submit tool form functions
- [ ] Footer links work
- [ ] Analytics (if using Google Analytics) configured

---

## Build Configuration

The `vercel.json` file contains:
- **buildCommand:** `npm run build`
- **installCommand:** `npm ci`
- **outputDirectory:** `.next`
- **buildImage:** Latest Next.js builder
- **regions:** Mumbai (bom1) - Optional, remove to use global

To change region, edit `vercel.json` and redeploy.

---

## Monitoring

In Vercel Dashboard:
- Monitor build logs
- Check edge function performance
- Review error logs
- Track deployments history

---

## Support

For deployment issues:
- Check Vercel docs: https://vercel.com/docs/nextjs
- Check Next.js docs: https://nextjs.org/docs
- Review build logs in Vercel dashboard
