# Transit speed samples

## Model input

The Random Forest training rows are assembled in `js/script.js` from the bundled area-by-window values in `DATA.A`, area coordinates in `P`, and window midpoints in `WIN`.

- Each of the 14 areas contributes one speed value for each of the three time windows, for 42 rows total.
- The target is the speed value at `DATA.A[area][window][3]`, in km/h.
- Features are the normalized window midpoint (`minutes / 1440`), latitude, and longitude.

## Evaluation

The Reports page runs leave-one-window-out cross-validation. Each of the three folds trains on two windows and tests on the remaining window, so all 42 rows are evaluated once. A baseline predicts the mean speed from the two training windows. MAE and RMSE are reported in km/h for both approaches; lower values indicate smaller errors on these samples.

This is an internal diagnostic, not an independent real-world validation: the dataset has only three aggregate time windows and repeats the same 14 areas across folds.

## Provenance and limitations

The repository does not include the original source file, collection dates, license, or underlying route-level observations for these bundled values. Their real-world provenance cannot be verified from the repository. Treat them as demonstration samples, not authoritative transit measurements. No real-world accuracy claim should be made from the displayed cross-validation metrics.

For production use, replace or substantiate these samples with a documented source and retain its publisher, URL, license, collection/valid dates, units, and raw observation granularity.
