import MapView from './MapView.jsx';

export default function MapCard({
  id,
  geometry,
  originName,
  destinationName,
  routeColor,
  showRoute,
  sparseNames,
  onPlace,
  highlight,
  onToggleHighlight,
}) {
  return (
    <section className="card c12 map-card" id={id}>
      <div className="mh">
        <h3>Pune map · schematic</h3>
        {onToggleHighlight && (
          <button className={`chip${highlight ? ' on' : ''}`} type="button" aria-pressed={highlight} onClick={onToggleHighlight}>
            Highlight sparse samples
          </button>
        )}
      </div>
      <MapView
        geometry={geometry}
        originName={originName}
        destinationName={destinationName}
        routeColor={routeColor}
        showRoute={showRoute}
        sparseNames={sparseNames}
        onPlace={onPlace}
      />
      <div className="leg">
        <span><i style={{ background: 'var(--metro)' }} />Purple Line · schematic</span>
        <span><i style={{ background: 'var(--aqua)' }} />Aqua Line · schematic</span>
        {onToggleHighlight && (
          <span><span style={{ color: '#e8a317' }}>◎</span> Sparse historical sample, not a service finding</span>
        )}
      </div>
    </section>
  );
}
