# LuxiferData

Temporary repository for serving analytics script via JsDelivr CDN.

# default.js

- Uses cookies to determine analytics participation.
- Expects matomoLuxiSiteId, matomoLuxiSampleSize, _mtm, _paq to be set.

# abtest.js

- Same as above, but additionally does the following:
- Supports A/B testing based on the variations clients have designed on https://www.luxifer.app/
- Simulates sync loading and hides the page to load Matomo, Matomo tag manager scripts, and ab test data. (does not block loading, only simulates sync loading but is async)
- Cancels loading if it takes over 300~500ms and unhides the page.
- Downloads tests and if consent is given, applies them to the page and tracks with Matomo.
- Additionally, validates tests, calculates segmentation, exposes global helper functions.

# dev.js

Development testing for script delivery workflow

[Exhaustive list of collected analytics data viewable on our Privacy Policy](https://luxifer.digitalrise.be/privacy-policy/#3)
