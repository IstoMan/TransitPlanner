# Pune Transit Planner

An interactive Pune transit planner with bus-speed estimates powered by a Random Forest regression model.

## Machine-learning approach

- **Training samples:** 42 bundled bus-speed observations from 14 areas across three historical time windows.
- **Features:** Time of day and the trip's midpoint latitude and longitude.
- **Model:** 32 deterministically seeded regression trees. Each tree trains on a bootstrap sample and uses randomized feature selection when splitting.
- **Prediction:** The model averages the trees' predicted speeds. The planner uses this estimate for bus travel times when a direct historical route sample is unavailable; direct route samples retain priority.
- **Scope:** Predictions use sample data and are not live transit information. No accuracy score is claimed.

## Project structure

```text
Pune-Transit-Planner/
├── index.html          # Page structure and content
├── css/
│   └── style.css       # Application styles
├── js/
│   └── script.js       # Application logic and sample data
├── assets/
│   ├── images/         # Add image assets here
│   └── icons/          # Add icon assets here
├── data/               # Add external datasets here
├── .gitignore
├── run.bat             # Opens the app in your default browser
└── README.md
```

## Run locally

On Windows, double-click `run.bat`, or open `index.html` in a browser. The model runs in the browser without an external ML package.

No build step or package installation is required. The app loads Google Fonts from the internet.

## Notes

- The original inline CSS has been moved to `css/style.css`.
- The original inline JavaScript has been moved to `js/script.js`.
- Weather and Reports are separate views accessible from the side navigation; the trip planner remains the default view.
- Weather and Reports are separate views accessible from the side navigation; the trip planner remains the default view.
- Transit estimates and the weather snapshot are illustrative sample information, not live service or weather data.
