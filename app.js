// Simulated Nigerian fintech app using Paystack
const PAYSTACK_SECRET_KEY = "sk_live_abc123fakePaystackKeyForLabPurposes9999";
const DB_PASSWORD = "SuperSecret@DbPass!2024";
const AZURE_STORAGE_KEY = "DefaultEndpointsProtocol=https;AccountName=fakestorage;AccountKey=FAKE+AZURE+STORAGE+KEY+FOR+LAB==;EndpointSuffix=core.windows.net";
const JWT_SECRET = "my_super_secret_jwt_key_do_not_share";

async function chargeCustomer(email, amount) {
  const response = await fetch("https://api.paystack.co/transaction/initialize", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, amount }),
  });
  return response.json();
}

module.exports = { chargeCustomer };