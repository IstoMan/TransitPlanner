# Pune Transit Planner

A static, browser-based Pune transit planning demo.

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

On Windows, double-click `run.bat`, or open `index.html` in a browser.

No build step or package installation is required. The app loads Google Fonts from the internet; the rest of the current application is static.

## Notes

- The original inline CSS has been moved to `css/style.css`.
- The original inline JavaScript has been moved to `js/script.js`.
- Weather and Reports are separate views accessible from the side navigation; the trip planner remains the default view.
- Bus estimates use a deterministic, in-browser random forest trained on the bundled area-by-time-window sample speeds when a direct route sample is unavailable. Direct route samples and other travel-mode calculations are unchanged.
- Transit estimates and the weather snapshot remain illustrative/sample information, not live service or weather data.
