# Charity Advisor: Finding Your Perfect Match

The live Website: https://map9900.github.io/Charity_Advisor/index.html 

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

### Testing: (No longer Applicable since website is hosted live now!)
Backend:
``` bash
cd /path/to/your/directory
sqlite3 data/charities.db "SELECT COUNT(*) FROM charities;" #Test Step!
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

#### Personal Testing: 

Backend:
```bash
cd '/Users/matthewplambeck/Desktop/Charity_Recommender copy'
sqlite3 data/charities.db "SELECT COUNT(*) FROM charities;"
export EVERY_API_KEY=_Super_Secret_Code_
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
