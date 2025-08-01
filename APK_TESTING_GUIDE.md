# APK Testing Guide - BonkComputer Mobile

## 📱 **Testing Your APK**

### **Prerequisites**

- Android device or emulator (Android 5.0+ / API level 21+)
- USB debugging enabled (for physical device)
- ADB (Android Debug Bridge) installed
- Solana Mobile device (recommended for full testing)

## 🔧 **Installation Methods**

### **Method 1: ADB Installation (Recommended)**

```bash
# Navigate to the TWA directory
cd bonkcomputer-twa

# Check connected devices
adb devices

# Install APK on connected device
adb install app-release-signed.apk

# If installation fails, try force install
adb install -r app-release-signed.apk
```

### **Method 2: Manual Installation**

1. Copy `app-release-signed.apk` to your Android device
2. Enable "Install from Unknown Sources" in device settings
3. Use a file manager to locate and tap the APK file
4. Follow installation prompts

### **Method 3: Emulator Testing**

```bash
# Start Android emulator (if available)
emulator -avd [your-avd-name]

# Install APK on emulator
adb install app-release-signed.apk
```

## ✅ **Testing Checklist**

### **1. App Launch & Basic Functionality**

- [ ] App launches without crashing
- [ ] Splash screen displays correctly
- [ ] No browser UI visible (full-screen TWA experience)
- [ ] App icon appears correctly in launcher
- [ ] App name displays as "BonkComputer"

### **2. Wallet Integration**

- [ ] Wallet connection button appears
- [ ] Tapping wallet connection opens Solana wallet
- [ ] Wallet successfully connects
- [ ] Wallet address displays correctly
- [ ] Wallet balance shows (if available)
- [ ] Disconnect wallet functionality works

### **3. Core Features**

- [ ] Navigation between screens works
- [ ] Trading interface loads
- [ ] Token selection works
- [ ] Price data displays
- [ ] Portfolio view functions
- [ ] Profile creation/editing works
- [ ] Points system displays

### **4. Performance**

- [ ] App startup time < 3 seconds
- [ ] Smooth navigation between screens
- [ ] No lag or stuttering
- [ ] Memory usage reasonable
- [ ] Battery usage optimized

### **5. Network & Offline**

- [ ] App works with internet connection
- [ ] Graceful handling of network loss
- [ ] Offline features work as expected
- [ ] App reconnects when network restored

### **6. Security**

- [ ] Biometric authentication works (if available)
- [ ] Secure wallet connection
- [ ] No sensitive data stored locally
- [ ] Proper error handling for failed connections

### **7. UI/UX**

- [ ] Dark theme displays correctly
- [ ] Text is readable and properly sized
- [ ] Buttons and interactive elements work
- [ ] Responsive design on different screen sizes
- [ ] Proper loading states and animations

### **8. Device Compatibility**

- [ ] Works on Solana Mobile device
- [ ] Works on standard Android devices
- [ ] Compatible with different screen sizes
- [ ] Handles device rotation properly

## 🐛 **Common Issues & Solutions**

### **Issue: Browser UI Visible**

**Cause**: Digital Asset Links not properly configured
**Solution**: 

1. Verify `assetlinks.json` is deployed at `https://cc.bonk.computer/.well-known/assetlinks.json`
2. Check SHA256 fingerprint matches keystore
3. Ensure domain matches exactly

### **Issue: Wallet Connection Fails**

**Cause**: Wallet app not installed or incompatible

**Solution**:

1. Install a compatible Solana wallet (Phantom, Solflare, etc.)
2. Ensure wallet app is updated
3. Check Solana Mobile Stack compatibility

### **Issue: App Crashes on Startup**

**Cause**: Missing dependencies or configuration
**Solution**:

1. Check device Android version (5.0+ required)
2. Clear app data and cache
3. Reinstall APK

### **Issue: Features Not Loading**

**Cause**: Network connectivity or API issues
**Solution**:

1. Check internet connection
2. Verify API endpoints are accessible
3. Check for any CORS or network policy issues

## 📊 **Performance Testing**

### **Startup Time Test**

```bash
# Measure app startup time
adb shell am start -W -n com.bonkcomputer.mobile/.MainActivity

# Expected: TotalTime < 3000ms
```

### **Memory Usage Test**

```bash
# Check memory usage
adb shell dumpsys meminfo com.bonkcomputer.mobile

# Expected: PSS Total < 200MB
```

### **Battery Usage Test**

```bash
# Monitor battery usage
adb shell dumpsys batterystats com.bonkcomputer.mobile
```

## 🔍 **Debug Information**

### **View App Logs**

```bash
# View real-time logs
adb logcat | grep -i bonkcomputer

# Save logs to file
adb logcat > app_logs.txt
```

### **Check App Info**

```bash
# Get app package info
adb shell dumpsys package com.bonkcomputer.mobile

# Check installed version
adb shell pm list packages -f | grep bonkcomputer
```

### **Network Debugging**

```bash
# Check network connectivity
adb shell ping cc.bonk.computer

# Test API endpoints
adb shell curl -I https://cc.bonk.computer/manifest.json
```

## 📱 **Device-Specific Testing**

### **Solana Mobile (Saga)**

- [ ] Native wallet integration works
- [ ] Seed Vault compatibility
- [ ] dApp Store discovery features
- [ ] Hardware security features

### **Standard Android Devices**

- [ ] Third-party wallet integration
- [ ] WalletConnect functionality
- [ ] Standard Android features

## 📝 **Test Report Template**

### **Device Information**

- Device Model: _______________
- Android Version: _______________
- Screen Resolution: _______________
- Available RAM: _______________
- Wallet App: _______________

### **Test Results**

- App Launch: ✅/❌
- Wallet Connection: ✅/❌
- Core Features: ✅/❌
- Performance: ✅/❌
- UI/UX: ✅/❌

### **Issues Found**

1. Issue: _______________
   Severity: Critical/High/Medium/Low
   Steps to Reproduce: _______________

2. Issue: _______________
   Severity: Critical/High/Medium/Low
   Steps to Reproduce: _______________

### **Overall Assessment**

- Ready for Store Submission: Yes/No
- Recommended Actions: _______________

## 🚀 **Pre-Submission Testing**

### **Final Checklist**

- [ ] All critical features work correctly
- [ ] No crashes or major bugs
- [ ] Performance meets requirements
- [ ] UI/UX is polished and intuitive
- [ ] Legal documents are accessible
- [ ] App store assets are ready
- [ ] Digital Asset Links are deployed

### **Stress Testing**

- [ ] Test with poor network conditions
- [ ] Test with low device storage
- [ ] Test with background apps running
- [ ] Test rapid user interactions
- [ ] Test edge cases and error conditions

## 📞 **Support & Feedback**

If you encounter issues during testing:

1. **Check logs** using the debug commands above
2. **Document the issue** with steps to reproduce
3. **Contact support** at support@bonk.computer
4. **Community help** via Discord or social channels

## 🎯 **Success Criteria**

Your APK is ready for store submission when:

- ✅ All core features work without crashes
- ✅ Wallet integration is seamless
- ✅ Performance meets target metrics
- ✅ UI/UX provides good user experience
- ✅ No critical bugs or security issues
- ✅ Digital Asset Links work correctly

**Happy Testing!** 🎉