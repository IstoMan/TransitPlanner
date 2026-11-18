from __future__ import annotations

import math

from app.ml.forest import SpeedForest
from app.store import SAMPLE_THRESHOLD, Place, Store

SHORT_KM = 8
ROAD_FACTOR = 1.3


class SamePlaceError(ValueError):
    pass


class UnknownPlaceError(KeyError):
    pass


def haversine_km(origin: Place, destination: Place) -> float:
    radians = math.pi / 180
    delta_lat = (destination.lat - origin.lat) * radians
    delta_lon = (destination.lon - origin.lon) * radians
    hav = (
        math.sin(delta_lat / 2) ** 2
        + math.cos(origin.lat * radians)
        * math.cos(destination.lat * radians)
        * math.sin(delta_lon / 2) ** 2
    )
    return 12742 * math.asin(math.sqrt(hav))


def format_minutes(minutes: int) -> str:
    minutes %= 1440
    return f"{minutes // 60:02d}:{minutes % 60:02d}"


def js_round(value: float) -> int:
    return int(math.floor(value + 0.5))


def js_to_fixed(value: float, digits: int) -> str:
    scale = 10**digits
    rounded = math.floor(value * scale + 0.5) / scale
    return f"{rounded:.{digits}f}"


def _plural(count: int, word: str) -> str:
    suffix = "" if count == 1 else "s"
    return f"{count} {word}{suffix}"


