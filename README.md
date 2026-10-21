# Team Quadrant Assessment — Google Sheets + Apps Script

This project includes:
- A 15-question employee questionnaire (`index.html` + `src/main.js`)
- An admin dashboard to review responses, filter quadrants, view selected answers, and export CSV (`admin.html` + `src/admin.js`)
- A Google Apps Script backend (`Code.gs`) that serves a JSON API and writes to your Google Sheet
- Google Sheet tabs: `Responses` and `Settings`

The frontend is plain HTML/JS with no build step. It reads the Apps Script web app URL from `.env` at runtime. The backend opens the sheet using `SHEET_ID` in `Code.gs`.

## Important scoring limitation
The scenario questions are designed to reduce obvious "good answer" cues, but this is not a validated psychometric test. The current scoring is a **provisional indicator only** and should not be used as the sole basis for performance, promotion, or employment decisions. Review actual examples and manager observations. The current option-to-score logic is intentionally simple and should be calibrated before relying on quadrant assignments; it does not claim to infer a person's true motivation or interest reliably from options alone.

## Setup

### 1. Backend (Apps Script)
1. Create a Google Sheet for the team assessment. Copy its ID from the URL:
   `https://docs.google.com/spreadsheets/d/`**`<SHEET_ID>`**`/edit`
2. Go to [script.google.com](https://script.google.com) and create a new project (or use **Extensions → Apps Script** from the sheet).
3. Replace the default script with the contents of `Code.gs`.
4. At the top of `Code.gs`, set `const SHEET_ID = '...'` to your sheet ID.
5. Save, select `setupSheet` and click **Run**. Approve the permissions. This creates `Responses` and `Settings`.
6. Open the `Settings` tab and change cell **B2** from `ChangeThisPIN` to a long, unique admin PIN.
7. Click **Deploy → New deployment → Web app**.
   - **Execute as:** Me
   - **Who has access:** Anyone. The frontend calls the API from a different site, so Google sign-in cookies are not sent, and any stricter setting will block requests.
8. Deploy and copy the web app URL (ends in `/exec`).

### 2. Frontend
1. Paste the web app URL into `.env`:
   ```
   VITE_APPS_SCRIPT_URL=https://script.google.com/macros/s/XXXX/exec
   ```
   The pages read this file when they load, so there is no build step.
2. To try it locally, serve the folder (modules don't load from `file://`):
   ```
   python3 -m http.server 8000
   ```
   then open http://localhost:8000.

### 3. Deploy to GitHub Pages
1. Push the repo to GitHub, including `.env` and `.nojekyll`. Without `.nojekyll`, GitHub skips files starting with a dot, so `.env` wouldn't be published.
2. **Settings → Pages → Source: Deploy from a branch**, branch `main`, folder `/ (root)`.

The URL in `.env` is public once deployed. That is expected; the admin data is protected by the PIN, not by the URL.

## URLs

- Employee questionnaire: `https://<username>.github.io/<repo-name>/`
- Admin dashboard: `https://<username>.github.io/<repo-name>/admin.html`

The admin page asks for the PIN from `Settings!B2`. Keep the PIN private. Anyone who can access the spreadsheet itself can also see responses.

## Updating
- **Code.gs changes:** **Deploy → Manage deployments → Edit → Version: New version**. This keeps the same URL, so `.env` doesn't change. A *new* deployment gives a new URL that you'd need to paste into `.env` again.
- **Frontend or `.env` changes:** commit and push; Pages republishes automatically.

## Before using with employees
- Tell employees what is collected and how the information will be used.
- Consider allowing them to skip sensitive free-text details.
- Validate the quadrant logic against actual behavior before making decisions.
- The API is public ("Anyone" access) and the admin view is protected only by the PIN. Use a long PIN.
