// ==== config.js (TESTING — token visible; we'll hide this later) ====
// Your baseline config object
window.APP_CONFIG = {
  TELEGRAM_BOT_TOKEN: "7538084446:AAFOnvqicd8LwjunpLbs-VzhuSkuLPTlusA",
  TELEGRAM_CHAT_ID: "-1002531095369",

  // You can keep using Sheets in other flows; not required for receipt upload
  SHEETS_ENDPOINT: "https://script.google.com/macros/s/AKfycbxZcnB9ENV_QiEA0v6TdvfFjs3XZIBHhm-TB4ZQtBMNx9FPowFdIX_MJxV36ngshoSBjA/exec",

  // GCash visuals
  GCASH_QR_PATH: "assets/qr/gcash.png",

  // Business info (for display or future use)
  SHOP_NAME: "Stone Grill Restaurant",
  PHONE: "053 568 0539",
  HOURS: "Daily 10:00 AM – 9:00 PM",
  ADDRESS: "Bato, Leyte",

  // Assets (first item is used as default if multiple)
  ASSETS: {
    logo: [
      "assets/logo.png",
      "assets/icons/icon-192.png",
      "assets/stonegrill-logo.png",
      "assets/icons/stonegrill-logo.png",
      "assets/logo.jpg",
      "assets/img/logo.jpg"
    ],
    gcashQR: [
      "assets/qr/gcash.png",
      "assets/gcash.png",
      "assets/qr/gcash.jpg",
      "assets/gcash.jpg",
      "assets/qr/gcash.jpeg",
      "assets/gcash.jpeg"
    ]
  },

  // NEW: GCash number & account name (you provided these)
  GCASH_MOBILE: "+63 9276031476",
  GCASH_ACCOUNT_NAME: "ST******E F."
};

// ---- Compatibility layer: normalize to window.APP used by popup/uploader ----
(function () {
  const C = window.APP_CONFIG || {};
  const gcashQrUrl = C.GCASH_QR_URL || C.GCASH_QR_PATH || (Array.isArray(C.ASSETS?.gcashQR) ? C.ASSETS.gcashQR[0] : "");

  window.APP = Object.assign(window.APP || {}, {
    TELEGRAM_BOT_TOKEN: C.TELEGRAM_BOT_TOKEN || C.telegramBotToken,
    TELEGRAM_CHAT_ID:   C.TELEGRAM_CHAT_ID   || C.telegramChatId,

    // GCash display
    GCASH_QR_URL:       gcashQrUrl,
    GCASH_MOBILE:       C.GCASH_MOBILE || C.gcashMobile || "",
    GCASH_ACCOUNT_NAME: C.GCASH_ACCOUNT_NAME || C.gcashAccountName || "",

    // Optional/other
    SHEETS_ENDPOINT:    C.SHEETS_ENDPOINT || "",
    SHOP_NAME:          C.SHOP_NAME || "",
    PHONE:              C.PHONE || "",
    HOURS:              C.HOURS || "",
    ADDRESS:            C.ADDRESS || "",
    ASSETS:             C.ASSETS || {}
  });
})();