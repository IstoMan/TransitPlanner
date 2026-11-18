import { rainLevel, rainMood } from '../format.js';

export default function WeatherCard({ weather, variant }) {
  const wide = variant === 'page';
  if (!weather) {
    return (
      <section className={`card kpi wx ${wide ? 'c12' : 'c3'}`}>
        <small>Weather · Pune</small>
        <span className="v">—</span>
        <p>Weather loads from the planner API. It is not live.</p>
      </section>
    );
  }
  const level = rainLevel(weather.rain_chance);
  return (
    <section className={`card kpi wx ${level} ${wide ? 'c12' : 'c3'}`}>
      <small>Weather · {weather.place} · {rainMood(weather.rain_chance)}</small>
      <span className="v">{weather.temp_c}°C <small>{weather.condition}</small></span>
      <p>High {weather.high_c}° · Low {weather.low_c}° · Rain chance {weather.rain_chance}%</p>
      <div className="days">
        {(weather.days || []).map((day) => (
          <div key={day.name} className={Number(day.rain_chance) >= 30 ? 'wet' : undefined}>
            <b>{day.name}</b>{day.high_c}°/{day.low_c}°<br />{day.rain_chance}% rain
          </div>
        ))}
      </div>
      <p>{weather.snapshot}</p>
      {wide ? (
        <a href={weather.imd_url} target="_blank" rel="noopener noreferrer">Official IMD warnings</a>
      ) : (
        <a href="#weather">View full weather page</a>
      )}
    </section>
  );
}
