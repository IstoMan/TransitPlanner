import pytest

from app.ml.forest import SpeedForest
from app.planner import SamePlaceError, UnknownPlaceError, plan_trip, sample_context
from app.store import load_store


@pytest.fixture(scope="module")
def planned():
    store = load_store()
    return store, SpeedForest(store).train()


def test_direct_sample_beats_the_model_and_metro_needs_both_stations(planned):
    store, forest = planned
    historical = plan_trip(store, forest, "Pimpri", "Hinjawadi", 14 * 60 + 30, 1)
    assert historical["bus_speed_source"] == "historical"
    assert historical["bus_speed_kmh"] == 39.6
    assert historical["historical_routes"] == ["379"]
    assert [option["id"] for option in historical["options"]] == ["bus", "metro", "cab", "auto"]
    metro = historical["options"][1]
    assert metro["available"] is False
    assert metro["minutes"] is None
    assert metro["via"] is None
    assert metro["legs"] is None
    assert metro["note"] == "The nearest station is already the metro end"

    predicted = plan_trip(store, forest, "Pimpri", "Hinjawadi", 9 * 60 + 15, 1)
    assert predicted["bus_speed_source"] == "model"
    assert predicted["bus_speed_kmh"] == pytest.approx(predicted["model_speed_kmh"])
    assert "transfer" in predicted["options"][0]["sub"]


def test_metro_is_offered_when_both_places_have_a_station(planned):
    store, forest = planned
    result = plan_trip(store, forest, "Deccan", "Shivajinagar", 9 * 60 + 15, 2)
    metro = next(option for option in result["options"] if option["id"] == "metro")
    assert result["short_trip"] is True
    assert metro["available"] is True
    assert metro["name"] == "Metro"
    assert metro["via"] is None
    assert metro["access_mode"] is None
    assert metro["legs"] is None
    assert metro["fare_inr"] == next(
        option["fare_inr"]
        for option in plan_trip(store, forest, "Deccan", "Shivajinagar", 9 * 60 + 15, 1)["options"]
        if option["id"] == "metro"
    ) * 2
    assert any(option["fastest"] for option in result["options"])


def test_mixed_metro_rides_the_nearest_other_station(planned):
    store, forest = planned
    result = plan_trip(store, forest, "Hinjawadi", "Swargate", 9 * 60 + 15, 1)
    metro = next(option for option in result["options"] if option["id"] == "metro")
    assert metro["available"] is True
    assert metro["via"] == "Pimpri"
    assert metro["access_mode"] in {"bus", "cab", "auto"}
    assert [leg["mode"] for leg in metro["legs"]] == [metro["access_mode"], "metro"]
    assert [(leg["from"], leg["to"]) for leg in metro["legs"]] == [
        ("Hinjawadi", "Pimpri"),
        ("Pimpri", "Swargate"),
    ]
    assert metro["minutes"] == pytest.approx(sum(leg["minutes"] for leg in metro["legs"]))
    assert metro["fare_inr"] == pytest.approx(sum(leg["fare_inr"] for leg in metro["legs"]))
    assert metro["name"] == f"{metro['access_mode'].title()} + Metro"
    assert "Pimpri" in metro["note"]

    onward = plan_trip(store, forest, "Deccan", "Wagholi", 9 * 60 + 15, 2)
    mixed = next(option for option in onward["options"] if option["id"] == "metro")
    assert mixed["via"] == "Viman Nagar"
    assert [leg["mode"] for leg in mixed["legs"]] == ["metro", mixed["access_mode"]]
    assert mixed["legs"][0]["from"] == "Deccan"
    assert mixed["legs"][0]["to"] == "Viman Nagar"
    assert mixed["legs"][1]["to"] == "Wagholi"
    assert mixed["minutes"] == pytest.approx(sum(leg["minutes"] for leg in mixed["legs"]))
    assert mixed["fare_inr"] == pytest.approx(sum(leg["fare_inr"] for leg in mixed["legs"]))


def test_peak_cab_fare_and_passenger_split(planned):
    store, forest = planned
    morning = plan_trip(store, forest, "Wagholi", "Swargate", 9 * 60 + 15, 4)
    afternoon = plan_trip(store, forest, "Wagholi", "Swargate", 14 * 60 + 30, 4)
    crowded = plan_trip(store, forest, "Wagholi", "Swargate", 14 * 60 + 30, 5)
    morning_cab = next(option for option in morning["options"] if option["id"] == "cab")
    afternoon_cab = next(option for option in afternoon["options"] if option["id"] == "cab")
    crowded_cab = next(option for option in crowded["options"] if option["id"] == "cab")
    assert morning["short_trip"] is False
    assert all(option["fastest"] is False for option in morning["options"])
    assert morning_cab["fare_inr"] == pytest.approx(afternoon_cab["fare_inr"] * 1.15)
    assert crowded_cab["fare_inr"] == pytest.approx(afternoon_cab["fare_inr"] * 2)
    assert "2 cabs" in crowded_cab["note"]


def test_same_place_and_unknown_place(planned):
    store, forest = planned
    with pytest.raises(SamePlaceError):
        plan_trip(store, forest, "Katraj", "Katraj", 9 * 60, 1)
    with pytest.raises(UnknownPlaceError):
        plan_trip(store, forest, "Katraj", "Nowhere", 9 * 60, 1)


def test_context_uses_the_window_series_and_marks_a_distant_time():
    store = load_store()
    morning = sample_context(store, 9 * 60 + 15)
    assert morning["window"] == "M"
    assert morning["median_speed_kmh"] == pytest.approx((33.6 + 34.0) / 2)
    assert morning["historical_trips"] == 5114
    assert morning["sparse_count"] == sum(1 for bar in morning["bars"] if bar["sparse"])
    assert morning["bars"][0]["observations"] >= morning["bars"][-1]["observations"]

    overnight = sample_context(store, 0)
    assert overnight["window"] is None
    assert overnight["median_speed_kmh"] == 30.8
    assert overnight["sparse_count"] == 14
    assert overnight["window_note"].startswith("No historical sample near")
