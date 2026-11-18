import math

from app.ml.forest import SpeedForest
from app.store import load_store


def test_training_rows_cover_every_area_and_window():
    store = load_store()
    rows = store.training_rows()
    assert len(rows) == 42
    assert {row["window"] for row in rows} == {"M", "A", "E"}
    assert len({tuple(row["x"][1:]) for row in rows}) == 14


def test_prediction_is_a_finite_speed_and_evaluation_covers_every_row():
    store = load_store()
    forest = SpeedForest(store).train()
    speed = forest.predict(555, 18.53, 73.85)
    assert math.isfinite(speed)
    assert 0 < speed < 80

    report = forest.evaluate()
    assert report["samples"] == 42
    assert report["folds"] == 3
    assert report["trees"] == 32
    for side in ("forest", "baseline"):
        assert report[side]["mae"] >= 0
        assert report[side]["rmse"] >= report[side]["mae"]
        assert math.isfinite(report[side]["rmse"])
