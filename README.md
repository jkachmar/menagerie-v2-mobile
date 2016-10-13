## Menagerie 2.0 Mobile App

<div style="text-align:center"><img src="images/menagerie-frontend.png"/></div>

This is the mobile companion to the upcoming [Menagerie v2] device management
system. The app is meant to provide a proof-of-concept for interacting with
Menagerie's new features, as well as a test of rapid prototyping simple CRUD
apps with [Cordova] and [Onsen UI].

[Menagerie v2]: https://github.com/goliatone/menagerie
[Cordova]: https://cordova.apache.org/
[Onsen UI]: https://onsen.io/

<!-- markdown-toc start - Don't edit this section. Run M-x markdown-toc-generate-toc again -->
**Table of Contents**

- [Development](#development)
    - [Prerequisites](#prerequisites)
    - [Desktop](#desktop)
    - [iOS Emulator](#ios-emulator)
    - [iOS Hardware](#ios-hardware)

<!-- markdown-toc end -->


### Development

#### Prerequisites

Ensure that the following tools are installed:

- git
- Xcode 8.x
- npm

#### Desktop

The application can easily be run in-browser with the following:

    npm install -g monaca
    monaca preview

Note that most features will not work as-expected due to CORS limitations.
The iOS Emulator should be used to test any app features that depend on access
to the Menagerie backend.

#### iOS Emulator

    npm install -g cordova
    cordova platform add ios
    cordova plugin add cordova-plugin-console
    cordova plugin add phonegap-plugin-barcodescanner
    cordova plugin add cordova-plugin-whitelist
    cordova build ios

If the above completes without error, then run `cordova emulate ios --list`. 
This produces a list of valid iOS emulators on your system; choose one and then
run the following:

    cordova emulate ios --target="<iOS Device>"

... where `<iOS Device>` is a member of the previous list of available 
emulators.

#### iOS Hardware

Unfortunately, building for iOS hardware is quite complex at this time. For 
check the [DOCUMENTATION] for detailed instructions on how to do so.

[DOCUMENTATION]: DOCUMENTATION.md
