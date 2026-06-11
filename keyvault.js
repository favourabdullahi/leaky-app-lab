const { SecretClient } = require("@azure/keyvault-secrets");
const { DefaultAzureCredential } = require("@azure/identity");

const vaultUrl = "https://leaky-app-vault-001.vault.azure.net/";
const credential = new DefaultAzureCredential();
const client = new SecretClient(vaultUrl, credential);

async function getSecret(secretName) {
  const secret = await client.getSecret(secretName);
  return secret.value;
}

module.exports = { getSecret };
