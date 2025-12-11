# Charity Advisor: Finding Your Perfect Match
## Highlights 
- Using our frontend interface, answer four questions to find charitable organizations matching your ethical desires!
- Our mostly automated process involves contacting a SQLite database using our provided API key.
- All organizations included in the search are IRS verified organiztions, ensuring a level of operation effectiveness. 

## Overview
As the charitable sector continues to expand, the overwhelming number of options leads to choice fatigue, and subsequently, lower donation frequency among Americans. Our **Charity_Advisor** simplifies the search using the leading charity-based API, Every.org; the site provides access to one million IRS 501(c)(3) organizations corresponding the NTEE Codes established by the IRS surrounding organization purpose. 

*How it works:* 
1. To find your potential match, answer four simple questions centered around user values and locality preference.
2. After your four selections, run your search using the 'Get survey results' button to find the top three randomly selected organizations.
3. If these results aren’t the right fit, use the 'Load more' button to view three additional charities at a time until the limit of fifteen.
4. If you discover an organization you love, as we're certain you will, and want to explore more options, simply refresh the page and complete the survey again to receive a new set of recommendations!

## Testing: 
Backend:
``` python
cd /path/to/your/directory
sqlite3 data/charities.db "SELECT COUNT(*) FROM charities;"
export EVERY_API_KEY=-_____
cd backend
source .venv/bin/activate
-r requirements.txt
uvicorn app:app --reload --host 0.0.0.0 --port 8000
```
Frontend:
``` python
cd /path/to/your/directory/docs
python3 -m http.server 5500
```

## Deployment (Railway + GitHub Pages)

1. **Deploy the backend on Railway.** Create a Railway project, connect this GitHub repo, and (under Advanced settings) set the root directory to `backend`. Use `pip install -r requirements.txt` as the build command and `uvicorn app:app --host 0.0.0.0 --port $PORT` as the start command. Add `EVERY_API_KEY` in the Variables tab so it is available during runtime.
2. **Grab the public URL.** Open the service on Railway and go to **Settings → Domains**. Copy the generated `https://*.up.railway.app` URL; visit `<your-url>/docs` in a browser to confirm the FastAPI Swagger UI loads. That endpoint is what the frontend will call.
3. **Point the frontend at Railway.** Edit `docs/config.json` so that `apiBase` matches the Railway URL you copied. Commit and push so GitHub Pages receives the update; switch it back to `http://localhost:8000` only when testing locally.
4. **Allow the Pages origin.** Make sure your GitHub Pages origin (for example `https://map9900.github.io`) exists in the `ALLOWED_ORIGINS` list in `backend/app.py`. Redeploy the backend whenever this list changes.
5. **Publish the docs folder.** Enable GitHub Pages (Settings → Pages) to serve from the `/docs` folder on `main`. After Pages finishes building, open the site and test the survey—it should call the Railway API you verified in step 2.

If something fails, recheck the Railway logs (Deployments tab) for backend errors, verify `apiBase` in `docs/config.json` has no trailing slash or typos, and confirm CORS is configured for your Pages domain.

## Our Process 
Our approach leverages the Every.org Charity API NTEE Codes as the core mechanism to match user values with organizational missions. In order to deliver this idea, we built a backend API to handle external data fetching and processing, coupled with a frontend interface for user interaction. Crucially, we integrated IRS regional data to allow users to filter by locality since we recognized that geographic preference is a significant driver of donation retention. 

## IRS Data Cleaning Workflow
To build the offline dataset of IRS 501(c)(3) organizations:

1. Download the four IRS EO BMF CSV region files into the local `data/` directory.
2. Update `REGION_FILES` near the top of `scripts/build_clean_irs_dataframe.py` so that each entry points to the correct CSV filename.
3. Install dependencies (pandas is required) and run:
   ```
   python scripts/build_clean_irs_dataframe.py
   ```
4. The script merges, standardizes, and filters the raw CSVs, then writes the cleaned output to `data/cleaned_irs_charities.csv`. The console log includes row counts before/after cleaning plus a quick sample of the resulting data.

This cleaned file can then be used for the subsequent database import step.



Testing: 

Backend:

cd '/Users/matthewplambeck/Desktop/Charity_Recommender copy'
sqlite3 data/charities.db "SELECT COUNT(*) FROM charities;"
export EVERY_API_KEY=pk_live_eb9141b3fe7b78b7644c2c838016abd5
cd backend
source .venv/bin/activate
-r requirements.txt
uvicorn app:app --reload --host 0.0.0.0 --port 8000

Frontend:
cd '/Users/matthewplambeck/Desktop/Charity_Recommender copy/docs'
python3 -m http.server 5500
