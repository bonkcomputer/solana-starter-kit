# Mobile Subdomain Deployment Guide

## 🎯 Overview
This guide sets up a dedicated mobile subdomain (`mobile.bonk.computer`) for the TWA version of the app, keeping the main web app (`cc.bonk.computer`) unchanged.

## 📋 Deployment Steps

### 1. Vercel Configuration

#### Option A: Branch Deployment (Recommended)
1. **Go to Vercel Dashboard** → Your Project
2. **Settings** → **Git**
3. **Add Branch**: `solanamobileapk`
4. **Custom Domain**: Add `mobile.bonk.computer`
5. **Deploy**: Vercel will auto-deploy the `solanamobileapk` branch to the mobile subdomain

#### Option B: New Vercel Project
1. **Create New Project** in Vercel
2. **Import**: Same GitHub repo
3. **Branch**: Select `solanamobileapk`
4. **Domain**: Set to `mobile.bonk.computer`

### 2. DNS Configuration
Add a CNAME record in your DNS provider:
```
Type: CNAME
Name: mobile
Value: cname.vercel-dns.com
```

### 3. Digital Asset Links Update
After deployment, the new assetlinks.json will be available at:
```
https://mobile.bonk.computer/.well-known/assetlinks.json
```

### 4. TWA Configuration Updated
- **Host**: Changed from `cc.bonk.computer` → `mobile.bonk.computer`
- **Icons**: Updated to use mobile subdomain URLs
- **Version**: Bumped to `0.3.0`

## 🔧 Technical Changes

### Mobile-Specific Features (solanamobileapk branch)
```typescript
// PrivyClientProvider.tsx
loginMethods: ['wallet', 'email', 'twitter'],
mobileWallets: {
  enabled: true,
},
```

### Web Version Unchanged (main branch)
```typescript
// PrivyClientProvider.tsx  
loginMethods: ['wallet', 'email', 'twitter'],
// No mobileWallets config
```

## ✅ Verification Steps

1. **Web App**: `https://cc.bonk.computer` (unchanged)
2. **Mobile App**: `https://mobile.bonk.computer` (mobile features)
3. **Asset Links**: `https://mobile.bonk.computer/.well-known/assetlinks.json`
4. **APK**: Install updated APK pointing to mobile subdomain

## 🚀 Next Steps After Deployment

1. **Test mobile subdomain** in browser
2. **Verify asset links** are accessible
3. **Rebuild and install** updated APK
4. **Test wallet connections** in mobile app

## 🔄 Rollback Strategy
If issues occur:
1. **Revert TWA manifest** to `cc.bonk.computer`
2. **Rebuild APK** with original configuration
3. **Mobile subdomain** can remain for future use

## 📱 Mobile App Benefits
- ✅ Dedicated mobile wallet configuration
- ✅ Twitter login option for mobile users
- ✅ Mobile-specific optimizations possible
- ✅ No impact on web users
- ✅ Independent deployment cycles