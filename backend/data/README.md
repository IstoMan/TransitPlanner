# Transit speed samples

`samples.json` is the bundled demonstration data for the API and the random forest.

## Model input

Training rows are one speed for each of the 14 areas in each of the three time windows, 42 rows in total.

- The target is `areas[area][window][3]`, in km/h.
- `areas[area][window][1]` is the observation count used for sample coverage and the bus wait estimate.
- Features are the normalized window midpoint (`minutes / 1440`), latitude, and longitude.

Direct route speeds in `routes` still take priority over the model when the selected window has a sample for that pair.

## Evaluation

The API runs leave-one-window-out cross-validation with scikit-learn's `RandomForestRegressor`. Each of the three folds trains on two windows and tests on the remaining window, so all 42 rows are evaluated once. A baseline predicts the mean speed from the two training windows. MAE and RMSE are reported in km/h for both approaches; lower values indicate smaller errors on these samples.

This is an internal diagnostic, not an independent real-world validation: the dataset has only three aggregate time windows and repeats the same 14 areas across folds.

## Provenance and limitations

The repository does not include the original source file, collection dates, license, or underlying route-level observations for these bundled values. Their real-world provenance cannot be verified from the repository. Treat them as demonstration samples, not authoritative transit measurements. No real-world accuracy claim should be made from the displayed cross-validation metrics.

For production use, replace or substantiate these samples with a documented source and retain its publisher, URL, license, collection/valid dates, units, and raw observation granularity.
