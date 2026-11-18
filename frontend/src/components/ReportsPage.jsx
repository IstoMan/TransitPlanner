import ApiDownBanner from './ApiDownBanner.jsx';
import MapCard from './MapCard.jsx';
import TimeChart from './TimeChart.jsx';
import { optionColor, speed } from '../format.js';

function metric(value, unit) {
  if (value == null || Number.isNaN(Number(value))) return '—';
  const text = unit ? `${Number(value).toFixed(1)} ${unit}` : String(value);
  return text;
}

export default function ReportsPage({
  active,
  apiDown,
  onRetry,
  context,
  plan,
  evaluation,
  geometry,
  from,
  to,
  selected,
  showRoute,
  highlight,
  onToggleHighlight,
  onPlace,
}) {
  const bars = context?.bars || [];
  const maxObs = Math.max(...bars.map((bar) => Number(bar.observations) || 0), 1);
  const sparseNames = highlight ? bars.filter((bar) => bar.sparse).map((bar) => bar.name) : [];

  return (
    <section className={`page grid${active ? ' active' : ''}`} id="reports" aria-labelledby="reportsTitle">
      {apiDown && <ApiDownBanner onRetry={onRetry} />}
      <header className="page-heading">
        <h2 id="reportsTitle">Transit reports</h2>
        <p className="page-intro">Explore the bundled historical sample coverage and the random forest bus-speed estimate.</p>
      </header>
      <section className="card c4">
        <h3>Bus observations by area</h3>
        <small style={{ color: 'var(--mute)' }}>{context?.window_note || 'Sample counts load from the planner API.'}</small>
        <div>
          {bars.map((bar) => (
            <div className="bar" key={bar.name}>
              <span>{bar.name}</span>
              <i className={bar.sparse ? 'd' : undefined} style={{ width: `${Math.max(3, (Number(bar.observations) / maxObs) * 100)}%` }} />
              <b>{bar.observations == null ? '—' : Math.round(Number(bar.observations))}</b>
            </div>
          ))}
        </div>
      </section>
      <section className="card c8 model-report">
        <h3>Random forest speed estimate</h3>
        <p className="page-intro">Model estimate for the selected trip and travel time from a scikit-learn RandomForestRegressor trained on the bundled area-by-window bus-speed samples.</p>
        <div className="model-speed"><span>{speed(plan?.model_speed_kmh)}</span> km/h</div>
        <small>
          {plan
            ? `${plan.origin} to ${plan.destination} · ${plan.time} · scikit-learn RandomForestRegressor`
            : 'Select a trip to see its estimate.'}
        </small>
        <small>
          {evaluation?.trees != null ? `${evaluation.trees} trees · ` : ''}
          scikit-learn RandomForestRegressor · input features: time of day and location · no live data
        </small>
      </section>
      <section className="card c12 evaluation-report" aria-labelledby="evaluationTitle">
        <h3 id="evaluationTitle">Held-out sample evaluation</h3>
        <p className="page-intro">Leave-one-time-window-out cross-validation: each window is tested against a forest trained on the other two. The baseline predicts the training-window mean speed.</p>
        <div className="evaluation-metrics">
          <div className="evaluation-metric"><small>Test samples</small><strong>{metric(evaluation?.samples)}</strong></div>
          <div className="evaluation-metric"><small>Held-out windows</small><strong>{metric(evaluation?.folds)}</strong></div>
          <div className="evaluation-metric"><small>Forest MAE</small><strong>{metric(evaluation?.forest?.mae, 'km/h')}</strong></div>
          <div className="evaluation-metric"><small>Forest RMSE</small><strong>{metric(evaluation?.forest?.rmse, 'km/h')}</strong></div>
          <div className="evaluation-metric"><small>Baseline MAE</small><strong>{metric(evaluation?.baseline?.mae, 'km/h')}</strong></div>
          <div className="evaluation-metric"><small>Baseline RMSE</small><strong>{metric(evaluation?.baseline?.rmse, 'km/h')}</strong></div>
        </div>
        <small>{evaluation?.description || 'These metrics describe the bundled sample data only; they are not a measure of real-world transit accuracy.'}</small>
      </section>
      <MapCard
        id="sampleCoverage"
        geometry={geometry}
        originName={from}
        destinationName={to}
        routeColor={optionColor(selected)}
        showRoute={showRoute}
        sparseNames={sparseNames}
        onPlace={onPlace}
        highlight={highlight}
        onToggleHighlight={onToggleHighlight}
      />
      <section className="card c12" id="chartcard">
        <TimeChart series={context?.series} />
      </section>
    </section>
  );
}
