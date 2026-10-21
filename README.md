# Team Quadrant Assessment — Google Sheets + Apps Script

This project includes:
- A 15-question employee questionnaire (`Index.html`)
- An admin dashboard to review responses, filter quadrants, view selected answers, and export CSV (`Admin.html`)
- Google Apps Script backend (`Code.gs`)
- Google Sheet tabs: `Responses` and `Settings`

## Important scoring limitation
The scenario questions are designed to reduce obvious "good answer" cues, but this is not a validated psychometric test. The current scoring is a **provisional indicator only** and should not be used as the sole basis for performance, promotion, or employment decisions. Review actual examples and manager observations. The current option-to-score logic is intentionally simple and should be calibrated before relying on quadrant assignments; it does not claim to infer a person's true motivation or interest reliably from options alone.

## Setup

1. Create a new Google Sheet for the team assessment.
2. In the Sheet, open **Extensions → Apps Script**.
3. Replace the default script with the contents of `Code.gs`.
4. Add an HTML file named `Index` and paste `Index.html`.
5. Add another HTML file named `Admin` and paste `Admin.html`.
6. Save the project.
7. In the Apps Script editor, select `setupSheet` and click **Run**. Approve the permissions. This creates `Responses` and `Settings`.
8. Open the `Settings` tab and change cell **B2** from `ChangeThisPIN` to a long, unique admin PIN.
9. Click **Deploy → New deployment → Web app**.
10. Set **Execute as** to **Me**.
11. Choose access carefully:
    - If only signed-in users in your organization should answer, restrict access to your organization if your Google Workspace supports it.
    - If employees do not have accounts in the same Workspace, “Anyone” may be necessary, but the URL can be shared. Do not put confidential data in the questionnaire.
12. Deploy and copy the web app URL.

## URLs

- Employee questionnaire: `YOUR_WEB_APP_URL`
- Admin dashboard: `YOUR_WEB_APP_URL?page=admin`

The admin page asks for the PIN from `Settings!B2`. Keep the admin URL and PIN private. Anyone who can access the spreadsheet itself can also see responses.

## Updating the app
After editing code, use **Deploy → Manage deployments → Edit** and deploy a new version.

## Before using with employees
- Tell employees what is collected and how the information will be used.
- Consider allowing them to skip sensitive free-text details.
- Validate the quadrant logic against actual behavior before making decisions.
- If you need stronger security, use Google Workspace access restrictions rather than relying only on a shared PIN.
