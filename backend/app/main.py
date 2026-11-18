from contextlib import asynccontextmanager
import re

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.ml.forest import SpeedForest
from app.planner import SamePlaceError, UnknownPlaceError, plan_trip, sample_context
from app.store import load_store

TIME_PATTERN = re.compile(r"^([01]\d|2[0-3]):([0-5]\d)$")


def parse_time(value: str) -> int:
    match = TIME_PATTERN.fullmatch(value)
    if match is None:
        raise ValueError("Time must be HH:MM")
    return int(match.group(1)) * 60 + int(match.group(2))


class PlanRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    origin: str = Field(alias="from", min_length=1)
    destination: str = Field(alias="to", min_length=1)
    time: str
    passengers: int = Field(ge=1, le=24)

    @field_validator("time")
    @classmethod
    def check_time(cls, value: str) -> str:
        parse_time(value)
        return value


@asynccontextmanager
async def lifespan(app: FastAPI):
    store = load_store()
    forest = SpeedForest(store).train()
    app.state.store = store
    app.state.forest = forest
    app.state.evaluation = forest.evaluate()
    yield


app = FastAPI(title="Pune Transit Planner", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:5173", "http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/places")
def places():
    return [
        {"name": place.name, "lat": place.lat, "lon": place.lon, "metro": place.metro}
        for place in app.state.store.places
    ]


@app.get("/api/context")
def context(time: str = Query(min_length=5, max_length=5)):
    try:
        minutes = parse_time(time)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    return sample_context(app.state.store, minutes)


@app.post("/api/plan")
def plan(body: PlanRequest):
    try:
        return plan_trip(
            app.state.store,
            app.state.forest,
            body.origin,
            body.destination,
            parse_time(body.time),
            body.passengers,
        )
    except SamePlaceError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except UnknownPlaceError as exc:
        raise HTTPException(status_code=404, detail="Unknown place") from exc


@app.get("/api/evaluation")
def evaluation():
    payload = dict(app.state.evaluation)
    payload["description"] = (
        "Leave-one-time-window-out cross-validation on the bundled samples. "
        "These metrics are not a measure of real-world transit accuracy."
    )
    return payload


@app.get("/api/weather")
def weather():
    return app.state.store.weather


@app.get("/api/map")
def map_geometry():
    store = app.state.store
    return {
        "places": [
            {"name": place.name, "lat": place.lat, "lon": place.lon, "metro": place.metro}
            for place in store.places
        ],
        "rivers": store.geometry["rivers"],
        "roads": store.geometry["roads"],
        "metro": store.geometry["metro"],
    }
