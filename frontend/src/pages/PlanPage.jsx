import ApiDownBanner from '../components/ApiDownBanner.jsx';
import MapCard from '../components/MapCard.jsx';
import TravelOptions from '../components/TravelOptions.jsx';
import TripForm from '../components/TripForm.jsx';
import WeatherCard from '../components/WeatherCard.jsx';
import { count, optionColor, speed } from '../format.js';

export default function PlanPage({
  active,
  apiDown,
  onRetry,
  places,
  from,
  to,
  time,
  passengers,
  onFrom,
  onTo,
  onTime,
  onPassengers,
  onSwap,
  onUseNow,
  context,
  weather,
  plan,
  planError,
  loading,
  selected,
  onSelect,
  geometry,
  showRoute,
  onPlace,
}) {
  return (
    <section className={`page grid${active ? ' active' : ''}`} id="plan" aria-labelledby="planTitle">
      {apiDown && <ApiDownBanner onRetry={onRetry} />}
      <div className="card kpi c3">
        <small>Historical bus trips analysed</small>
        <span className="v">{count(context?.historical_trips)}</span>
        <span className="d">Bundled sample observations</span>
      </div>
      <div className="card kpi c3">
        <small>Areas with sparse samples</small>
        <span className="v">{count(context?.sparse_count)}</span>
        <span className="d">of {count(context?.area_count)} areas</span>
      </div>
      <div className="card kpi c3">
        <small>Median bus speed</small>
        <span className="v"><span>{speed(context?.median_speed_kmh)}</span> <small>km/h</small></span>
        <span className="d">{context ? context.median_speed_label : '—'}</span>
      </div>
      <WeatherCard weather={weather} />

      <section className="card c12" id="tripPlanner">
        <h2 id="planTitle">Plan a Pune trip</h2>
        <p className="page-intro">Compare indicative bus, metro, cab and auto options using historical samples and typical fares.</p>
        <h3>Compare travel options</h3>
        <small className="note">Times and fares are estimates built from bundled historical bus samples and typical Pune fares. They are not timetables, live arrivals or provider quotes.</small>
        <div className="pg">
          <TripForm
            places={places}
            from={from}
            to={to}
            time={time}
            passengers={passengers}
            onFrom={onFrom}
            onTo={onTo}
            onTime={onTime}
            onPassengers={onPassengers}
            onSwap={onSwap}
            onUseNow={onUseNow}
            plan={plan}
            planError={planError}
            apiDown={apiDown}
            loading={loading}
            selected={selected}
          />
          <TravelOptions plan={plan} selected={selected} onSelect={onSelect} />
        </div>
      </section>

      <MapCard
        geometry={geometry}
        originName={from}
        destinationName={to}
        routeColor={optionColor(selected)}
        mode={selected?.id}
        showRoute={showRoute}
        onPlace={onPlace}
      />
    </section>
  );
}
