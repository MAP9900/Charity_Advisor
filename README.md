# Charity Recommender

Data Source 1: https://docs.every.org/docs/endpoints/nonprofit-search

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



## Running the project

These steps assume you already have the repo on disk at `/Users/matthewplambeck/Desktop/Charity_Recommender copy`, Python 3.11+, and SQLite installed. Replace paths as needed for your own machine.

### 1. Prep the dataset

```
cd '/Users/matthewplambeck/Desktop/Charity_Recommender copy'
sqlite3 data/charities.db "SELECT COUNT(*) FROM charities;"
```

If the query returns `0`, build/import the charity data before continuing (see the IRS workflow above). Otherwise you are ready to launch the backend.

### 2. Start the backend API

```
cd '/Users/matthewplambeck/Desktop/Charity_Recommender copy/backend'
python -m venv .venv  # skip if the env already exists
source .venv/bin/activate
pip install -r requirements.txt
export EVERY_API_KEY=__________
uvicorn app:app --reload --host 0.0.0.0 --port 8000
```

The `EVERY_API_KEY` powers the nonprofit search endpoint; inject your own key if you have one. Uvicorn exposes the FastAPI server at `http://localhost:8000` with auto-reload enabled for development.

### 3. Run the static frontend

```
cd '/Users/matthewplambeck/Desktop/Charity_Recommender copy/docs'
python3 -m http.server 5500
```

Visit `http://localhost:5500` to load the static UI. It will call the backend running on port 8000. Stop both servers with `Ctrl+C` when you are done testing.
