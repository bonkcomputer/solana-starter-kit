# Vercel Deployment Fix Guide

## Issues Fixed:

### 1. Environment Variables Missing ❌ → ✅
**Problem:** API routes failing with 404/500 errors because environment variables aren't configured in Vercel.

**Solution:** Add all environment variables to Vercel:

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project: `bcttrading`
3. Go to **Settings** → **Environment Variables**
4. Add the following variables (copy from your `.env.local`):

```
```

**Important:** Set the environment for each variable to **Production**, **Preview**, and **Development**.

### 2. Jupiter API "Could not find any route" Error ❌ → ✅
**Problem:** Swap component was initialized with `inAmount = '1'` which created tiny amounts that Jupiter couldn't route.

**Solution:** ✅ Fixed - Changed default `inAmount` from `'1'` to `''` (empty string) so users must enter an amount.

### 3. WalletConnect Metadata URL Mismatch ❌ → ✅
**Problem:** WalletConnect was using query parameters in metadata URL causing CSP violations.

**Solution:** ✅ Fixed - Added proper Content Security Policy headers in `next.config.mjs`.

### 4. Privy iframe CSP Violation ❌ → ✅
**Problem:** Privy authentication iframe was blocked by Content Security Policy.

**Solution:** ✅ Fixed - Added CSP headers allowing Privy domains.

## Deployment Steps:

1. **Add Environment Variables to Vercel** (Critical - do this first!)
   - Follow the environment variables section above
   - Make sure to set them for Production, Preview, and Development

2. **Deploy the Code Changes**
   ```bash
   git add .
   git commit -m "Fix: Vercel deployment issues - empty default swap amount, CSP headers for Privy"
   git push origin main
   ```

3. **Verify the Deployment**
   - Wait for Vercel to redeploy (should happen automatically)
   - Check the deployment logs in Vercel dashboard
   - Test the live site: https://bcttrading.vercel.app

## Expected Results After Fix:

✅ **API Routes Working:** `/api/token` should return token data instead of 404
✅ **Jupiter Quotes Working:** No more "Could not find any route" errors
✅ **Privy Authentication:** No more CSP iframe violations
✅ **WalletConnect:** No more metadata URL mismatch warnings

## Testing Checklist:

- [ ] Visit https://bcttrading.vercel.app
- [ ] Check browser console - should see fewer errors
- [ ] Try connecting a wallet - should work without CSP errors
- [ ] Enter a swap amount (like 0.1) - should get Jupiter quotes
- [ ] Token information should load properly

## Common Issues:

**If you still see errors:**

1. **Environment variables not working:**
   - Double-check they're added to Vercel
   - Make sure they're set for the right environment (Production)
   - Redeploy after adding them

2. **Still getting Jupiter errors:**
   - Make sure you're entering a reasonable amount (like 0.1, not 0.000001)
   - Check that the tokens you're trying to swap have liquidity

3. **CSP errors persist:**
   - Clear browser cache
   - Check if Vercel deployed the new `next.config.mjs`

## Priority Order:
1. **CRITICAL:** Add environment variables to Vercel (fixes API 404s)
2. **HIGH:** Deploy code changes (fixes swap and CSP issues)
3. **MEDIUM:** Test and verify everything works

The environment variables are the most critical fix - without them, your API routes won't work at all.
