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


def road_distance(origin: Place, destination: Place) -> float:
    return haversine_km(origin, destination) * ROAD_FACTOR


def _bus_estimate(
    store: Store,
    forest: SpeedForest,
    origin: Place,
    destination: Place,
    minutes: int,
    passengers: int,
    window,
    model_speed: float | None = None,
) -> dict:
    distance = road_distance(origin, destination)
    if model_speed is None:
        model_speed = forest.predict(
            minutes,
            (origin.lat + destination.lat) / 2,
            (origin.lon + destination.lon) / 2,
        )
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
    return {
        "minutes": distance / bus_speed * 60 + headway + 10 + transfer,
        "fare_inr": (8 + 1.5 * distance) * passengers,
        "distance": distance,
        "speed": bus_speed,
        "direct": direct,
        "headway": headway,
        "route": route,
        "model_speed": float(model_speed),
    }


def _cab_estimate(distance: float, traffic_speed: float, peak: bool, passengers: int) -> dict:
    cabs = math.ceil(passengers / 4)
    surge = 1.15 if peak else 1
    return {
        "minutes": distance / (traffic_speed * 1.25) * 60 + 5,
        "fare_inr": (60 + 15 * distance) * surge * cabs,
        "vehicles": cabs,
    }


def _auto_estimate(distance: float, traffic_speed: float, passengers: int) -> dict:
    autos = math.ceil(passengers / 3)
    return {
        "minutes": distance / (traffic_speed * 1.1) * 60 + 4,
        "fare_inr": (30 + 17 * max(0, distance - 1.5)) * autos,
        "vehicles": autos,
    }


def _metro_estimate(distance: float, passengers: int) -> dict:
    return {
        "minutes": distance * 0.95 / 32 * 60 + 6 + 12,
        "fare_inr": min(35, max(10, js_round(distance * 1.8))) * passengers,
    }


def _nearest_metro(store: Store, place: Place) -> Place | None:
    best = None
    best_distance = None
    for candidate in store.places:
        if not candidate.metro:
            continue
        distance = haversine_km(place, candidate)
        if best is None or distance < best_distance:
            best = candidate
            best_distance = distance
    return best


def _leg(mode: str, origin: Place, destination: Place, estimate: dict) -> dict:
    return {
        "mode": mode,
        "from": origin.name,
        "to": destination.name,
        "minutes": estimate["minutes"],
        "fare_inr": estimate["fare_inr"],
    }


def _unavailable_metro(note: str, sub: str) -> dict:
    return {
        "id": "metro",
        "name": "Metro",
        "available": False,
        "minutes": None,
        "fare_inr": None,
        "note": note,
        "sub": sub,
        "kind": "metro",
        "via": None,
        "access_mode": None,
        "legs": None,
    }


