async function luxiDataTracking() {
  const CLICKABLE_TAGS = [
    "A",
    "BUTTON",
    "AREA",
    "SELECT",
    "TEXTAREA",
    "LABEL",
    "SUMMARY",
    "OPTION",
  ];
  const STORAGE_KEYS = {
    SESSION: "luxiferSession",
    SEQUENCE: "luxiferSequence",
    CLICK: "luxiferClick",
    SCROLL: "luxiferScroll",
    MOVE: "luxiferMove",
    HESITATE: "luxiferHesitate",
  };
  const API_URL =
    "https://europe-west1-ux-pro.cloudfunctions.net/processLuxiferDataEU";
  const SESSION_TIMEOUT = 60 * 15000; // 15 minutes

  let luxiDataSentAlready = false;
  let lastLuxiferClickTime = 0;

  function luxiThrottle(fn, limit) {
    let lastCall = 0;
    let timeoutId;

    return async function (...args) {
      const now = Date.now();

      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      if (now - lastCall >= limit) {
        lastCall = now;
        try {
          await fn(...args);
        } catch (error) {}
      } else {
        timeoutId = setTimeout(async () => {
          lastCall = now;
          try {
            await fn(...args);
          } catch (error) {}
        }, limit - (now - lastCall));
      }
    };
  }

  async function luxiClickableElement(element) {
    try {
      return (
        CLICKABLE_TAGS.includes(element.tagName) ||
        (element.tagName === "INPUT" &&
          ["button", "submit"].includes(element.type)) ||
        (element.tagName === "IMG" && element.hasAttribute("usemap")) ||
        (element.tagName === "DIV" &&
          ["button", "link"].includes(element.getAttribute("role")))
      );
    } catch (error) {
      return false;
    }
  }

  async function luxiHandleHesitationEvent(x, y) {
    await luxiStoreEventCoordinates(
      x,
      y,
      STORAGE_KEYS.HESITATE,
      window.location.href,
    );
  }

  async function luxiUpdateSessionLastUpdated() {
    try {
      const sessionData = JSON.parse(
        localStorage.getItem(STORAGE_KEYS.SESSION),
      );
      if (sessionData) {
        sessionData.lastUpdated = new Date();
        localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(sessionData));
      }
    } catch (error) {}
  }

  async function luxiUpdatePageSequence() {
    try {
      const sequence =
        JSON.parse(localStorage.getItem(STORAGE_KEYS.SEQUENCE)) || [];

      const currentUrl = window.location.href;

      if (
        sequence.length === 0 ||
        sequence[sequence.length - 1] !== currentUrl
      ) {
        sequence.push(currentUrl);
        localStorage.setItem(STORAGE_KEYS.SEQUENCE, JSON.stringify(sequence));
      }
    } catch (error) {}
  }

  async function luxiSetSession(id) {
    try {
      const pid = id || "No project id";
      const sessionId = `${Date.now()}${String(
        Math.floor(Math.random() * 1e9),
      ).padStart(9, "0")}`;
      const sessionData = JSON.stringify({
        projectId: pid,
        sessionId: sessionId,
        createdAt: new Date(),
        lastUpdated: new Date(),
        deviceType: navigator.userAgent ?? "Unknown",
        referrer: document.referrer ?? "Unknown",
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      });
      localStorage.setItem(STORAGE_KEYS.SESSION, sessionData);
    } catch (error) {}
  }

  async function luxiStartSession(id) {
    try {
      const sessionData = localStorage.getItem(STORAGE_KEYS.SESSION);
      const now = new Date();

      if (sessionData) {
        const { lastUpdated } = JSON.parse(sessionData);
        if (now - new Date(lastUpdated) > SESSION_TIMEOUT) {
          await luxiSetSession(id);
        }
      } else {
        await luxiSetSession(id);
      }
    } catch (error) {}
  }

  async function luxiStoreEventCoordinates(
    x,
    y,
    storageKey,
    url,
    frustration = false,
  ) {
    try {
      let events = JSON.parse(sessionStorage.getItem(storageKey)) || {};

      if (!events[url]) {
        events[url] = [];
      }
      const eventData = {
        x: x,
        y: y,
        w: document.documentElement.scrollWidth,
        h: document.documentElement.scrollHeight,
        frustration: frustration || undefined,
      };

      events[url].push(eventData);
      sessionStorage.setItem(storageKey, JSON.stringify(events));
    } catch (error) {}
  }

  async function luxiHandleMouseMoveEvent(event) {
    await luxiStoreEventCoordinates(
      event.pageX,
      event.pageY,
      STORAGE_KEYS.MOVE,
      window.location.href,
    );
  }

  async function luxiHandleClickEvent(event) {
    try {
      const now = Date.now();
      const frustration = now - lastLuxiferClickTime <= 300;
      lastLuxiferClickTime = now;
      await luxiStoreEventCoordinates(
        event.pageX,
        event.pageY,
        STORAGE_KEYS.CLICK,
        window.location.href,
        frustration,
      );
    } catch (error) {}
  }

  function luxiDebounce(func, wait) {
    let timeout;
    return async function (...args) {
      clearTimeout(timeout);
      timeout = setTimeout(async () => {
        try {
          await func.apply(this, args);
        } catch (error) {}
      }, wait);
    };
  }

  async function luxiHandleScrollEvent() {
    try {
      let scrolls =
        JSON.parse(sessionStorage.getItem(STORAGE_KEYS.SCROLL)) || {};
      const url = window.location.href;
      const scrollTop =
        window.pageYOffset || document.documentElement.scrollTop;
      const scrollHeight =
        document.documentElement.scrollHeight -
        document.documentElement.clientHeight;
      const scrollDepth = (scrollTop / scrollHeight) * 100;
      const roundedScrollDepth = Math.round(scrollDepth / 10) * 10;
      const data = { depth: roundedScrollDepth };

      if (!scrolls[url] || scrolls[url].depth < data.depth) {
        scrolls[url] = data;
      }
      sessionStorage.setItem(STORAGE_KEYS.SCROLL, JSON.stringify(scrolls));
    } catch (error) {}
  }

  function sendLuxiferData(event) {
    if (
      !luxiDataSentAlready &&
      (document.visibilityState === "hidden" || event.type === "beforeunload")
    ) {
      luxiDataSentAlready = true;
      try {
        const sessionData = JSON.parse(
          localStorage.getItem(STORAGE_KEYS.SESSION),
        );
        const sessionDuration = new Date() - new Date(sessionData.createdAt);
        luxiUpdateSessionLastUpdated();
        navigator.sendBeacon(
          API_URL,
          JSON.stringify({
            duration: sessionDuration,
            sequence: localStorage.getItem(STORAGE_KEYS.SEQUENCE),
            session: localStorage.getItem(STORAGE_KEYS.SESSION),
            clicks: sessionStorage.getItem(STORAGE_KEYS.CLICK),
            scrolls: sessionStorage.getItem(STORAGE_KEYS.SCROLL),
            moves: sessionStorage.getItem(STORAGE_KEYS.MOVE),
            hesitations: sessionStorage.getItem(STORAGE_KEYS.HESITATE),
          }),
        );
      } catch (error) {}
    }
  }

  luxiUpdatePageSequence();
  window.addEventListener("DOMContentLoaded", luxiUpdatePageSequence);

  document.addEventListener("mouseout", async (event) => {
    try {
      const target = event.target;
      if (await luxiClickableElement(target)) {
        const rect = target.getBoundingClientRect();
        const x = rect.left + window.scrollX + rect.width / 2;
        const y = rect.top + window.scrollY + rect.height / 2;
        await luxiHandleHesitationEvent(x, y);
      }
    } catch (error) {}
  });

  document.addEventListener("click", async (event) => {
    try {
      await luxiHandleClickEvent(event);
    } catch (error) {}
  });

  document.addEventListener(
    "mousemove",
    luxiThrottle(luxiHandleMouseMoveEvent, 250),
  );
  document.addEventListener("scroll", luxiDebounce(luxiHandleScrollEvent, 200));
  document.addEventListener("visibilitychange", sendLuxiferData);
  window.addEventListener("beforeunload", sendLuxiferData);

  try {
    if (typeof luxiferProjectId !== "undefined") {
      await luxiStartSession(luxiferProjectId);
    } else {
      console.log("No luxiferProjectId found");
    }
  } catch (error) {}
}

luxiDataTracking();
