import { project } from './format.js';

function pixelDistance(a, b) {
  return Math.hypot(Number(a.x) - Number(b.x), Number(a.y) - Number(b.y));
}

function coordKey(lat, lon) {
  return `${Number(lat)},${Number(lon)}`;
}

function addUndirected(graph, from, to, weight) {
  const link = (start, end) => {
    if (!graph.has(start)) graph.set(start, []);
    const edges = graph.get(start);
    const existing = edges.find((edge) => edge.to === end);
    if (existing) existing.weight = Math.min(existing.weight, weight);
    else edges.push({ to: end, weight });
  };
  if (from === to) return;
  link(from, to);
  link(to, from);
}

function shortestPath(graph, start, end) {
  if (!graph.has(start) || !graph.has(end)) return null;
  if (start === end) return [start];
  const distance = new Map([[start, 0]]);
  const previous = new Map();
  const pending = new Set(graph.keys());
  while (pending.size) {
    let current = null;
    let best = Infinity;
    for (const node of pending) {
      const candidate = distance.get(node);
      if (candidate != null && candidate < best) {
        best = candidate;
        current = node;
      }
    }
    if (current == null) return null;
    pending.delete(current);
    if (current === end) break;
    for (const edge of graph.get(current) || []) {
      const next = best + edge.weight;
      if (next < (distance.get(edge.to) ?? Infinity)) {
        distance.set(edge.to, next);
        previous.set(edge.to, current);
      }
    }
  }
  if (start !== end && !previous.has(end)) return null;
  const path = [end];
  let node = end;
  while (node !== start) {
    node = previous.get(node);
    if (node == null) return null;
    path.push(node);
  }
  path.reverse();
  return path;
}

function pathFromPoints(points) {
  if (!points || points.length < 2) return '';
  return points.map((point, index) => `${index === 0 ? 'M' : 'L'}${point.x} ${point.y}`).join('');
}

function straightPath(origin, destination) {
  const start = project(origin.lat, origin.lon);
  const end = project(destination.lat, destination.lon);
  return `M${start.x} ${start.y}L${end.x} ${end.y}`;
}

function roadPointsBetween(geometry, origin, destination) {
  const byName = new Map((geometry?.places || []).map((place) => [place.name, place]));
  const graph = new Map();
  for (const chain of geometry?.roads || []) {
    for (let index = 0; index < chain.length - 1; index += 1) {
      const from = byName.get(chain[index]);
      const to = byName.get(chain[index + 1]);
      if (!from || !to) continue;
      addUndirected(
        graph,
        from.name,
        to.name,
        pixelDistance(project(from.lat, from.lon), project(to.lat, to.lon)),
      );
    }
  }
  const names = shortestPath(graph, origin.name, destination.name);
  if (!names) return null;
  return names.map((name) => project(byName.get(name).lat, byName.get(name).lon));
}

function metroNetwork(geometry) {
  const points = new Map();
  const graph = new Map();
  const lines = [geometry?.metro?.purple || [], geometry?.metro?.aqua || []];
  for (const line of lines) {
    for (const pair of line) {
      const key = coordKey(pair[0], pair[1]);
      if (!points.has(key)) {
        points.set(key, { lat: Number(pair[0]), lon: Number(pair[1]), ...project(pair[0], pair[1]) });
      }
    }
    for (let index = 0; index < line.length - 1; index += 1) {
      const from = coordKey(line[index][0], line[index][1]);
      const to = coordKey(line[index + 1][0], line[index + 1][1]);
      addUndirected(graph, from, to, pixelDistance(points.get(from), points.get(to)));
    }
  }
  return { points, graph };
}

function nearestVertex(points, place) {
  const here = project(place.lat, place.lon);
  let bestKey = null;
  let bestDistance = Infinity;
  for (const [key, point] of points) {
    const distance = pixelDistance(here, point);
    if (distance < bestDistance) {
      bestDistance = distance;
      bestKey = key;
    }
  }
  return bestKey;
}

function metroPointsBetween(geometry, origin, destination) {
  const { points, graph } = metroNetwork(geometry);
  if (!points.size) return null;
  const startKey = nearestVertex(points, origin);
  const endKey = nearestVertex(points, destination);
  const keys = shortestPath(graph, startKey, endKey);
  if (!keys) return null;
  const drawn = keys.map((key) => points.get(key));
  if (coordKey(origin.lat, origin.lon) !== keys[0]) drawn.unshift(project(origin.lat, origin.lon));
  if (coordKey(destination.lat, destination.lon) !== keys[keys.length - 1]) drawn.push(project(destination.lat, destination.lon));
  return drawn;
}

function segmentPoints(geometry, origin, destination, network) {
  const along = network === 'metro'
    ? metroPointsBetween(geometry, origin, destination)
    : roadPointsBetween(geometry, origin, destination);
  if (along && along.length >= 2) return along;
  return [project(origin.lat, origin.lon), project(destination.lat, destination.lon)];
}

function joinPoints(first, second) {
  const combined = first.slice();
  const rest = second.slice();
  if (pixelDistance(combined[combined.length - 1], rest[0]) < 0.5) rest.shift();
  return combined.concat(rest);
}

export function routePath(geometry, origin, destination, mode, via) {
  if (!origin || !destination || origin.name === destination.name) return '';
  if (mode === 'metro' && via && via.name !== origin.name && via.name !== destination.name) {
    const accessFirst = !origin.metro;
    const feeder = segmentPoints(
      geometry,
      accessFirst ? origin : via,
      accessFirst ? via : destination,
      'road',
    );
    const rail = segmentPoints(
      geometry,
      accessFirst ? via : origin,
      accessFirst ? destination : via,
      'metro',
    );
    const points = accessFirst ? joinPoints(feeder, rail) : joinPoints(rail, feeder);
    return pathFromPoints(points) || straightPath(origin, destination);
  }
  const alongNetwork = mode === 'metro'
    ? metroPointsBetween(geometry, origin, destination)
    : roadPointsBetween(geometry, origin, destination);
  return (alongNetwork && pathFromPoints(alongNetwork)) || straightPath(origin, destination);
}
