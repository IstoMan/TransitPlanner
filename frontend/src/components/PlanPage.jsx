import WeatherCard from './WeatherCard.jsx';
import MapCard from './MapCard.jsx';
import ApiDownBanner from './ApiDownBanner.jsx';
import { count, minutes, money, optionColor, optionIcon, speed } from '../format.js';

const METRO_FARE = 'https://punemetrorail.org/fare_chart.aspx';
const METRO_APP = 'https://www.punemetrorail.org/download/Maha-Metros-Pune-Metro-Mobile-App-For-Seamless-Travel-And-Contactless-Ticketing.pdf';

function placeLabel(place) {
  return `${place.name}${place.metro ? ' (metro nearby)' : ''}`;
}

function optionOpen(option) {
  return Boolean(option?.available) && option.minutes != null;
}

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
  const choices = places.length
    ? places
    : [
        { name: 'Wagholi', metro: false },
        { name: 'Swargate', metro: false },
      ];
  const samePlace = planError?.status === 400;
  const knownError = planError && !apiDown && planError.status && planError.status < 500;

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
          <div>
            <label htmlFor="from">From</label>
            <select id="from" value={from} disabled={!places.length} onChange={(event) => onFrom(event.target.value)}>
              {choices.map((place) => (
                <option key={place.name} value={place.name}>{placeLabel(place)}</option>
              ))}
            </select>
            <div className="two">
              <div>
                <label htmlFor="to">To</label>
                <select id="to" value={to} disabled={!places.length} onChange={(event) => onTo(event.target.value)}>
                  {choices.map((place) => (
                    <option key={place.name} value={place.name}>{placeLabel(place)}</option>
                  ))}
                </select>
              </div>
              <button className="swap" type="button" aria-label="Swap origin and destination" onClick={onSwap}>⇅</button>
            </div>
            <div className="row2">
              <div>
                <label htmlFor="time">Travel time</label>
                <input id="time" type="time" value={time} onChange={(event) => onTime(event.target.value)} />
              </div>
              <div>
                <label>Passengers</label>
                <div className="step">
                  <button type="button" aria-label="Fewer" onClick={() => onPassengers(-1)}>−</button>
                  <b id="pax">{passengers}</b>
                  <button type="button" aria-label="More" onClick={() => onPassengers(1)}>+</button>
                </div>
              </div>
            </div>
            <button className="link" type="button" onClick={onUseNow}>Use current time</button>

            {samePlace && (
              <div className="banner">
                <h4>{planError.message}</h4>
                <p>Select a different destination to compare travel options.</p>
              </div>
            )}
            {knownError && !samePlace && (
              <div className="banner">
                <h4>{planError.message}</h4>
                <p>Trip times and fares stay blank until the planner API accepts this trip.</p>
              </div>
            )}
            {plan?.banner && (
              <div className="banner">
                <h4>{plan.banner.title}</h4>
                <p>{plan.banner.detail}</p>
                <p>{plan.banner.speed}</p>
              </div>
            )}
            {loading && !plan && !planError && !apiDown && <p className="page-intro">Loading trip options…</p>}

            {plan && selected && (
              <div className="fare">
                {optionOpen(selected) ? (
                  <>
                    <small>Selected · {selected.name} · estimated total for {plan.passengers} passenger{plan.passengers > 1 ? 's' : ''}</small>
                    <div className="big">{money(selected.fare_inr)} · {minutes(selected.minutes)} min</div>
                    <small>Indicative estimate. Actual fares and times will differ.</small>
                    {selected.id === 'metro' && (
                      <>
                        <a className="cta" href={METRO_FARE} target="_blank" rel="noopener noreferrer">Check official fare</a>
                        <a className="cta sec" href={METRO_APP} target="_blank" rel="noopener noreferrer">Maha Metro app information</a>
                      </>
                    )}
                    {selected.kind === 'ride' && (
                      <small>Booking is not connected. Use your preferred cab or auto app to get a live quote.</small>
                    )}
                  </>
                ) : (
                  <>
                    <small>Selected · {selected.name}</small>
                    <div className="big">Unavailable</div>
                    <small>{selected.note}</small>
                  </>
                )}
              </div>
            )}
          </div>
          <div className="opts">
            {(plan?.options || []).map((option) => (
              <button
                key={option.id}
                className={`opt${selected?.id === option.id ? ' sel' : ''}`}
                style={{ '--c': optionColor(option) }}
                type="button"
                aria-pressed={selected?.id === option.id}
                onClick={() => onSelect(option.id)}
              >
                <span className="ic">{optionIcon(option)}</span>
                <span>
                  <strong>
                    {option.name}
                    {option.fastest ? <span className="tag">Fastest</span> : null}
                  </strong>
                  <small>{option.note}</small>
                  <small>{option.sub}</small>
                </span>
                <span className="mins">
                  {optionOpen(option) ? minutes(option.minutes) : '—'}
                  <span>{optionOpen(option) ? `min · ${money(option.fare_inr)}` : 'n/a'}</span>
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      <MapCard
        geometry={geometry}
        originName={from}
        destinationName={to}
        routeColor={optionColor(selected)}
        showRoute={showRoute}
        onPlace={onPlace}
      />
    </section>
  );
}
