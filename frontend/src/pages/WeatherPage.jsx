import ApiDownBanner from '../components/ApiDownBanner.jsx';
import WeatherCard from '../components/WeatherCard.jsx';

export default function WeatherPage({ active, apiDown, onRetry, weather }) {
  return (
    <section className={`page grid${active ? ' active' : ''}`} id="weather" aria-labelledby="weatherTitle">
      {apiDown && <ApiDownBanner onRetry={onRetry} />}
      <header className="page-heading">
        <h2 id="weatherTitle">Pune weather</h2>
        <p className="page-intro">A sample weather snapshot for trip planning. Conditions are illustrative, not live.</p>
      </header>
      <WeatherCard weather={weather} variant="page" />
      <section className="card c12">
        <h3>Weather and transit</h3>
        <p className="page-intro">Weather information on this page is a static snapshot. Check the official India Meteorological Department warnings before travelling; this planner does not use live weather data.</p>
      </section>
    </section>
  );
}
