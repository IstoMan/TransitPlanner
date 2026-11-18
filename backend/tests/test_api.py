import math

import pytest
from fastapi.testclient import TestClient

from app.main import app


@pytest.fixture(scope="module")
def client():
    with TestClient(app) as test_client:
        yield test_client


def test_places_weather_and_map(client):
    places = client.get("/api/places")
    assert places.status_code == 200
    body = places.json()
    assert len(body) == 14
    assert body[0]["name"] == "Pimpri"
    assert body[0]["metro"] is True

    weather = client.get("/api/weather")
    assert weather.status_code == 200
    assert weather.json()["rain_chance"] == 10
    assert weather.json()["temp_c"] == 19

    geometry = client.get("/api/map")
    assert geometry.status_code == 200
    payload = geometry.json()
    names = {place["name"] for place in payload["places"]}
    assert len(payload["rivers"]) == 2
    assert "purple" in payload["metro"] and "aqua" in payload["metro"]
    for road in payload["roads"]:
        assert set(road) <= names


def test_plan_and_evaluation(client):
    response = client.post(
        "/api/plan",
        json={"from": "Deccan", "to": "Shivajinagar", "time": "09:15", "passengers": 1},
    )
    assert response.status_code == 200
    body = response.json()
    assert body["bus_speed_source"] in {"historical", "model"}
    assert math.isfinite(body["model_speed_kmh"])
    assert len(body["options"]) == 4
    assert body["options"][1]["available"] is True

    missing_station = client.post(
        "/api/plan",
        json={"from": "Hinjawadi", "to": "Warje", "time": "09:15", "passengers": 1},
    )
    assert missing_station.json()["options"][1]["available"] is False

    same = client.post(
        "/api/plan",
        json={"from": "Katraj", "to": "Katraj", "time": "09:15", "passengers": 1},
    )
    assert same.status_code == 400
    assert same.json()["detail"] == "Choose two different places"

    unknown = client.post(
        "/api/plan",
        json={"from": "Katraj", "to": "Nowhere", "time": "09:15", "passengers": 1},
    )
    assert unknown.status_code == 404

    invalid = client.post(
        "/api/plan",
        json={"from": "Katraj", "to": "Warje", "time": "25:00", "passengers": 0},
    )
    assert invalid.status_code == 422

    report = client.get("/api/evaluation")
    assert report.status_code == 200
    evaluation = report.json()
    assert evaluation["samples"] == 42
    assert evaluation["folds"] == 3
    assert evaluation["forest"]["mae"] >= 0
    assert "not a measure of real-world" in evaluation["description"]


def test_context_rejects_a_bad_clock(client):
    ok = client.get("/api/context", params={"time": "14:30"})
    assert ok.status_code == 200
    assert ok.json()["window"] == "A"
    bad = client.get("/api/context", params={"time": "14:60"})
    assert bad.status_code == 422
