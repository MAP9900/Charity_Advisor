# Charity Advisor: Finding Your Perfect Match

Still Trying to turn into actual webpage!!  

## ✨Highlights✨
* **Personalized Matching:** Answer four simple questions based on your values and locality preference to find relevant charities.
* **Verified Data:** All organizations are IRS-verified 501(c)(3) entities, ensuring a base level of operational effectiveness.
* **Large Database:** Access to nearly one million organizations corresponding to IRS National Taxonomy of Exempt Entities (NTEE) Codes for organizational purpose.
* **Simple Interface:** Our frontend delivers recommendations and allows you to load additional results up to a limit of 15 per search.

## Overview and Process
As the charitable sector continues to expand, the overwhelming number of options leads to choice fatigue, and subsequently, lower donation frequency among Americans. Our **Charity_Advisor** simplifies the search using the leading charity-based API, Every.org; the site provides access to one million IRS 501(c)(3) organizations corresponding to the NTEE Codes established by the IRS surrounding organization purpose. 

Our approach leverages the Every.org Charity API NTEE Codes as the core mechanism to match user values with organizational missions. In order to deliver this idea, we built a backend API to handle external data fetching and processing, coupled with a frontend interface for user interaction. Crucially, we integrated IRS regional data to allow users to filter by locality since we recognized that geographic preference is a significant driver of donation retention. 

## *How it works:* 
1.  Go to the site, and answer the four short survey questions centered around user values and locality preference.
2.  Click the **'Get survey results'** button to view the top three randomly selected organizations matching your criteria.
3.  If you want more options, click **'Load more'** to view three additional charities at a time (up to a total limit of 15).
4.  If you discover an organization you love, or simply want a new search, refresh the page and complete the survey again to receive a new set of recommendations!

### Testing: 
Backend:
``` bash
cd /path/to/your/directory
sqlite3 data/charities.db "SELECT COUNT(*) FROM charities;"
export EVERY_API_KEY=-_____
cd backend
source .venv/bin/activate
-r requirements.txt
uvicorn app:app --reload --host 0.0.0.0 --port 8000
```
Frontend:
``` bash
cd /path/to/your/directory/docs
python3 -m http.server 5500
```

# Local Set-up and Testing for Developers
## 1. IRS Data Cleaning Workflow
We integrate IRS regional data to allow users to filter by locality. Before running the application, we needed a local SQLite database.

1.  **Get IRS Data:** Download the four IRS EO BMF CSV region files and place them into the local `data/` directory.
2.  **Configure Script:** Update the `REGION_FILES` list near the top of `scripts/clean_irs_data.py` to point to the correct CSV filenames.
3.  **Run Cleaning Script:**
    ```bash
    pip install pandas
    python scripts/clean_irs_data.py
    ```
 The script merges, standardizes, and filters the raw CSVs, then writes the cleaned output to `data/cleaned_irs_charities.csv`.

4.  **Verify Database Count:**
    ```bash
    sqlite3 data/charities.db "SELECT COUNT(*) FROM charities;"
    ```

## 2. Backend Setup

1.  **Set API Key:** Obtain an Every.org API key and export it as an environment variable.

    Note: Use a `.env` file or export your key directly. `EVERY_API_KEY` is required.
    ```bash
    export EVERY_API_KEY=YOUR_API_KEY
    ```

3.  **Activate Environment & Run Server:**
    ```bash
    cd backend
    source .venv/bin/activate
    pip install -r requirements.txt
    uvicorn app:app --reload --host 0.0.0.0 --port 8000
    ```

    The backend should now be running locally at `http://localhost:8000`.

## 3. Frontend Setup

The frontend is served as static files located in the `docs` folder.

1.  **Configure API Base:** For local testing, ensure `docs/config.json` has `apiBase` set to the local backend URL:
    ```json
    {
      "apiBase": "http://localhost:8000"
    }
    ```

2.  **Serve Files:**
    ```bash
    cd docs
    python3 -m http.server 5500
    ```

3.  **Access App:** Open your browser to `http://localhost:5500` to interact with the frontend.

    
## 4. Deployment (Railway + GitHub Pages)
This guide outlines deploying the backend on Railway and the frontend via GitHub Pages.

1.  **Deploy Backend on Railway**
    * Create a Railway project and connect this GitHub repo.
    * Set the **Root Directory** to `backend`.
    * Set the **Build Command** to `pip install -r requirements.txt`.
    * Set the **Start Command** to `uvicorn app:app --host 0.0.0.0 --port $PORT`.
    * Add the `EVERY_API_KEY` in the **Variables** tab.

2.  **Grab Public URL**
    * Open the service on Railway and go to **Settings → Domains**. Copy the generated public URL (e.g., `https://*.up.railway.app`).
    * Verify the API by visiting `<your-url>/docs` in your browser.

3.  **Point Frontend to Railway**
    * Edit `docs/config.json` and set `apiBase` to the Railway URL you copied (ensure there is no trailing slash).
    * Commit and push this change to update GitHub Pages.

4.  **Allow GitHub Pages Origin (CORS)**
    * Ensure your GitHub Pages domain (e.g., `https://map9900.github.io`) is included in the `ALLOWED_ORIGINS` list within `backend/app.py`.
    * Redeploy the backend whenever this list changes.

5.  **Publish Frontend**
    * Enable GitHub Pages (**Settings → Pages**) to serve from the `/docs` folder on the `main` branch.
    * After building, open the Pages URL to test the live application.

If something fails, recheck the Railway logs (Deployments tab) for backend errors, verify `apiBase` in `docs/config.json` has no trailing slash or typos, and confirm CORS is configured for your Pages domain.


#### Personal Testing: 

Backend:
```bash
cd '/Users/matthewplambeck/Desktop/Charity_Recommender copy'
sqlite3 data/charities.db "SELECT COUNT(*) FROM charities;"
export EVERY_API_KEY=pk_live_eb9141b3fe7b78b7644c2c838016abd5
cd backend
source .venv/bin/activate
-r requirements.txt
uvicorn app:app --reload --host 0.0.0.0 --port 8000
```
Frontend:
```bash
cd '/Users/matthewplambeck/Desktop/Charity_Recommender copy/docs'
python3 -m http.server 5500
```
