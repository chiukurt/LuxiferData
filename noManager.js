(function () {
  if (
    typeof matomoLuxiSiteId === "undefined" ||
    typeof matomoLuxiSampleSize === "undefined"
  ) {
    return;
  }

  var _paq = (window._paq = window._paq || []);
  function startTracking() {
    _paq.push(["trackPageView"]);
    _paq.push(["enableLinkTracking"]);
    (function () {
      _paq.push(["setTrackerUrl", "https://northpnd.matomo.cloud/matomo.php"]);
      _paq.push(["setSiteId", matomoLuxiSiteId]);
      var d = document,
        g = d.createElement("script"),
        s = d.getElementsByTagName("script")[0];
      g.async = true;
      g.src = "https://cdn.matomo.cloud/northpnd.matomo.cloud/matomo.js";
      s.parentNode.insertBefore(g, s);
    })();
    function todayParam() {
      const pad = (number) => (number < 10 ? "0" : "") + number;
      const today = new Date();
      return `${today.getUTCFullYear()}-${pad(today.getUTCMonth() + 1)}-${pad(
        today.getUTCDate(),
      )}`;
    }
    var _mtm = (window._mtm = window._mtm || []);
    _mtm.push({ "mtm.startTime": new Date().getTime(), event: "mtm.Start" });
    (function () {
      var d = document,
        g = d.createElement("script"),
        s = d.getElementsByTagName("script")[0];
      g.async = true;
      g.src =
        "https://cdn.matomo.cloud/northpnd.matomo.cloud/container_Vf5DjWja.js?d=" +
        todayParam();
      s.parentNode.insertBefore(g, s);
    })();
  }

  const luxiSample = getLuxiCookie("luxiSample");
  if (luxiSample && luxiSample <= matomoLuxiSampleSize) {
    startTracking();
  } else if (!luxiSample) {
    const sampleGroup = Math.floor(Math.random() * 100) + 1;
    setLuxiCookie("luxiSample", sampleGroup);
    if (sampleGroup <= matomoLuxiSampleSize) {
      startTracking();
    }
  }

  function getLuxiCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
  }

  function setLuxiCookie(name, value) {
    const d = new Date();
    d.setTime(d.getTime() + 365 * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${value};expires=${d.toUTCString()};path=/`;
  }
})();
