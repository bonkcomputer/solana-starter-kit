# TWA Conversion Guide for Solana Mobile

## ✅ PWA Compliance Status

### **Completed:**

- ✅ Service Worker (`public/sw.js`)
- ✅ Web Manifest (`public/manifest.json`) - **NEW**
- ✅ Theme color meta tag
- ✅ Viewport meta tag
- ✅ Apple touch icon
- ✅ PWA manifest link

### **Ready for TWA Conversion!**

## 🚀 Step-by-Step TWA Conversion Process

### **Step 1: Install Bubblewrap CLI**

```bash
# Install Bubblewrap CLI globally
npm i -g @bubblewrap/cli

# Verify installation
bubblewrap --version
```

### **Step 2: Create TWA Project Directory**

```bash
# Create directory for TWA project
mkdir bonkcomputer-twa
cd bonkcomputer-twa

# Initialize TWA project with your web manifest
bubblewrap init --manifest https://cc.bonk.computer/manifest.json
```

**Expected Output:**

```bash
? What is the package ID for your app? (com.example.app) com.bonkcomputer.mobile
? What is the name of your app? BonkComputer Mobile
? What is the launcher name for your app? BonkComputer
? What is the display mode for your app? (standalone, fullscreen, minimal-ui) standalone
? What is the theme color for your app? #000000
? What is the navigation color for your app? #000000
? What is the background color for your app? #000000
? What is the splash screen background color? #000000
? What is the splash screen icon? /bctlogo.png
? What is the keystore path? (android.keystore) android.keystore
? What is the keystore password? [hidden]
? What is the key alias? (android) android
? What is the key password? [hidden]
```

### **Step 3: Configure Build Settings**

Edit `android/app/build.gradle` to add supported languages:

```gradle
android {
    defaultConfig {
        ...
        resConfigs "en" // Add other languages as needed
    }
}
```

### **Step 4: Build the APK**

```bash
# Build signed release APK
bubblewrap build
```

**Expected Output:**

```bash
Building APK...
APK built successfully: app-release-signed.apk
```

### **Step 5: Generate Digital Asset Links**

```bash
# Generate SHA256 fingerprint from keystore
keytool -list -v -keystore android.keystore

# Copy the SHA256 fingerprint and add it to TWA manifest
bubblewrap fingerprint add <SHA256_FINGERPRINT>

# Generate assetlinks.json file
bubblewrap fingerprint generateAssetLinks
```

### **Step 6: Deploy Digital Asset Links**

Upload the generated `assetlinks.json` to:

```bash
https://cc.bonk.computer/.well-known/assetlinks.json
```

**Example assetlinks.json:**

```json
[{
  "relation": ["delegate_permission/common.handle_all_urls"],
  "target": {
    "namespace": "android_app",
    "package_name": "com.bonkcomputer.mobile",
    "sha256_cert_fingerprints": ["YOUR_SHA256_FINGERPRINT"]
  }
}]
```

### **Step 7: Test the APK**

```bash
# Install on connected device or emulator
bubblewrap install app-release-signed.apk

# Or install manually
adb install app-release-signed.apk
```

## 📱 Solana Mobile Integration

### **Step 8: Test on Solana Mobile Device**

1. **Install APK on Solana Mobile device**
2. **Test wallet connection** - ensure Privy works in TWA
3. **Test trading functionality** - verify Jupiter integration
4. **Test deep linking** - ensure wallet connections work
5. **Test offline functionality** - verify service worker caching

### **Step 9: Optimize for Mobile**

Update your web app for better mobile experience:

```typescript
// Add mobile-specific meta tags
<meta name="mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
```

## 🏪 Publishing to Solana Mobile Store

### **Step 10: Prepare App Store Assets**

Create the following assets:

- **App Icon**: 512x512 PNG
- **Screenshots**: 5-8 screenshots of key features
- **App Description**: Compelling description
- **Privacy Policy**: Hosted at accessible URL
- **Terms of Service**: Hosted at accessible URL

### **Step 11: Submit to Solana Mobile Store**

1. **Create developer account** on Solana Mobile
2. **Upload APK** to app store
3. **Fill in app information**:
   - Name: BonkComputer Mobile
   - Category: Finance
   - Description: [Your app description]
   - Screenshots: [Your screenshots]
4. **Submit for review**

## 🔧 Troubleshooting

### **Common Issues:**

1. **Browser UI shows instead of full screen:**
   - Verify Digital Asset Links are deployed correctly
   - Check SHA256 fingerprint matches keystore

2. **Wallet connection doesn't work:**
   - Test on Solana Mobile device
   - Verify Privy configuration works in TWA

3. **App crashes on startup:**
   - Check manifest.json is accessible
   - Verify all required assets are cached

4. **Performance issues:**
   - Optimize service worker caching
   - Reduce bundle size

### **Testing Checklist:**

- [ ] App launches without browser UI
- [ ] Wallet connection works
- [ ] Trading functionality works
- [ ] Offline functionality works
- [ ] Deep linking works
- [ ] App icons display correctly
- [ ] Splash screen shows correctly

## 📋 Final Checklist

### **Before Publishing:**

- [ ] PWA manifest is accessible at `/manifest.json`
- [ ] Service worker is registered and working
- [ ] Digital Asset Links are deployed
- [ ] APK is signed and tested
- [ ] App works on Solana Mobile device
- [ ] All features work in TWA environment
- [ ] Privacy policy and terms are hosted
- [ ] App store assets are prepared

### **Publishing Steps:**

- [ ] Create Solana Mobile developer account
- [ ] Upload signed APK
- [ ] Fill in app store information
- [ ] Submit for review
- [ ] Monitor review status
- [ ] Respond to any feedback
- [ ] Publish when approved

## 🎯 Success Metrics

### **Technical Metrics:**

- App startup time < 3 seconds
- Wallet connection success rate > 95%
- Offline functionality works
- No browser UI visible

### **User Experience:**

- Native app feel
- Smooth navigation
- Fast loading times
- Reliable wallet integration

## 📚 Resources

- [Solana Mobile PWA Publishing Guide](https://docs.solanamobile.com/dapp-publishing/publishing-a-pwa)
- [Bubblewrap CLI Documentation](https://github.com/GoogleChromeLabs/bubblewrap)
- [Trusted Web Activities](https://developers.google.com/web/android/trusted-web-activity)
- [PWA Best Practices](https://web.dev/progressive-web-apps/)

## 🚀 Next Steps

1. **Deploy your updated web app** with the new manifest
2. **Run the TWA conversion** using the steps above
3. **Test thoroughly** on Solana Mobile device
4. **Submit to Solana Mobile store**
5. **Monitor and optimize** based on user feedback

This approach will get your app on Solana Mobile in days instead of weeks, while maintaining all your existing functionality!
