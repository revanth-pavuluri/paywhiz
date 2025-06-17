// DOM Elements
const _reader = document.getElementById("reader");

const _upiId = document.getElementById("upiId");
const _amount = document.getElementById("amount");
const _note = document.getElementById("note");
const _payerName = document.getElementById("payerName");
const _merchantCode = document.getElementById("merchantCode");
const _transactionId = document.getElementById("transactionId");

const _toggleTheme = document.getElementById("toggle-theme");
const _toggleDev = document.getElementById("toggle-dev");
const _toggleAdvanced = document.getElementById("toggle-advanced");
const _advancedFields = document.getElementById("advanced-fields");

// Qr scanner config
const qrScanner = new Html5Qrcode("reader");
const cameraConfig = { facingMode: "environment" };
const scanRegionConfig = {
  fps: 10,
  qrbox: 200,
};

startQrScanner(); // Start scanning on load

// Qr code scanner
function startQrScanner() {
  qrScanner
    .start(
      cameraConfig,
      scanRegionConfig,
      (result) => {
        qrScanner.stop().then(() => {
          // parse
          parseQr(result);
          // Dev mode
          if (isDevMode()) {
            _reader.innerHTML = `<p style="color: green; word-break: break-all;">${result}</p>`;
          }
        });
      },
      (error) => {
        console.log("Scan error", error);
      }
    )
    .catch((err) => {
      _reader.innerHTML = `<p style="color: red; word-break: break-all;">${err}</p>`;
    });
}

// Generalized UPI QR parser
function parseQr(text) {
  const params = new URLSearchParams(text.split("?")[1]);

  if (params.has("pa")) _upiId.value = decodeURIComponent(params.get("pa"));
  if (params.has("am")) _amount.value = decodeURIComponent(params.get("am"));
  if (params.has("tn")) _note.value = decodeURIComponent(params.get("tn"));
  if (params.has("pn")) _payerName.value = decodeURIComponent(params.get("pn"));
  if (params.has("mc"))
    _merchantCode.value = decodeURIComponent(params.get("mc"));
  if (params.has("tr"))
    _transactionId.value = decodeURIComponent(params.get("tr"));
}

// Make payment
function makePayment(event) {
  event.preventDefault();

  const upiId = _upiId?.value.trim();
  const amount = _amount?.value.trim();
  const note = _note?.value.trim();
  const merchantCode = _merchantCode?.value.trim();

  let payerName = _payerName?.value.trim();
  if (!payerName) {
    payerName = "PayWhiz";
    _payerName.value = payerName;
  }

  let transactionId = _transactionId?.value.trim();
  if (!transactionId) {
    transactionId = `TXN${Date.now()}`;
    _transactionId.value = transactionId;
  }

  if (!upiId || !amount || !note) {
    alert("Please fill in all the required fields!");
    return;
  }

  const upiUrl = new URL("upi://pay");
  upiUrl.searchParams.append("pa", upiId);
  upiUrl.searchParams.append("pn", payerName);
  upiUrl.searchParams.append("am", amount);
  upiUrl.searchParams.append("cu", "INR");
  upiUrl.searchParams.append("tn", note);
  upiUrl.searchParams.append("tr", transactionId);
  if (merchantCode) upiUrl.searchParams.append("mc", merchantCode);

  if (isDevMode()) {
    const triggerElement = event.target;
    const a = document.createElement("a");
    a.href = upiUrl.toString();
    a.textContent = upiUrl.toString();
    a.style.wordBreak = "break-all";
    a.style.marginTop = "1rem";
    a.onclick = () => {
      window.location.href = upiUrl.toString();
    };
    triggerElement.insertAdjacentElement("afterend", a);

    if (!confirm("Proceed to payment?")) {
      return;
    }
  }

  // Proceed with payment
  window.location.href = upiUrl.toString();
}

// Set Theme by toggling a class on <body> and saving preference
function setTheme(theme) {
  document.body.classList.remove("light", "dark");
  document.body.classList.add(theme);
  localStorage.setItem("theme", theme);
}

// On page load: apply saved theme from localStorage
const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
const savedTheme =
  localStorage.getItem("theme") || (prefersDark ? "dark" : "light");
setTheme(savedTheme);

// Toggle logic
_toggleTheme.onclick = () => {
  const newTheme = document.body.classList.contains("dark") ? "light" : "dark";
  setTheme(newTheme);
};

// Set Dev Mode by toggling a class on <body> and saving preference
function setDevMode(flag) {
  if (flag) {
    document.body.classList.add("dev");
  } else {
    document.body.classList.remove("dev");
  }
  localStorage.setItem("devMode", flag.toString());
}

// On page load: apply saved Dev Mode from localStorage
const savedDevMode = localStorage.getItem("devMode") === "true";
setDevMode(savedDevMode);

// Toggle logic
_toggleDev.onclick = () => {
  const isDev = document.body.classList.contains("dev");
  setDevMode(!isDev);
};

// Utility function to check dev mode status
function isDevMode() {
  return document.body.classList.contains("dev");
}

// Advanced fields Toggle logic
_toggleAdvanced.addEventListener("click", () => {
  const isHidden = _advancedFields.style.display === "none";
  _advancedFields.style.display = isHidden ? "block" : "none";
  _toggleAdvanced.setAttribute(
    "data-content",
    !isHidden ? "Advanced ▾" : "Advanced ▴"
  );
});
