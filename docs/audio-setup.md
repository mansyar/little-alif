# Audio Generation Setup

This guide walks you through generating the 112 MP3 pronunciation files (28 letters × 4 vowel modes) for Little Alif using Google Cloud Text-to-Speech.

## Prerequisites

- A **Google Cloud Platform (GCP) account** ([cloud.google.com](https://cloud.google.com))
- A GCP project with **billing enabled**
- The **gcloud CLI** installed locally ([Install guide](https://cloud.google.com/sdk/docs/install))
- Node.js 20+ and pnpm installed (see project root `README.md`)

## Step 1: Create a GCP Project

1. Go to the [GCP Console](https://console.cloud.google.com)
2. Click **Select a project** → **New Project**
3. Give it a name (e.g., `little-alif-audio`)
4. Note your **Project ID** (you'll need it later)
5. Ensure **billing is enabled** for this project

## Step 2: Enable the Cloud Text-to-Speech API

1. In the GCP Console, navigate to **APIs & Services** → **Library**
2. Search for **Cloud Text-to-Speech API**
3. Click **Enable**

## Step 3: Set Up Authentication

The audio generation script uses [Application Default Credentials (ADC)](https://cloud.google.com/docs/authentication/provide-credentials-adc) to authenticate with GCP.

### Option A: Using your own Google account (recommended for development)

```bash
# Log in with your Google account
gcloud auth application-default-login

# Set your project
gcloud config set project YOUR_PROJECT_ID
```

This opens a browser window where you can authorize access. The credentials are cached locally and the script will use them automatically.

### Option B: Using a service account (recommended for CI/CD)

1. In the GCP Console, go to **IAM & Admin** → **Service Accounts**
2. Click **Create Service Account**
3. Give it a name and click **Create and Continue**
4. Assign the role **Cloud Text-to-Speech > Cloud Text-to-Speech User**
5. Click **Done**
6. Select the new service account, go to the **Keys** tab
7. Click **Add Key** → **Create New Key** → **JSON**
8. Download the key file
9. Set the environment variable:

```bash
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/your-key.json"
```

> **Security note:** Keep the JSON key file secure and **never commit it** to version control.

## Step 4: Generate the Audio Files

From the project root directory:

```bash
# Install dependencies (if not done already)
pnpm install

# Run the audio generation script
pnpm generate:audio
```

The script:

1. Connects to Google Cloud TTS using the credentials from Step 3
2. Generates 112 MP3 files (28 letters × 4 vowel modes)
3. Outputs files to `public/audio/letters/`
4. Skips any files that already exist (so you can re-run safely)
5. Uses **ar-XA** voice in **FEMALE** gender at **0.85×** speaking speed
6. For alef (ا), uses proper hamza-carrier forms (أ, إ) for better pronunciation
7. Exits with code 1 if any file fails to generate

## Step 5: Verify the Output

After the script completes, verify the files were generated:

```bash
# Count the files
ls public/audio/letters/*.mp3 | wc -l
# Expected: 112

# Check a few files exist
ls public/audio/letters/alif.mp3
ls public/audio/letters/alif_fathah.mp3
ls public/audio/letters/ba_kasrah.mp3
```

### File Naming Convention

Each file follows the pattern `{letterId}_{vowelMode}.mp3`:

| Pattern                 | Example          | Description                 |
| ----------------------- | ---------------- | --------------------------- |
| `{letterId}.mp3`        | `alif.mp3`       | Plain letter (no diacritic) |
| `{letterId}_fathah.mp3` | `ba_fathah.mp3`  | Letter with fathah (َ)      |
| `{letterId}_kasrah.mp3` | `ta_kasrah.mp3`  | Letter with kasrah (ِ)      |
| `{letterId}_dammah.mp3` | `tsa_dammah.mp3` | Letter with dammah (ُ)      |

## Troubleshooting

### "Cloud Text-to-Speech API has not been used in project"

Enable the API (see Step 2) and wait a few minutes for it to propagate.

### "Permission denied" or "Not authenticated"

- Run `gcloud auth application-default-login` again
- Or verify `GOOGLE_APPLICATION_CREDENTIALS` points to a valid key file
- Ensure the service account has the `Cloud Text-to-Speech User` role

### Quota exceeded

The free tier includes **1 million characters per month**. The full generation uses approximately 300–500 characters total, so you won't hit the limit.

If you do hit it, wait for the quota to reset (usually within 24 hours).

### "Failed to generate X" for specific files

- Check your internet connection
- Verify the API is enabled
- Run the script again — it skips already-generated files

### Node.js version errors

Ensure you're running Node.js 20 or later:

```bash
node --version
```

## Downloadable Archive

If you prefer zero setup, you can download a pre-generated archive of all 112 audio files instead. This option requires no GCP account, no API setup, and no authentication.

> **Note:** Check the project's release page or contact the maintainer for the archive URL.
