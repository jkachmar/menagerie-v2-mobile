## Menagerie 2.0 Companion Application

<div style="text-align:center"><img src="menagerie-frontend.png"/></div>

### Development

#### Desktop

```
npm install -g monaca
monaca preview
```

#### iOS Emulator

```
npm install -g cordova
cordova platform add ios
cordova plugin add cordova-plugin-console
cordova plugin add phonegap-plugin-barcodescanner
cordova plugin add cordova-plugin-whitelist
cordova build ios
```
