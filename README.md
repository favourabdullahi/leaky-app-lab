#  Leaky App Lab — Lab 1: Stop API Keys and Secrets from Leaking

> **Azure Security Lab Series** | Nigerian Fintech Security Curriculum
> A complete hands-on lab simulating, detecting, and remediating exposed API keys and credentials in a Node.js fintech application — using Azure Key Vault, GitHub Push Protection, and GitGuardian.

---

## ⚠️ Disclaimer

> All credentials in this repository are **intentionally fake** and exist solely for educational demonstration.
> They simulate real secret formats but provide **zero access** to any real system or account.

```
PAYSTACK_SECRET_KEY = "sk_live_abc123fakePaystackKeyForLabPurposes9999"   ← FAKE
DB_PASSWORD         = "SuperSecret@DbPass!2024"                            ← FAKE
AZURE_STORAGE_KEY   = "DefaultEndpointsProtocol=https;AccountName=fake..."← FAKE
JWT_SECRET          = "my_super_secret_jwt_key_do_not_share"               ← FAKE
```

---

##  Problem Statement

Developers across Nigerian fintechs and tech startups frequently commit live Paystack keys, database passwords, and cloud credentials directly into source code or shared workspaces. Once a secret is pushed to a public repository, it is considered **permanently compromised** — even if deleted later, it still lives in Git history.

**This lab teaches you how to:**
- Simulate a realistic credential exposure in a fintech app
- Detect secrets automatically using GitHub Push Protection and GitGuardian
- Remove secrets from code and purge them from Git history
- Store secrets securely using Azure Key Vault
- Update the app to fetch credentials at runtime instead of hardcoding them
- Prevent future leaks with automated pre-commit scanning hooks
- Configure real-time alerts for your security team

---

##  Prerequisites

Before starting the lab, install and configure all of the following:

