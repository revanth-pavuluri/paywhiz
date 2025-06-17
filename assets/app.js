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
        });
      },
      (error) => {
        console.log("Scan error", error);
      }
    )
    .catch((err) => {
      document.getElementById("reader").innerHTML = `
            <p style="color: red;">${err}</p>
          `;
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

  // Redirect to UPI payment app
  window.location.href = upiUrl.toString();
}

// Start scanning on load
startQrScanner();
