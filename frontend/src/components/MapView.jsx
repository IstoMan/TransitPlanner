import { useEffect, useMemo, useRef } from 'react';
import { project, projectChain } from '../format.js';

function roadPoints(names, byName) {
  const parts = [];
  for (const name of names || []) {
    const place = byName.get(name);
    if (!place) continue;
    const point = project(place.lat, place.lon);
    parts.push(`${point.x},${point.y}`);
  }
  return parts.length >= 2 ? parts.join(' ') : '';
}

export default function MapView({
  geometry,
  originName,
  destinationName,
  routeColor,
  showRoute,
  sparseNames,
  onPlace,
}) {
  const routeRef = useRef(null);
  const vehicleRef = useRef(null);
  const places = geometry?.places || [];
  const byName = useMemo(() => new Map(places.map((place) => [place.name, place])), [places]);
  const origin = byName.get(originName);
  const destination = byName.get(destinationName);
  const originPoint = origin ? project(origin.lat, origin.lon) : null;
  const destinationPoint = destination ? project(destination.lat, destination.lon) : null;
  const different = Boolean(origin && destination && origin.name !== destination.name);
  const routeD = different ? `M${originPoint.x} ${originPoint.y}L${destinationPoint.x} ${destinationPoint.y}` : '';
  const drawRoute = Boolean(showRoute && routeD);
  const sparse = new Set(sparseNames || []);
  const purple = geometry?.metro?.purple || [];
  const aqua = geometry?.metro?.aqua || [];
  const rivers = geometry?.rivers || [];
  const roads = geometry?.roads || [];

  useEffect(() => {
    const path = routeRef.current;
    const vehicle = vehicleRef.current;
    if (!path || !vehicle || !drawRoute) {
      if (vehicle) vehicle.style.display = 'none';
      return undefined;
    }
    vehicle.style.display = '';
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const placeAt = (distance) => {
      const length = path.getTotalLength();
      if (!length) return;
      const point = path.getPointAtLength(Math.min(distance, length));
      vehicle.setAttribute('cx', String(point.x));
      vehicle.setAttribute('cy', String(point.y));
    };
    if (reduced) {
      placeAt(path.getTotalLength() / 2);
      return undefined;
    }
    let progress = 0;
    let last = performance.now();
    let frame = 0;
    const loop = (now) => {
      const dt = (now - last) / 1000;
      last = now;
      const length = path.getTotalLength();
      if (length > 0) {
        progress = (progress + dt * 0.18) % 1;
        placeAt(progress * length);
      }
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
  }, [drawRoute, routeD]);

  if (!geometry) {
    return <p className="page-intro" style={{ padding: '0 20px 16px' }}>The schematic map loads from the planner API.</p>;
  }

  return (
    <svg viewBox="0 0 800 600" role="img" aria-label="Schematic Pune map with places, metro lines and the selected trip">
      <rect width="800" height="600" fill="var(--mbg)" />
      <g fill="none" strokeLinecap="round" strokeLinejoin="round">
        {rivers.map((river, index) => (
          <polyline key={`river-edge-${index}`} points={projectChain(river)} stroke="var(--road)" strokeWidth="17" />
        ))}
        {rivers.map((river, index) => (
          <polyline key={`river-fill-${index}`} points={projectChain(river)} stroke="var(--river)" strokeWidth="12" />
        ))}
      </g>
      <g fill="none" strokeLinecap="round" strokeLinejoin="round">
        {roads.map((road, index) => (
          <polyline key={`road-edge-${index}`} points={roadPoints(road, byName)} stroke="var(--redge)" strokeWidth="13" />
        ))}
        {roads.map((road, index) => (
          <polyline key={`road-fill-${index}`} points={roadPoints(road, byName)} stroke="var(--road)" strokeWidth="9" />
        ))}
      </g>
      <polyline points={projectChain(purple)} fill="none" stroke="var(--metro)" strokeWidth="4.5" strokeLinejoin="round" />
      <polyline points={projectChain(aqua)} fill="none" stroke="var(--aqua)" strokeWidth="4.5" strokeLinejoin="round" />
      <g>
        {[...purple, ...aqua].map((pair, index) => {
          const point = project(pair[0], pair[1]);
          return (
            <circle key={`station-${index}`} cx={point.x} cy={point.y} r="3" fill="var(--panel)" stroke="var(--ink)" strokeWidth="1.5" />
          );
        })}
      </g>
      <g>
        {places.filter((place) => sparse.has(place.name)).map((place) => {
          const point = project(place.lat, place.lon);
          return (
            <circle
              key={`sparse-${place.name}`}
              cx={point.x}
              cy={point.y}
              r="26"
              fill="#f5b83e"
              fillOpacity="0.22"
              stroke="#e8a317"
              strokeWidth="2"
              strokeDasharray="5 4"
            />
          );
        })}
      </g>
      <path
        ref={routeRef}
        d={routeD || undefined}
        fill="none"
        stroke={routeColor || 'var(--bus)'}
        strokeWidth="6"
        strokeLinecap="round"
        className="flow"
        opacity={drawRoute ? 0.9 : 0}
      />
      <g>
        {different && originPoint && destinationPoint && (
          <>
            <circle cx={originPoint.x} cy={originPoint.y} r="9" fill="#16a34a" stroke="#fff" strokeWidth="3" />
            <circle cx={destinationPoint.x} cy={destinationPoint.y} r="9" fill="#f08a00" stroke="#fff" strokeWidth="3" />
          </>
        )}
      </g>
      <g>
        {places.map((place) => {
          const point = project(place.lat, place.lon);
          return (
            <g
              key={place.name}
              style={{ cursor: 'pointer' }}
              onClick={() => onPlace(place.name)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  onPlace(place.name);
                }
              }}
              role="button"
              tabIndex={0}
              aria-label={`Set destination to ${place.name}`}
            >
              <circle
                cx={point.x}
                cy={point.y}
                r={place.metro ? 7 : 5}
                fill={place.metro ? 'var(--panel)' : 'var(--mute)'}
                stroke={place.metro ? 'var(--metro)' : 'var(--panel)'}
                strokeWidth="3"
              />
              <text className="lbl" x={Number(point.x) + 10} y={Number(point.y) + 4}>{place.name}</text>
            </g>
          );
        })}
      </g>
      <circle ref={vehicleRef} r="7" fill="var(--panel)" stroke="var(--ink)" strokeWidth="2.5" style={{ display: 'none' }} />
    </svg>
  );
}
