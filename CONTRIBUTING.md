# Contributing to BTEA Hospitality Hub

Thank you for improving the bilingual hospitality operations and campaign-management portal.

## Before you start

- Read the [Code of Conduct](CODE_OF_CONDUCT.md).
- Search existing issues and discuss significant workflow changes first.
- Use synthetic outlet, hotel, campaign, and user data.
- Preserve English and Arabic usability, including right-to-left behavior.
- Never commit credentials, production endpoints, personal information, or licensed media.

## Local setup

Requires Node.js 18+ and npm 9+.

```bash
git clone https://github.com/112-stack/btea-hospitality-hub.git
cd btea-hospitality-hub
npm install
npm run dev
```

Before submitting a pull request, run `npm run lint`, `npm test`, and `npm run build` where supported by the change.

Useful first contributions include RTL accessibility audits, component tests, campaign fixtures, and documentation for local API mocking.
