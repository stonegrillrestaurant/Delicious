// config.js  (TESTING — token visible; hide later)
window.APP_CONFIG = {
  TELEGRAM_BOT_TOKEN: "7538084446:AAFOnvqicd8LwjunpLbs-VzhuSkuLPTlusA",
  TELEGRAM_CHAT_ID: "-1002531095369",

  // GCash number-only
  GCASH_MOBILE: "+63 9276031476",
  GCASH_ACCOUNT_NAME: "ST******E F.",

  // Meta Conversions API (Dataset + Token)
  META_DATASET_ID: "643206718690040", // Stone Grill Restaurant Event
  META_ACCESS_TOKEN: "EAASaVzChC5gBPPVDAXgcJmvhvL4wGJAknWPcR56x7w6CUbjnF52iv5ZCtSXtPHpBBNFWvvqvfcNnD5VhBwMKW2t4IYenJc8yZCJHgi89TzCrvflE1EV5h9xBsdsknvYuQ6XZA7wqnNIRJJCCib21ZB6hl9sr9YaZAZB8kKUJSIr3OryAfkeeYBsC8N0gUwYwZDZD", // hide later (server-side ideally)

  // (Optional extras you already had)
  SHEETS_ENDPOINT: "https://script.google.com/macros/s/AKfycbw9i9quNAyvOHNRv2zRLd886ECBrXBUfZ7RP2crpvz_Y9gP4qDbvYyZcoZBqnn3Ni_k/exec",
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
    SHEETS_ENDPOINT:    C.SHEETS_ENDPOINT,
    META_DATASET_ID:    C.META_DATASET_ID,
    META_ACCESS_TOKEN:  C.META_ACCESS_TOKEN
  });
})();
