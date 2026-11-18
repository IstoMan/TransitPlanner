from __future__ import annotations

import json
from dataclasses import dataclass
from pathlib import Path

DATA_PATH = Path(__file__).resolve().parent.parent / "data" / "samples.json"
SAMPLE_THRESHOLD = 40


@dataclass(frozen=True)
class Place:
    name: str
    lat: float
    lon: float
    metro: bool


@dataclass(frozen=True)
class Window:
    key: str
    start: int
    end: int
    mid: int
    label: str


class Store:
    def __init__(self, payload: dict):
        self.places = [
            Place(item["name"], item["lat"], item["lon"], item["metro"])
            for item in payload["places"]
        ]
        self.by_name = {place.name: place for place in self.places}
        self.windows = {
            key: Window(key, spec["start"], spec["end"], spec["mid"], spec["label"])
            for key, spec in payload["windows"].items()
        }
        self.areas = payload["areas"]
        self.routes = payload["routes"]
        self.city = payload["city"]
        self.geometry = payload["geometry"]
        self.weather = payload["weather"]

    def place(self, name: str) -> Place | None:
        return self.by_name.get(name)

    def window_for(self, minutes: int) -> Window | None:
        best = None
        best_distance = 10**9
        for window in self.windows.values():
            distance = abs(minutes - window.mid)
            if distance < best_distance:
                best = window
                best_distance = distance
        if best is None or best_distance > 180:
            return None
        return best

    def observations(self, name: str, window: Window | None) -> float:
        if window is None:
            return 0
        return float(self.areas[name][window.key][1])

    def area_speed(self, name: str, window_key: str) -> float:
        return float(self.areas[name][window_key][3])

    def route(self, origin: str, destination: str) -> dict | None:
        return self.routes.get(f"{origin}|{destination}") or self.routes.get(
            f"{destination}|{origin}"
        )

    def training_rows(self) -> list[dict]:
        rows = []
        for place in self.places:
            for window in self.windows.values():
                rows.append(
                    {
                        "window": window.key,
                        "x": [window.mid / 1440, place.lat, place.lon],
                        "y": self.area_speed(place.name, window.key),
                    }
                )
        return rows

    def series_speed(self, window: Window | None) -> float:
        if window is None:
            return float(self.city["speed"])
        series = self.city["ser"]
        speeds = [
            speed
            for minute, speed in zip(series["t"], series["sp"])
            if window.start - 1 <= minute <= window.end
        ]
        return sum(speeds) / len(speeds)

    def sparse(self, name: str, minutes: int) -> bool:
        return self.observations(name, self.window_for(minutes)) < SAMPLE_THRESHOLD


def load_store(path: Path = DATA_PATH) -> Store:
    return Store(json.loads(path.read_text()))
