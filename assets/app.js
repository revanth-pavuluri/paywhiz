const qrScanner = new Html5Qrcode("reader");

const cameraConfig = { facingMode: "environment" };
const scanRegionConfig = {
  fps: 10,
  qrbox: 200,
};

function parseUpiIdFromQr(text) {
  const upiIdMatch = text.match(/upi:\/\/pay\?pa=([^&]+)/i);
  if (upiIdMatch) {
    document.getElementById("upiId").value = decodeURIComponent(upiIdMatch[1]);
  }
}

function startQrScanner() {
  qrScanner
    .start(
      cameraConfig,
      scanRegionConfig,
      (qrCodeMessage) => {
        qrScanner.stop().then(() => {
          parseUpiIdFromQr(qrCodeMessage);
          if (isDevMode()) {
            document.getElementById(
              "reader"
            ).innerHTML = `<p style="color: green;">${qrCodeMessage}</p>`;
          }
        });
      },
      (error) => {
        console.log("Scan error", error);
      }
    )
    .catch((err) => {
      document.getElementById(
        "reader"
      ).innerHTML = `<p style="color: red;">${err}</p>`;
    });
}

function makePayment(event) {
  event.preventDefault();

  const upiId = document.getElementById("upiId")?.value.trim();
  const amount = document.getElementById("amount")?.value.trim();
  const note = document.getElementById("note")?.value.trim();
  const payerName = "PayWhiz";
  const transactionId = `TXN${Date.now()}`;

  if (!upiId || !amount || !note) {
    alert("Please fill in all the fields!");
    return;
  }

  const upiUrl = new URL("upi://pay");
  upiUrl.searchParams.append("pa", upiId);
  upiUrl.searchParams.append("pn", payerName);
  upiUrl.searchParams.append("am", amount);
  upiUrl.searchParams.append("cu", "INR");
  upiUrl.searchParams.append("tn", note);
  upiUrl.searchParams.append("tr", transactionId);

  if (isDevMode()) {
    const triggerElement = event.target;
    const parent = triggerElement.parentElement;
    const a = document.createElement("a");
    a.href = upiUrl.toString();
    a.textContent = upiUrl.toString();
    a.style.display = "block";
    a.style.wordBreak = "break-all";
    a.style.marginTop = "1rem";
    a.target = "_blank";
    parent.insertAdjacentElement("afterend", a);

    if (!confirm("Proceed to payment ?")) {
      return; // Prevent redirect in Dev Mode
    }
  }
  // Redirect to UPI payment app
  window.location.href = upiUrl.toString();
}

// Start scanning on load
startQrScanner();

// Set Theme by toggling a class on <body> and saving preference
function setTheme(theme) {
  document.body.classList.remove('light', 'dark');
  document.body.classList.add(theme);
  localStorage.setItem('theme', theme);
}

// On page load: apply saved theme from localStorage
const themeToggle = document.getElementById('toggle-theme');
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
const savedTheme = localStorage.getItem('theme') || (prefersDark ? 'dark' : 'light');
setTheme(savedTheme);

// Toggle logic
themeToggle.onclick = () => {
  const newTheme = document.body.classList.contains('dark') ? 'light' : 'dark';
  setTheme(newTheme);
};

// Set Dev Mode by toggling a class on <body> and saving preference
function setDevMode(flag) {
  if (flag) {
    document.body.classList.add('dev');
  } else {
    document.body.classList.remove('dev');
  }
  localStorage.setItem('devMode', flag.toString());
}

// On page load: apply saved Dev Mode from localStorage
const devModeToggle = document.getElementById('toggle-dev');
const savedDevMode = localStorage.getItem('devMode') === 'true';
setDevMode(savedDevMode);

// Toggle logic
devModeToggle.onclick = () => {
  const isDev = document.body.classList.contains('dev');
  setDevMode(!isDev);
};

// Utility function to check dev mode status
function isDevMode() {
  return document.body.classList.contains('dev');
}
