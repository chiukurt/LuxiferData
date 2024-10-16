(function(){
  if (typeof matomoLuxiSiteId === 'undefined' || typeof matomoLuxiStatsCode === 'undefined' || typeof matomoLuxiSampleSize === 'undefined') {
    return;
  }
  
  // Matomo init & always require cookie consent
  _paq.push(['requireCookieConsent']);

  var waitForTrackerCount = 0;
  function matomoWaitForTracker() {
    if (typeof _paq === 'undefined' || typeof OnetrustActiveGroups === 'undefined') {
      if (waitForTrackerCount < 40) {
        setTimeout(matomoWaitForTracker, 250);
        waitForTrackerCount++;
        return;
      }
    } else {
      window.addEventListener('OneTrustGroupsUpdated', function (e) {
        consentSet();
      });
    }
  }

  function consentSet() {
    function getLuxiCookie(name) {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop().split(';').shift();
    }

    function setLuxiCookie(name, value) {
      const d = new Date();
      d.setTime(d.getTime() + (365 * 24 * 60 * 60 * 1000));
      document.cookie = `${name}=${value};expires=${d.toUTCString()};path=/`;
    }

    function startMatomo(){
      (function() {
        _paq.push(['setTrackerUrl', 'https://northpnd.matomo.cloud/matomo.php']);
        _paq.push(['setSiteId', matomoLuxiSiteId]);
        var d = document, g = d.createElement('script'), s = d.getElementsByTagName('script')[0];
        g.async = true; g.src = 'https://cdn.matomo.cloud/northpnd.matomo.cloud/matomo.js'; s.parentNode.insertBefore(g, s);
      })();
    }

    function startMTM(){
      function todayParam() {
        const pad = (number) => (number < 10 ? '0' : '') + number;
        const today = new Date();
        return `${today.getUTCFullYear()}-${pad(today.getUTCMonth() + 1)}-${pad(today.getUTCDate())}`;
      }
      _mtm.push({'mtm.startTime': (new Date().getTime()), 'event': 'mtm.Start'});
      (function() {
        var d = document, g = d.createElement('script'), s = d.getElementsByTagName('script')[0];
        g.async = true; g.src = 'https://cdn.matomo.cloud/northpnd.matomo.cloud/container_orKRLPJg.js?d=' + todayParam(); s.parentNode.insertBefore(g, s);
      })();
    }

    function startTracking(){
      _paq.push(['trackPageView']);
      _paq.push(['enableLinkTracking']);
      startMatomo();
      startMTM();
    }

    const inSample = (inputNum) =>
      parseInt(inputNum, 10) <= parseInt(matomoLuxiSampleSize, 10);

    if (OnetrustActiveGroups.includes(matomoLuxiStatsCode)) {
      _paq.push(["rememberCookieConsentGiven"]);
      _paq.push(["setConsentGiven"]);
      const luxiSample = getLuxiCookie("luxiSample");
      if (luxiSample && inSample(luxiSample)) {
        startTracking();
      } else if (!luxiSample) {
        const sampleGroup = Math.floor(Math.random() * 100) + 1;
        setLuxiCookie("luxiSample", sampleGroup);
        if (inSample(sampleGroup)) {
          startTracking();
        }
      }
    } else {
      _paq.push(["forgetCookieConsentGiven"]);
      _paq.push(["deleteCookies"]);
      // Even if consent is revoked, the above two need to be sent to matomo
      startMatomo();
    }
  }

  function initFakeOneTrust() {
    function fakeOneTrustInit() {
      window.OnetrustActiveGroups = [matomoLuxiStatsCode];
    }
    function fakeOneTrustUpdate() {
      var event = new CustomEvent("OneTrustGroupsUpdated", {
        detail: {
          updatedGroups: OnetrustActiveGroups,
        },
      });
      window.dispatchEvent(event);
    }
    matomoWaitForTracker();
    setTimeout(fakeOneTrustInit, 250);
    setTimeout(fakeOneTrustUpdate, 1000);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initFakeOneTrust);
  } else {
    initFakeOneTrust();
  }
})();
