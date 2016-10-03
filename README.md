## Menagerie 2.0 Companion Application

<div style="text-align:center"><img src="menagerie-frontend.png"/></div>

### Development

#### Desktop

```
npm install -g monaca
monaca preview
```

#### iOS Emulator

**ACHTUNG**
Normally one would add `iOS` as the platform under Cordova, however at the time
of writing the Cordova project has not yet released a version compatible with 
iOS 10/Xcode 8.

A fix has been committed to `cordova-ios`, and can be incorporated using the
instructions below:

```
npm install -g cordova
cordova platform add https://github.com/apache/cordova-ios.git
cordova plugin add cordova-plugin-console
cordova plugin add phonegap-plugin-barcodescanner
cordova plugin add cordova-plugin-whitelist
cordova build ios
```

#### iOS Hardware

Launch Xcode, open `platforms/ios` as an existing project, select your iOS 
device from the dropdown, and select the build/deploy button.
