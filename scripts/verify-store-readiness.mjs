import { access, readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const failures = [];
const passes = [];
const warnings = [];

const text = async (relativePath) => readFile(path.join(root, relativePath), 'utf8');
const json = async (relativePath) => JSON.parse(await text(relativePath));
const expect = (condition, label) => {
  if (condition) passes.push(label);
  else failures.push(label);
};

const capacitor = await text('capacitor.config.json');
const androidVariables = await text('android/variables.gradle');
const androidBuild = await text('android/app/build.gradle');
const androidManifest = await text('android/app/src/main/AndroidManifest.xml');
const iosInfo = await text('ios/App/App/Info.plist');
const iosPrivacy = await text('ios/App/App/PrivacyInfo.xcprivacy');
const iosProject = await text('ios/App/App.xcodeproj/project.pbxproj');
const apple = await json('store/app-store/metadata.json');
const applePrivacy = await json('store/app-store/app-privacy.json');
const play = await json('store/google-play/metadata.json');
const dataSafety = await json('store/google-play/data-safety.json');
const privacyPolicy = await text('PRIVACY.md');

expect(capacitor.includes('"appId": "app.hospitality.companion"'), 'Independent native package identifier');
expect(capacitor.includes('"webDir": "dist-mobile"'), 'Dedicated bundled native web directory');
expect(androidVariables.includes('compileSdkVersion = 36') && androidVariables.includes('targetSdkVersion = 36'), 'Android 16 / API 36 compile and target');
expect(androidBuild.includes('versionCode 210') && androidBuild.includes('versionName "2.1.0"'), 'Android monotonic version 210 / 2.1.0');
expect(androidBuild.includes('minifyEnabled true') && androidBuild.includes('shrinkResources true'), 'Android release shrinking enabled');
expect(androidManifest.includes('android:allowBackup="false"') && androidManifest.includes('android:usesCleartextTraffic="false"'), 'Android backup and cleartext hardening');

const forbiddenPermissions = ['CAMERA', 'RECORD_AUDIO', 'ACCESS_FINE_LOCATION', 'ACCESS_COARSE_LOCATION', 'READ_CONTACTS', 'READ_MEDIA_IMAGES', 'READ_EXTERNAL_STORAGE', 'POST_NOTIFICATIONS', 'AD_ID'];
expect(forbiddenPermissions.every((permission) => !androidManifest.includes(`android.permission.${permission}`)), 'No undeclared sensitive Android permissions');
expect(iosInfo.includes('<key>ITSAppUsesNonExemptEncryption</key>') && iosInfo.includes('<false/>'), 'Apple export-compliance flag present');
expect(iosPrivacy.includes('<key>NSPrivacyTracking</key>') && iosPrivacy.includes('<key>NSPrivacyCollectedDataTypes</key>'), 'Apple privacy manifest declares no tracking or collection');
expect(iosProject.includes('PrivacyInfo.xcprivacy in Resources'), 'Apple privacy manifest is in the Xcode resources phase');
expect(iosProject.includes('CURRENT_PROJECT_VERSION = 210;') && iosProject.includes('MARKETING_VERSION = 2.1.0;'), 'iOS build 210 / marketing 2.1.0');

expect(apple.name.length <= 30 && apple.subtitle.length <= 30 && apple.keywords.length <= 100, 'App Store text field limits');
expect(play.title.length <= 30 && play.shortDescription.length <= 80, 'Google Play title and short-description limits');
expect(apple.description.includes('not operated by, affiliated with, or endorsed by BTEA'), 'App Store non-affiliation disclosure');
expect(play.fullDescription.includes('not operated by, affiliated with, or endorsed by BTEA'), 'Google Play non-affiliation disclosure');
expect(apple.privacyPolicyUrl.startsWith('https://') && play.privacyPolicyUrl.startsWith('https://'), 'HTTPS privacy policy URLs');
expect(applePrivacy.tracking === false && applePrivacy.dataCollected === false, 'Apple App Privacy no-collection answers');
expect(dataSafety.collectsUserData === false && dataSafety.sharesUserData === false, 'Google Data safety no-collection answers');
expect(privacyPolicy.includes('not operated by, affiliated with, or endorsed by'), 'Public privacy policy contains independent identity');

for (const asset of [
  'ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png',
  'android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png',
]) {
  try {
    await access(path.join(root, asset));
    expect((await stat(path.join(root, asset))).size > 4096, `Generated native asset: ${asset}`);
  } catch {
    expect(false, `Generated native asset: ${asset}`);
  }
}

try {
  await access(path.join(root, 'store/screenshots/mobile-app-services.png'));
  passes.push('Mobile app screenshot artifact');
} catch {
  warnings.push('Capture store/screenshots/mobile-app-services.png after browser QA.');
}

if (String(play.supportEmail).startsWith('Use the verified')) warnings.push('Replace the Play support-email instruction with the verified developer-account support email in Play Console.');
warnings.push('Archive iOS with Xcode 26 on macOS and validate the generated App Privacy Report before upload.');
warnings.push('Sign the Android App Bundle with the release owner key or Play App Signing before upload.');

console.log(`Store readiness: ${passes.length} checks passed, ${failures.length} failed, ${warnings.length} release-owner notes.`);
for (const item of passes) console.log(`PASS  ${item}`);
for (const item of failures) console.error(`FAIL  ${item}`);
for (const item of warnings) console.warn(`NOTE  ${item}`);

if (failures.length) process.exitCode = 1;