def plan_trip(
    store: Store,
    forest: SpeedForest,
    origin_name: str,
    destination_name: str,
    minutes: int,
    passengers: int,
) -> dict:
    origin = store.place(origin_name)
    destination = store.place(destination_name)
    if origin is None or destination is None:
        raise UnknownPlaceError(origin_name if origin is None else destination_name)
    if origin.name == destination.name:
        raise SamePlaceError("Choose two different places")

    window = store.window_for(minutes)
    model_speed = forest.predict(
        minutes,
        (origin.lat + destination.lat) / 2,
        (origin.lon + destination.lon) / 2,
    )
    distance = haversine_km(origin, destination) * ROAD_FACTOR
    short = distance <= SHORT_KM
    peak = window is not None and window.key in {"M", "E"}
    route = store.route(origin.name, destination.name)
    historical_speed = None
    if route is not None and window is not None:
        historical_speed = route["speeds_kmh"].get(window.key)
    direct = historical_speed is not None
    bus_speed = float(historical_speed if direct else model_speed)
    observations = store.observations(origin.name, window)
    if window is not None:
        headway = min(20, max(3, (window.end - window.start) / max(1, observations) / 2))
    else:
        headway = 10
    transfer = 0 if direct else 10
    bus_minutes = distance / bus_speed * 60 + headway + 10 + transfer
    traffic_speed = store.series_speed(window)

    if direct:
        lines = ", ".join(route["lines"])
        bus_note = f"Historical route sample: {lines} · ~{js_round(bus_speed)} km/h"
        bus_sub = f"Includes ~{js_round(headway)} min wait and ~10 min walking"
    else:
        bus_note = "No direct route in the samples; a transfer is assumed"
        bus_sub = f"Includes ~{js_round(headway)} min wait and ~10 min walking plus a transfer"

    options = [
        {
            "id": "bus",
            "name": "Bus",
            "available": True,
            "minutes": bus_minutes,
            "fare_inr": (8 + 1.5 * distance) * passengers,
            "note": bus_note,
            "sub": bus_sub,
            "kind": "bus",
        }
    ]
    if origin.metro and destination.metro:
        metro_fare = min(35, max(10, js_round(distance * 1.8))) * passengers
        options.append(
            {
                "id": "metro",
                "name": "Metro",
                "available": True,
                "minutes": distance * 0.95 / 32 * 60 + 6 + 12,
                "fare_inr": metro_fare,
                "note": "Both places are near a metro station · ~32 km/h average",
                "sub": "Includes ~6 min wait and ~12 min to reach and enter stations",
                "kind": "metro",
            }
        )
    else:
        options.append(
            {
                "id": "metro",
                "name": "Metro",
                "available": False,
                "minutes": None,
                "fare_inr": None,
                "note": "Not available for this pair",
                "sub": "Both places need a metro station nearby",
                "kind": "metro",
            }
        )

    cabs = math.ceil(passengers / 4)
    autos = math.ceil(passengers / 3)
    surge = 1.15 if peak else 1
    people = _plural(passengers, "passenger")
    options.append(
        {
            "id": "cab",
            "name": "Cab",
            "available": True,
            "minutes": distance / (traffic_speed * 1.25) * 60 + 5,
            "fare_inr": (60 + 15 * distance) * surge * cabs,
            "note": f"{_plural(cabs, 'cab')} for {people} · door to door",
            "sub": (
                "Typical city rate with a peak-hour uplift; not a provider quote"
                if peak
                else "Typical city rate; not a provider quote"
            ),
            "kind": "ride",
        }
    )
    options.append(
        {
            "id": "auto",
            "name": "Auto",
            "available": True,
            "minutes": distance / (traffic_speed * 1.1) * 60 + 4,
            "fare_inr": (30 + 17 * max(0, distance - 1.5)) * autos,
            "note": f"{_plural(autos, 'auto')} for {people} · door to door",
            "sub": "Typical meter-style estimate; not a provider quote",
            "kind": "ride",
        }
    )

    available = [option["minutes"] for option in options if option["minutes"] is not None]
    best = min(available) if available else None
    for option in options:
        option["fastest"] = bool(short and option["minutes"] is not None and option["minutes"] == best)

    if short:
        length_word = "short trip"
        length_note = f"Fastest option is marked below for trips up to {SHORT_KM} km."
    else:
        length_word = "longer trip"
        length_note = (
            f"Over {SHORT_KM} km, traffic and transfers make times vary widely, "
            "so no option is marked fastest."
        )
    if direct:
        speed_note = f"Bus speed from the historical route sample ({js_to_fixed(bus_speed, 1)} km/h)."
        bus_source = "historical"
    else:
        speed_note = f"Bus speed estimated by the random forest ({js_to_fixed(bus_speed, 1)} km/h)."
        bus_source = "model"

    return {
        "origin": origin.name,
        "destination": destination.name,
        "time": format_minutes(minutes),
        "passengers": passengers,
        "distance_km": distance,
        "short_trip": short,
        "model_speed_kmh": model_speed,
        "bus_speed_kmh": bus_speed,
        "bus_speed_source": bus_source,
        "historical_routes": route["lines"] if direct else None,
        "banner": {
            "title": f"{js_to_fixed(distance, 1)} km by road (estimated) · {length_word}",
            "detail": length_note,
            "speed": speed_note,
        },
        "options": options,
    }


def sample_context(store: Store, minutes: int) -> dict:
    window = store.window_for(minutes)
    bars = []
    for place in store.places:
        observations = store.observations(place.name, window)
        bars.append(
            {
                "name": place.name,
                "observations": observations,
                "sparse": observations < SAMPLE_THRESHOLD,
            }
        )
    bars.sort(key=lambda bar: bar["observations"], reverse=True)
    series = store.city["ser"]
    if window is None:
        speed_label = "All sample windows"
        window_note = f"No historical sample near {format_minutes(minutes)}"
        median = float(store.city["speed"])
    else:
        speed_label = f"Window {window.label}"
        window_note = f"Historical sample window {window.label} · not live arrivals"
        median = store.series_speed(window)
    return {
        "time": format_minutes(minutes),
        "window": None if window is None else window.key,
        "window_label": None if window is None else window.label,
        "historical_trips": store.city["trips"],
        "sparse_count": sum(1 for bar in bars if bar["sparse"]),
        "area_count": len(store.places),
        "median_speed_kmh": median,
        "median_speed_label": speed_label,
        "window_note": window_note,
        "bars": bars,
        "series": {
            "labels": [format_minutes(minute) for minute in series["t"]],
            "median_speed": series["sp"],
            "heavy_congestion": series["hv"],
            "bus_trips": series["tr"],
        },
    }
