# LuxiferData

Temporary repository for serving analytics script via JsDelivr CDN.

# default.js

Uses cookies to determine analytics participation.

Expects matomoLuxiSiteId, matomoLuxiSampleSize, _mtm, _paq to be set.

Simulates sync loading and blocks the page to load Matomo and Matomo tag manager scripts.

Cancels loading if it takes over 300ms and unblocks the page.

[Exhaustive list of collected analytics data](https://docs.google.com/document/d/1e4jBJxYswAGbP-nq-_3rbZiH5FqGUB7k3I6O-Yw08e0/edit?tab=t.0#heading=h.77fqjd243kyt)