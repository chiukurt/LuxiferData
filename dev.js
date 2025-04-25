(function(){
  if (typeof matomoLuxiSiteId === 'undefined' || typeof matomoLuxiSampleSize === 'undefined') {
    return;
  }

  _paq.push(['requireConsent']);
  (function () {
    _paq.push(["setTrackerUrl", "https://analytics.luxifer.app/matomo.php"]);
    _paq.push(['setSiteId', matomoLuxiSiteId]);
    var d = document, g = d.createElement("script"), s = d.getElementsByTagName("script")[0];
    g.async = true; g.src = "https://analytics.luxifer.app/matomo.js";

    let loaded = false;

    g.onload = () => {
      clearTimeout(timeout);
      loaded = true;
      const tests = [
        {
          name: "Test_royod",
          url: "https://chiukurt.github.io/",
          type: "simple_text",
          data: "AB Test alternate",
        },
      ];
      tests.forEach((test) => {
        const { name, url, type, data } = test;
        _paq.push(["AbTesting::create", {
            name: name,
            includedTargets: [{ attribute: "url", type: "starts_with", value: url, inverted: "0" }],
            excludedTargets: [],
            variations: [
              {
                name: "original",
                activate: function (event) {
                  document.documentElement.classList.remove("ab-test-loading");
                },
              },
              {
                name: "test",
                activate: function (event) {
                  if (type === "simple_text") {
                    document.getElementById("ab-element").innerText = data;
                    document.documentElement.classList.remove("ab-test-loading");
                  }
                },
              },
            ],
          },
        ]);
      });
    };
    
    g.onerror = () => {
      clearTimeout(timeout);
      document.documentElement.classList.remove('ab-test-loading');
    };

    const timeout = setTimeout(() => {
      if (!loaded) {
        document.documentElement.classList.remove('ab-test-loading');
        g.remove(); 
        console.log("Loading took 5, A/B test not loaded.");
      }
    }, 5000); 

    s.parentNode.insertBefore(g, s);
  })();

  function startMTM(){
    function todayParam() {
      const pad = (number) => (number < 10 ? '0' : '') + number;
      const today = new Date();
      return `${today.getUTCFullYear()}-${pad(today.getUTCMonth() + 1)}-${pad(today.getUTCDate())}`;
    }
    _mtm.push({'mtm.startTime': (new Date().getTime()), 'event': 'mtm.Start'});
    (function() {
      var d = document, g = d.createElement('script'), s = d.getElementsByTagName('script')[0];
      g.async = true; g.src = 'https://analytics.luxifer.app/js/container_orKRLPJg.js?d=' + todayParam(); s.parentNode.insertBefore(g, s);
    })();
  }

  function startTracking(){
    _paq.push(['trackPageView']);
    _paq.push(['enableLinkTracking']);
    startMTM();
  }

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

  const inSample = (inputNum) =>
    parseInt(inputNum, 10) <= parseInt(matomoLuxiSampleSize, 10);

  let luxiSample = getLuxiCookie("luxiSample");
  if (!luxiSample) {
    luxiSample = Math.floor(Math.random() * 100) + 1;
    setLuxiCookie("luxiSample", luxiSample);
  }
  if (inSample(luxiSample)) { 
    _paq.push(["setConsentGiven"]);
    _paq.push(["rememberConsentGiven"]);
    startTracking();
  }
})();