- [ ] [Node.js](https://nodejs.org/) v18 or later
- [ ] [Git](https://git-scm.com/) installed locally
- [ ] [Azure CLI](https://learn.microsoft.com/en-us/cli/azure/install-azure-cli) installed
- [ ] [Python](https://www.python.org/) (for git-filter-repo in Step 4)
- [ ] A free [GitHub](https://github.com) account
- [ ] A free [Azure](https://azure.microsoft.com/free) account
- [ ] A free [GitGuardian](https://www.gitguardian.com) account

**Verify your tools are installed:**

```bash
node --version       # v18+
git --version        # any recent version
az --version         # any recent version
python --version     # 3.x
```


## Project Structure

```
leaky-app-lab/
│
├── app.js                 # Main fintech app
│                          #   Step 1: contains hardcoded secrets (bad state)
│                          #   Step 4: updated to fetch from Key Vault (clean state)
│
├── keyvault.js            # Azure Key Vault helper module — created in Step 6
│
├── test.js                # Smoke test confirming Key Vault fetch works — Step 7
│
├── .husky/
│   └── pre-commit         # Pre-commit hook blocking secret commits — Step 8
│
├── .secrets.baseline      # detect-secrets clean baseline file — Step 8
│
├── .gitignore             # Excludes node_modules/ from Git
│
└── package.json           # Node.js project manifest
```

---

## 🔵 Azure Solution Architecture

| Layer | Tool | Purpose |
|---|---|---|
| Secret storage | Azure Key Vault | Securely store and retrieve all credentials |
| Secret detection (push) | GitHub Push Protection | Block commits containing secrets before they land |
| Secret detection (repo) | GitGuardian | Scan every commit and alert on exposed credentials |
| Enforcement (local) | Husky + detect-secrets | Block secrets at the developer's machine before push |
| Alerting | GitGuardian Notifications | Real-time email/Slack alerts on new exposures |
| Audit logging | Azure Monitor | Track Key Vault access and detect anomalies |

---

##  Complete Step-by-Step Walkthrough

---

### Step 1 — Create the Fake App with Hardcoded Secrets

This simulates the **bad state** —.

**Initialise the project:**

```bash
```
<img width="631" height="125" alt="image" src="https://github.com/user-attachments/assets/f7028bd4-66ca-46fa-9ef5-d5b7a450517e" />



**Create `.gitignore` before anything else** (critical — prevents node_modules from being staged):

```bash
echo node_modules/ > .gitignore
```

**Create `app.js` in VS Code**


```



**Stage only the files you need** — never use `git add .` before verifying .gitignore:

```bash
git add app.js package.json .gitignore
git commit -m "initial app setup"
```
<img width="538" height="290" alt="image" src="https://github.com/user-attachments/assets/9b7b5156-3e5a-434f-abbd-c1ed8230ff27" />

>  **Step 1 Complete** — fake fintech app created with 4 exposed credentials representing a Paystack key, database password, Azure storage key, and JWT secret.

---

### Step 2 — Push to GitHub and Enable Secret Scanning

**Create a new public repo on GitHub:**

2. Repository name: `leaky-app-lab`
3. Description: `add yours`
4. Visibility: **Public**
5. Do NOT tick "Add a README file", "Add .gitignore", or "Choose a license"
6. Click **Create repository**

**Connect your local repo and push:**
<img width="552" height="292" alt="image" src="https://github.com/user-attachments/assets/accbb4c8-3f13-4aec-8e6c-65ca962fa637" />

**Enable GitHub secret scanning:**

1. Go to your repo → **Settings** → **Security** → **Code security and analysis**
2. Enable **Secret scanning**
3. Enable **Push protection**

**Connect GitGuardian to the repo:**

1. Log into [app.gitguardian.com](https://app.gitguardian.com)
2. On the Get Started page, click **Connect a source** (blue button)
3. Choose **GitHub** → click **Install on GitHub**
4. On GitHub, select **Only select repositories**
5. Choose **leaky-app-lab** from the list
6. Click **Install & Authorize**
7. You will be redirected back to GitGuardian — repo now appears under Perimeter
<img width="345" height="302" alt="image" src="https://github.com/user-attachments/assets/e90cf167-7f06-411e-b1d6-ee3814f2b321" />

>  **Step 2 Complete** — code is on GitHub, Push Protection is active, GitGuardian is connected and monitoring the repository.

---

### Step 3 — Observe the Scanner Flag the Secret

**What you will see when you push:**

GitHub Push Protection will block the push immediately:

<img width="482" height="269" alt="image" src="https://github.com/user-attachments/assets/d9886ea2-7e71-4f5b-904e-6a06d099b114" />

**To bypass for lab purposes:**


The terminal will display an unblock URL like:
```
https://github.com/YOUR_USERNAME/leaky-app-lab/security/secret-scanning/unblock-secret/XXXXXXX
```

1. Copy that full URL and paste it into your browser address bar (not the search bar)
2. On the page that opens, select **"It's used in tests"** as the reason
3. Click **Allow secret**
4. Return to terminal and run `git push` again — it will go through this time
<img width="504" height="274" alt="image" src="https://github.com/user-attachments/assets/a4517f9d-9b35-4539-928a-2775a476108d" />

**Trigger a GitGuardian scan:**

1. Go to GitGuardian → **Perimeter** in the left sidebar
2. Check the box next to `YOUR_USERNAME/leaky-app-lab`
3. Click the **Scan** button in the blue bar that appears
4. Wait 2–3 minutes for the scan to complete

**Check for incidents:**

Go to **Internal monitoring → Internal secret incidents** in the left sidebar.
<img width="696" height="288" alt="image" src="https://github.com/user-attachments/assets/a1389b88-d9c7-408e-9bb6-4a994512b8b6" />


> **Step 3 Complete** — GitGuardian detected 2 incidents from `app.js`. Screenshot the incidents page as evidence. This proves the scanner flags secrets before they can cause damage.

---

### Step 4 — Remove the Secret and Rotate It

**Replace the entire contents of `app.js`** with this clean version (remove all hardcoded credentials):

<img width="549" height="202" alt="image" src="https://github.com/user-attachments/assets/f9c5ea5b-b5f5-496b-a866-03c3cd4d6100" />


**Purge the secret from Git history** — critical step because GitHub still stores the old commit containing the secret:

<img width="882" height="148" alt="image" src="https://github.com/user-attachments/assets/d136bf64-5fb2-4f47-adbd-a408e3f6b4c9" />


**Commit and push the clean version:**

```bash
git add app.js
git commit -m "fix: remove hardcoded secrets, fetch from Key Vault at runtime"
git push
```

> In a real scenario, immediately rotate the compromised key in your Paystack dashboard — generate a new one and store the new value. The old key must be considered permanently compromised from the moment it was pushed.

>  **Step 4 Complete** — no credentials remain in the codebase. Git history has been rewritten to remove the secret values.

---

### Step 5 — Store Secrets in Azure Key Vault

**Create a resource group and Key Vault:**

<img width="856" height="188" alt="image" src="https://github.com/user-attachments/assets/d79f4a33-9eb6-458b-adc2-d9476d12c4e1" />

**Store each secret in the vault:**

```bash
az keyvault secret set \
  --vault-name leaky-app-vault-001 \
  --name "PAYSTACK-SECRET-KEY" \
  --value "YOUR_ROTATED_PAYSTACK_KEY"

az keyvault secret set \
  --vault-name leaky-app-vault-001 \
  --name "DB-PASSWORD" \
  --value "YOUR_DB_PASSWORD"

az keyvault secret set \
  --vault-name leaky-app-vault-001 \
  --name "JWT-SECRET" \
  --value "YOUR_JWT_SECRET"
```

**Grant the app minimum read-only access (principle of least privilege):**

```bash
az keyvault set-policy \
  --name leaky-app-vault-001 \
  --upn YOUR_AZURE_EMAIL \
  --secret-permissions get list
```

**Verify secrets are stored:**

```bash
az keyvault secret list --vault-name leaky-app-vault-001 -o table
```
<img width="786" height="202" alt="image" src="https://github.com/user-attachments/assets/3b5387a5-e34d-4983-b516-41c591a4bdaf" />

>  **Step 5 Complete** — all 3 secrets stored in Azure Key Vault. Access policy grants only `get` and `list` permissions — no write, delete, or admin access.

---

### Step 6 — Update the App to Fetch Secrets at Runtime

**Install the Azure SDK packages:**
<img width="680" height="184" alt="image" src="https://github.com/user-attachments/assets/f495e909-5c4c-4cc9-952f-3da4a8bc5a8c" />


**Create `keyvault.js`** — the runtime secret helper:
<img width="708" height="303" alt="image" src="https://github.com/user-attachments/assets/ce57e8b8-b92a-4beb-9c32-e4d859f7a691" />

```javascript
**Commit the helper and updated dependencies:**
```

> `DefaultAzureCredential` automatically uses your active `az login` session in development and a Managed Identity in production — no credentials needed in the code at all.

>  **Step 6 Complete** — the app now resolves all credentials dynamically from Azure Key Vault at runtime. Zero secrets in the codebase.

---

### Step 7 — Test the App — No Secret in Repo

**Verify there are no secrets anywhere in the codebase:**

```bash
grep -rn "sk_live\|password\|secret\|api_key" . \
  --include="*.js" --exclude-dir=node_modules
# Should return no output at all
```

**Create `test.js`** to confirm the Key Vault fetch works end-to-end:
<img width="781" height="265" alt="image" src="https://github.com/user-attachments/assets/c80c9a31-7145-48f3-bbeb-c3c636cc6ae6" />


**Run the test:**
<img width="944" height="172" alt="image" src="https://github.com/user-attachments/assets/8f627320-1c4d-441e-ad33-0bcb6d3c8ab3" />


>  **Step 7 Complete** — grep returns nothing (no secrets in source), and the app successfully retrieves credentials from Key Vault at runtime.

---

### Step 8 — Add Pre-commit Hook to Block Future Leaks

**Install the tools:**
<img width="786" height="256" alt="image" src="https://github.com/user-attachments/assets/0de0cad8-c422-4b1a-835e-68e0737606f7" />


**Create the pre-commit hook** — edit `.husky/pre-commit` to contain:
<img width="545" height="253" alt="image" src="https://github.com/user-attachments/assets/257071e5-9eb1-441e-a009-0d459adc22d6" />


```bash
chmod +x .husky/pre-commit
```

**Initialise the clean baseline** so detect-secrets knows what the current clean state looks like:
<img width="928" height="145" alt="image" src="https://github.com/user-attachments/assets/1d750a45-96f3-4c95-9a25-2a9d087d5c55" />

<img width="890" height="206" alt="image" src="https://github.com/user-attachments/assets/ad66146a-30d8-4b4e-b9d6-e7415e028b42" />


**Test that the hook works — try to commit a fake secret:**
<img width="645" height="298" alt="image" src="https://github.com/user-attachments/assets/3d4f38e6-bfde-4d9e-9bc9-cca8b1b32d0a" />


> **Step 8 Complete** — any future commit containing a secret pattern is automatically blocked at the developer's machine before it can reach GitHub.

---

### Step 9 — Configure Alerts for New Exposures


** Azure Monitor diagnostic logging on the Key Vault:**

```bash
az monitor diagnostic-settings create \
  --name keyvault-diagnostics \
  --resource $(az keyvault show --name leaky-app-vault-001 --query id -o tsv) \
  --logs '[{"category":"AuditEvent","enabled":true}]' \
  --workspace YOUR_LOG_ANALYTICS_WORKSPACE_ID
```
<img width="645" height="298" alt="image" src="https://github.com/user-attachments/assets/13133629-fa55-4841-95c3-fb2e56c8f0f6" />
<img width="671" height="291" alt="image" src="https://github.com/user-attachments/assets/e32dd1af-da89-40bc-8a59-c2f22f768f0a" />

This logs every read, write, and access attempt on the Key Vault to Azure Monitor — useful for detecting unusual access patterns.

>  **Step 9 Complete** — security team will receive immediate notifications whenever a new secret exposure is detected in any future commit or push.
<img width="774" height="300" alt="image" src="https://github.com/user-attachments/assets/5d997a11-4c96-44a1-8f31-a0bf768fb1a2" />

---

##  Final Success Check

Run all three verification checks to confirm the lab is fully complete:

```bash
# 1. Confirm no secrets exist in source code
grep -rn "sk_live\|password\|secret\|api_key" . \
  --include="*.js" --exclude-dir=node_modules
# Expected: no output

# 2. Confirm app retrieves credentials from Key Vault at runtime
node test.js
# Expected: ✅ Secret fetched successfully. Length: 42

# 3. Confirm pre-commit hook blocks future leaks
echo 'const BAD_KEY = "sk_live_testblockedkey123"' > bad.js
git add bad.js && git commit -m "test"
# Expected: ❌ Secrets detected. Commit blocked.
rm bad.js
```

**All three passing = Lab complete** 🎉

---

## 🐛 Troubleshooting Log

All real issues encountered during this live lab session, documented for reference.

| Ref | Issue | Root Cause | Resolution |
|---|---|---|---|
| T-01 | `git add .` triggered thousands of LF→CRLF warnings and staged all of `node_modules` | `.gitignore` did not exist yet when `git add .` was run | Pressed Ctrl+C to cancel. Created `.gitignore` with `node_modules/`. Ran `git add app.js package.json .gitignore` instead |
| T-02 | `git rm -r --cached .` returned `fatal: pathspec '.' did not match any files` | Nothing had been committed yet so there was nothing in the index to remove | Skipped the command — it only applies when files are already tracked. Proceeded directly to specific file staging |
| T-03 | `git push` returned `fatal: No configured push destination` | No GitHub remote had been linked to the local repo yet | Created repo on github.com/new then ran `git remote add origin https://github.com/favourabdullahi/leaky-app-lab.git` |
| T-04 | Push blocked: `[remote rejected] push declined due to repository rule violations` | GitHub Push Protection correctly detected the fake Paystack secret in `app.js` | Opened the unblock URL printed in the terminal output. Selected "It's used in tests". Clicked Allow. Re-ran push |
| T-05 | GitHub unblock URL returned "Not Found" page | URL was accidentally copied with `.git'` appended at the end | Removed the trailing `.git'` characters. Correct URL has no `.git` suffix |
| T-06 | GitHub URL was typed into Google search bar, not the browser address bar | Browser defaulted to search when text was entered in the wrong input field | Clicked the browser address bar at the very top of the window and typed the URL directly there |
| T-07 | GitGuardian scan completed but showed 0 Bytes — no secrets detected | `app.js` had not been included in the first commit — only an empty initial commit was pushed | Ran `git add app.js` → `git commit -m "add app with credentials"` → `git push` to include the file |
| T-08 | Azure CLI session concern after laptop was off for 24 hours | Azure CLI token cache may expire after periods of inactivity | Ran `az account show` — session was still active. If it had expired, `az login` would re-authenticate in under a minute |
| T-09 | Could not find GitGuardian Integrations menu to connect GitHub | GitGuardian onboarding flow uses a different entry point than expected | The correct button is **"Connect a source"** (blue button) on the Get Started page — not a separate Integrations menu item |

--
## 🔗 Tools & References

- [Azure Key Vault Documentation](https://learn.microsoft.com/en-us/azure/key-vault/)
- [Azure SDK for Node.js — Key Vault Secrets](https://learn.microsoft.com/en-us/javascript/api/overview/azure/keyvault-secrets-readme)
- [GitHub Secret Scanning](https://docs.github.com/en/code-security/secret-scanning)
- [GitHub Push Protection](https://docs.github.com/en/code-security/secret-scanning/push-protection-for-repositories-and-organizations)
- [GitGuardian](https://www.gitguardian.com)
- [Husky Pre-commit Hooks](https://typicode.github.io/husky/)
- [detect-secrets by Yelp](https://github.com/Yelp/detect-secrets)
- [git-filter-repo](https://github.com/newren/git-filter-repo)
- [Paystack API Documentation](https://paystack.com/docs/api/)
- [DefaultAzureCredential Explained](https://learn.microsoft.com/en-us/azure/developer/javascript/sdk/authentication/overview)

---

## 👤 Author

**Favour Abdullahi**
Cloud Security Consultant & Educator — Nigerian Tech Ecosystem
[GitHub: @favourabdullahi](https://github.com/favourabdullahi)

---

## 📄 License

This project is for **educational purposes only**.
No real credentials, live API keys, or sensitive data are included anywhere in this repository.