def _mixed_metro_option(
    store: Store,
    forest: SpeedForest,
    served: Place,
    unserved: Place,
    access_first: bool,
    minutes: int,
    passengers: int,
    window,
    traffic_speed: float,
    peak: bool,
) -> dict:
    gateway = _nearest_metro(store, unserved)
    if gateway is None or gateway.name == served.name:
        return _unavailable_metro(
            "The nearest station is already the metro end",
            "Bus, cab, and auto already cover this trip",
        )

    if access_first:
        bus_origin, bus_destination = unserved, gateway
    else:
        bus_origin, bus_destination = gateway, unserved
    feeder_distance = road_distance(unserved, gateway)
    choices = (
        ("bus", "Bus", _bus_estimate(store, forest, bus_origin, bus_destination, minutes, passengers, window)),
        ("cab", "Cab", _cab_estimate(feeder_distance, traffic_speed, peak, passengers)),
        ("auto", "Auto", _auto_estimate(feeder_distance, traffic_speed, passengers)),
    )
    access_mode, access_label, feeder = min(choices, key=lambda item: item[2]["minutes"])
    metro = _metro_estimate(road_distance(gateway, served), passengers)
    if access_first:
        access_leg = _leg(access_mode, unserved, gateway, feeder)
        metro_leg = _leg("metro", gateway, served, metro)
        legs = [access_leg, metro_leg]
        note = f"{access_label} to {gateway.name}, then metro to {served.name}"
    else:
        metro_leg = _leg("metro", served, gateway, metro)
        access_leg = _leg(access_mode, gateway, unserved, feeder)
        legs = [metro_leg, access_leg]
        note = f"Metro to {gateway.name}, then {access_label.lower()} to {unserved.name}"
    return {
        "id": "metro",
        "name": f"{access_label} + Metro",
        "available": True,
        "minutes": feeder["minutes"] + metro["minutes"],
        "fare_inr": feeder["fare_inr"] + metro["fare_inr"],
        "note": note,
        "sub": f"Feeder ~{js_round(feeder['minutes'])} min · metro ~{js_round(metro['minutes'])} min",
        "kind": "metro",
        "via": gateway.name,
        "access_mode": access_mode,
        "legs": legs,
    }


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
    distance = road_distance(origin, destination)
    short = distance <= SHORT_KM
    peak = window is not None and window.key in {"M", "E"}
    bus = _bus_estimate(
        store, forest, origin, destination, minutes, passengers, window, model_speed
    )
    direct = bus["direct"]
    bus_speed = bus["speed"]
    route = bus["route"]
    traffic_speed = store.series_speed(window)

    if direct:
        lines = ", ".join(route["lines"])
        bus_note = f"Historical route sample: {lines} · ~{js_round(bus_speed)} km/h"
        bus_sub = f"Includes ~{js_round(bus['headway'])} min wait and ~10 min walking"
    else:
        bus_note = "No direct route in the samples; a transfer is assumed"
        bus_sub = f"Includes ~{js_round(bus['headway'])} min wait and ~10 min walking plus a transfer"

    options = [
        {
            "id": "bus",
            "name": "Bus",
            "available": True,
            "minutes": bus["minutes"],
            "fare_inr": bus["fare_inr"],
            "note": bus_note,
            "sub": bus_sub,
            "kind": "bus",
        }
    ]
    if origin.metro and destination.metro:
        metro = _metro_estimate(distance, passengers)
        options.append(
            {
                "id": "metro",
                "name": "Metro",
                "available": True,
                "minutes": metro["minutes"],
                "fare_inr": metro["fare_inr"],
                "note": "Both places are near a metro station · ~32 km/h average",
                "sub": "Includes ~6 min wait and ~12 min to reach and enter stations",
                "kind": "metro",
                "via": None,
                "access_mode": None,
                "legs": None,
            }
        )
    elif origin.metro or destination.metro:
        if origin.metro:
            options.append(
                _mixed_metro_option(
                    store,
                    forest,
                    origin,
                    destination,
                    False,
                    minutes,
                    passengers,
                    window,
                    traffic_speed,
                    peak,
                )
            )
        else:
            options.append(
                _mixed_metro_option(
                    store,
                    forest,
                    destination,
                    origin,
                    True,
                    minutes,
                    passengers,
                    window,
                    traffic_speed,
                    peak,
                )
            )
    else:
        options.append(
            _unavailable_metro(
                "Not available for this pair",
                "Both places need a metro station nearby",
            )
        )

    cab = _cab_estimate(distance, traffic_speed, peak, passengers)
    auto = _auto_estimate(distance, traffic_speed, passengers)
    people = _plural(passengers, "passenger")
    options.append(
        {
            "id": "cab",
            "name": "Cab",
            "available": True,
            "minutes": cab["minutes"],
            "fare_inr": cab["fare_inr"],
            "note": f"{_plural(cab['vehicles'], 'cab')} for {people} · door to door",
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
            "minutes": auto["minutes"],
            "fare_inr": auto["fare_inr"],
            "note": f"{_plural(auto['vehicles'], 'auto')} for {people} · door to door",
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
