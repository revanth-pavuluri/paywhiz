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

const themeSwitcher = document.getElementById("themeSwitcher");
const devModeToggle = document.getElementById("devMode");

// Load stored preferences
if (localStorage.getItem("theme")) {
  document.body.classList.add(localStorage.getItem("theme"));
  themeSwitcher.checked = localStorage.getItem("theme") === "dark";
}

if (localStorage.getItem("devMode") === "true") {
  devModeToggle.checked = true;
  console.log("Developer mode enabled");
}

// Theme switch logic
themeSwitcher.addEventListener("change", () => {
  const theme = themeSwitcher.checked ? "dark" : "light";
  document.body.classList.remove("dark", "light");
  document.body.classList.add(theme);
  localStorage.setItem("theme", theme);
});

// Dev mode toggle
devModeToggle.addEventListener("change", () => {
  const isEnabled = devModeToggle.checked;
  localStorage.setItem("devMode", isEnabled);
});

function isDevMode() {
  return localStorage.getItem("devMode") === "true";
}
