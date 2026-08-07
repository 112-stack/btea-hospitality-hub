# 2026 App Store and Google Play readiness

Profile date: 7 August 2026

This repository is prepared as an **independent government-information companion**, not an official BTEA application. Store approval is controlled by Apple and Google and cannot be guaranteed by source code alone. Signing identities, verified developer-account information, final review questionnaires, and live store submission remain release-owner actions.

## Policy-to-evidence matrix

| Requirement | 2026 rule | Repository evidence | State |
| --- | --- | --- | --- |
| Android target API | New apps and updates must target Android 16 / API 36 from 31 August 2026 | `android/variables.gradle` uses `compileSdkVersion = 36` and `targetSdkVersion = 36` | Ready |
| Apple SDK | App Store uploads since 28 April 2026 must use Xcode 26 and an iOS 26-family SDK | Capacitor 8.5 iOS project is generated; archive must be produced on a Mac with Xcode 26 | Build host required |
| Minimum functionality | Apple 4.2 and Google minimum-functionality rules reject a repackaged or low-value website | Bundled searchable catalog, persistent applications, offline checklists, document metadata, inspections, payments readiness, outlets, complaints, privacy controls, haptics, and network-aware UI | Ready |
| Government information | Unaffiliated apps must identify sources and clearly disclaim government representation | In-app independent disclaimer, official source per service, store descriptions, government-app declaration, and non-government icon/name | Ready |
| Impersonation | App name, icon, screenshots, and description must not imply official affiliation | `Hospitality Services Companion`; original compass/checklist store icon; explicit non-affiliation text; source-attributed BTEA wordmark is limited to the preserved public-directory content | Ready |
| Privacy policy | Both stores require a discoverable privacy policy, even when no data is collected | `PRIVACY.md`, in-app `/privacy`, store URL metadata | Ready after repository push |
| Apple privacy manifest | Collected data and required-reason API use must be declared | `ios/App/App/PrivacyInfo.xcprivacy`; Capacitor SDK manifests remain bundled through SPM | Ready; validate in Xcode archive |
| Google Data safety | Every published app must complete Data safety, including no-collection apps | `store/google-play/data-safety.json` | Ready for console entry |
| Age/content rating | Apple requires the updated age-rating questions; Google requires IARC | Templates select 4+ / Everyone and document no UGC, gambling, violence, or mature content | Console entry required |
| Permissions | Sensitive permissions must be necessary, disclosed, and minimized | Android declares only `INTERNET`; no camera, location, microphone, contacts, storage, ads, or notifications | Ready |
| Transport/storage | Protect user data and avoid unnecessary backup | Android cleartext disabled and backups disabled; native working data stays local | Ready |
| Store assets | Original icons and truthful screenshots | Generated Android adaptive icons, iOS 1024 icon, splash assets, and `store/screenshots` output | Ready after final screenshot capture |
| Versioning | Every upload needs monotonically increasing versions | Android `versionCode 210`, iOS build `210`, marketing version `2.1.0` | Ready |

## Authoritative policy sources

- Apple App Review Guidelines: https://developer.apple.com/app-store/review/guidelines/
- Apple upcoming requirements: https://developer.apple.com/news/upcoming-requirements/
- Apple privacy manifests: https://developer.apple.com/documentation/bundleresources/privacy-manifest-files
- Google Play target API requirements: https://support.google.com/googleplay/android-developer/answer/11926878
- Google government-information apps: https://support.google.com/googleplay/android-developer/answer/9514050
- Google impersonation policy: https://support.google.com/googleplay/android-developer/answer/9888374
- Google Data safety: https://support.google.com/googleplay/android-developer/answer/10787469
- Google webview/repetitive-content policy: https://support.google.com/googleplay/android-developer/answer/9899034

## Release-owner actions before upload

1. Push `PRIVACY.md` so the metadata privacy URL resolves publicly.
2. Replace the developer-name field if the verified Apple/Google account uses a different legal identity.
3. Build and archive iOS on macOS with Xcode 26, select the verified team, validate the privacy report, and upload through App Store Connect.
4. Build the signed Android App Bundle with the release keystore or Play App Signing and upload it to a test track.
5. Enter the supplied privacy, Data safety, government-information, content-rating, and review-note templates in the consoles.
6. Run TestFlight and Play closed testing on physical phones, then replace any screenshot that does not match the final signed binary.
7. Do not describe the app as official or promote the source-attributed BTEA wordmark into the app icon, store identity, or marketing artwork without written authorization.
