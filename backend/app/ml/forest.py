from __future__ import annotations

from dataclasses import dataclass

import numpy as np
from sklearn.ensemble import RandomForestRegressor

from app.store import Store

TREE_COUNT = 32
MAIN_SEED = 8421


def make_forest(random_state: int) -> RandomForestRegressor:
    return RandomForestRegressor(
        n_estimators=TREE_COUNT,
        max_depth=5,
        min_samples_split=4,
        min_samples_leaf=2,
        max_features=1,
        bootstrap=True,
        random_state=random_state,
        n_jobs=1,
    )


def fit_rows(rows: list[dict], random_state: int) -> RandomForestRegressor:
    model = make_forest(random_state)
    model.fit(
        np.array([row["x"] for row in rows], dtype=float),
        np.array([row["y"] for row in rows], dtype=float),
    )
    return model


def _summarize(errors: list[float]) -> dict[str, float]:
    count = len(errors)
    mae = sum(abs(error) for error in errors) / count
    rmse = (sum(error * error for error in errors) / count) ** 0.5
    return {"mae": mae, "rmse": rmse}


@dataclass
class SpeedForest:
    store: Store
    model: RandomForestRegressor | None = None

    def train(self) -> SpeedForest:
        self.model = fit_rows(self.store.training_rows(), MAIN_SEED)
        return self

    def predict(self, minutes: int, lat: float, lon: float) -> float:
        if self.model is None:
            raise RuntimeError("Speed model is not trained")
        features = np.array([[minutes / 1440, lat, lon]], dtype=float)
        return float(self.model.predict(features)[0])

    def evaluate(self) -> dict:
        rows = self.store.training_rows()
        errors: list[float] = []
        baseline_errors: list[float] = []
        for fold_index, held in enumerate(self.store.windows):
            train = [row for row in rows if row["window"] != held]
            test = [row for row in rows if row["window"] == held]
            forest = fit_rows(train, 20000 + fold_index * TREE_COUNT)
            baseline = sum(row["y"] for row in train) / len(train)
            predictions = forest.predict(np.array([row["x"] for row in test], dtype=float))
            for row, prediction in zip(test, predictions):
                errors.append(float(prediction) - row["y"])
                baseline_errors.append(baseline - row["y"])
        return {
            "samples": len(errors),
            "folds": len(self.store.windows),
            "trees": TREE_COUNT,
            "forest": _summarize(errors),
            "baseline": _summarize(baseline_errors),
        }
