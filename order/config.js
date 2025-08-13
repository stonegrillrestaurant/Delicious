// config.js  (TESTING — token visible; hide later)
window.APP_CONFIG = {
  TELEGRAM_BOT_TOKEN: "7538084446:AAFOnvqicd8LwjunpLbs-VzhuSkuLPTlusA",
  TELEGRAM_CHAT_ID: "-1002531095369",

  // GCash number-only
  GCASH_MOBILE: "+63 9276031476",
  GCASH_ACCOUNT_NAME: "ST******E F.",

  // (Optional extras you already had)
  SHEETS_ENDPOINT: "https://script.google.com/macros/s/AKfycbxZcnB9ENV_QiEA0v6TdvfFjs3XZIBHhm-TB4ZQtBMNx9FPowFdIX_MJxV36ngshoSBjA/exec",
  GCASH_QR_PATH: "assets/qr/gcash.png",
  SHOP_NAME: "Stone Grill Restaurant",
  PHONE: "053 568 0539",
  HOURS: "Daily 10:00 AM – 9:00 PM",
  ADDRESS: "Bato, Leyte",
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
  }
};

// Map to window.APP for other scripts
(function(){
  const C = window.APP_CONFIG || {};
  window.APP = Object.assign(window.APP || {}, {
    TELEGRAM_BOT_TOKEN: C.TELEGRAM_BOT_TOKEN,
    TELEGRAM_CHAT_ID:   C.TELEGRAM_CHAT_ID,
    GCASH_MOBILE:       C.GCASH_MOBILE,
    GCASH_ACCOUNT_NAME: C.GCASH_ACCOUNT_NAME,
    SHEETS_ENDPOINT:    C.SHEETS_ENDPOINT
  });
})();