import { useCallback, useEffect, useRef, useState } from 'react';
import {
  getContext,
  getEvaluation,
  getMap,
  getPlaces,
  getWeather,
  isApiDown,
  postPlan,
} from '../api.js';
import { fastestId, nowHHMM, validTime } from '../format.js';

const KNOWN = new Set(['#plan', '#sampleCoverage', '#weather', '#reports']);

function pageFromHash(hash) {
  if (hash === '#weather') return 'weather';
  if (hash === '#reports' || hash === '#sampleCoverage') return 'reports';
  return 'plan';
}

export function usePlanner() {
  const [hash, setHash] = useState(() => window.location.hash);
  const [menuOpen, setMenuOpen] = useState(false);
  const [toast, setToast] = useState('');
  const [attempt, setAttempt] = useState(0);
  const [boot, setBoot] = useState('loading');
  const [places, setPlaces] = useState([]);
  const [weather, setWeather] = useState(null);
  const [geometry, setGeometry] = useState(null);
  const [evaluation, setEvaluation] = useState(null);
  const [context, setContext] = useState(null);
  const [contextError, setContextError] = useState(null);
  const [plan, setPlan] = useState(null);
  const [planError, setPlanError] = useState(null);
  const [planLoading, setPlanLoading] = useState(false);
  const [from, setFrom] = useState('Wagholi');
  const [to, setTo] = useState('Swargate');
  const [time, setTime] = useState(nowHHMM);
  const [live, setLive] = useState(true);
  const [passengers, setPassengers] = useState(1);
  const [selectedId, setSelectedId] = useState(null);
  const [highlight, setHighlight] = useState(true);
  const toastTimer = useRef(0);
  const searchRef = useRef(null);
  const lastSearch = useRef({ query: '', at: 0 });
  const placesRef = useRef(places);
  placesRef.current = places;

  const activeHash = KNOWN.has(hash) ? hash : '#plan';
  const page = pageFromHash(activeHash);
  const showToast = useCallback((message) => {
    setToast(message);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(''), 2600);
  }, []);

  useEffect(() => () => window.clearTimeout(toastTimer.current), []);

  useEffect(() => {
    const sync = () => setHash(window.location.hash);
    window.addEventListener('hashchange', sync);
    return () => window.removeEventListener('hashchange', sync);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    const id = (KNOWN.has(hash) ? hash : '#plan').slice(1);
    const target = document.getElementById(id);
    if (!target) return undefined;
    const frame = requestAnimationFrame(() => {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    return () => cancelAnimationFrame(frame);
  }, [hash]);

  useEffect(() => {
    if (!live) return undefined;
    const tick = () => {
      const next = nowHHMM();
      setTime((current) => (current === next ? current : next));
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [live]);

  useEffect(() => {
    const controller = new AbortController();
    let cancelled = false;
    setBoot((current) => (current === 'ready' ? current : 'loading'));
    Promise.all([
      getPlaces(controller.signal),
      getWeather(controller.signal),
      getMap(controller.signal),
      getEvaluation(controller.signal),
    ])
      .then(([nextPlaces, nextWeather, nextGeometry, nextEvaluation]) => {
        if (cancelled) return;
        setPlaces(Array.isArray(nextPlaces) ? nextPlaces : []);
        setWeather(nextWeather);
        setGeometry(nextGeometry);
        setEvaluation(nextEvaluation);
        setBoot('ready');
      })
      .catch((error) => {
        if (cancelled || error?.name === 'AbortError') return;
        setBoot('down');
      });
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [attempt]);

  useEffect(() => {
    if (!validTime(time) || boot !== 'ready') return undefined;
    const controller = new AbortController();
    let cancelled = false;
    setContextError(null);
    getContext(time, controller.signal)
      .then((next) => {
        if (cancelled) return;
        setContext(next);
        setContextError(null);
      })
      .catch((error) => {
        if (cancelled || error?.name === 'AbortError') return;
        setContext(null);
        setContextError(error);
      });
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [time, boot, attempt]);

  useEffect(() => {
    if (!validTime(time) || !from || !to || boot !== 'ready') {
      setPlanLoading(false);
      return undefined;
    }
    const controller = new AbortController();
    let cancelled = false;
    setPlanError(null);
    setPlanLoading(true);
    postPlan({ from, to, time, passengers }, controller.signal)
      .then((next) => {
        if (cancelled) return;
        setPlan(next);
        setPlanError(null);
        setSelectedId(fastestId(next.options));
      })
      .catch((error) => {
        if (cancelled || error?.name === 'AbortError') return;
        setPlan(null);
        setSelectedId(null);
        setPlanError(error);
      })
      .finally(() => {
        if (!cancelled) setPlanLoading(false);
      });
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [from, to, time, passengers, boot, attempt]);

  const contextReady = context && context.time === time ? context : null;
  const planReady = plan
    && plan.origin === from
    && plan.destination === to
    && plan.time === time
    && plan.passengers === passengers
    ? plan
    : null;
  const selected = planReady?.options?.find((option) => option.id === selectedId) || null;
  const showRoute = Boolean(selected?.available && planReady && planReady.origin !== planReady.destination);
  const apiDown = boot === 'down' || isApiDown(contextError) || isApiDown(planError);
  const visiblePlanError = planError && !planReady ? planError : null;

  const chooseDestination = useCallback((name, announce) => {
    const list = placesRef.current;
    const query = String(name || '').trim().toLowerCase();
    if (!query) return;
    const now = Date.now();
    if (lastSearch.current.query === query && now - lastSearch.current.at < 500) return;
    lastSearch.current = { query, at: now };
    if (!list.length) {
      showToast('The planner API is not running.');
      return;
    }
    const place = list.find((item) => item.name.toLowerCase() === query)
      || list.find((item) => item.name.toLowerCase().startsWith(query));
    if (!place) {
      showToast('No matching place found. Choose a Pune area from the suggestions.');
      return;
    }
    setMenuOpen(false);
    setTo(place.name);
    if (window.location.hash !== '#plan') window.location.hash = '#plan';
    else document.getElementById('plan')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    if (announce) showToast(`Destination set to ${place.name}.`);
  }, [showToast]);

  useEffect(() => {
    const input = searchRef.current;
    if (!input) return undefined;
    const onChange = () => chooseDestination(input.value, true);
    input.addEventListener('change', onChange);
    return () => input.removeEventListener('change', onChange);
  }, [chooseDestination]);

  function toggleTheme() {
    const root = document.documentElement;
    const dark = root.dataset.theme
      ? root.dataset.theme === 'dark'
      : window.matchMedia('(prefers-color-scheme: dark)').matches;
    const next = dark ? 'light' : 'dark';
    root.dataset.theme = next;
    showToast(`Switched to ${next} theme.`);
  }

  function retry() {
    setPlanError(null);
    setContextError(null);
    setAttempt((value) => value + 1);
  }

  return {
    page,
    activeHash,
    menuOpen,
    setMenuOpen,
    toast,
    searchRef,
    places,
    weather,
    geometry,
    evaluation,
    context: contextReady,
    from,
    setFrom,
    to,
    setTo,
    time,
    passengers,
    onTime: (value) => {
      setLive(false);
      const match = /^(\d{2}:\d{2})/.exec(value);
      setTime(match ? match[1] : value);
    },
    onPassengers: (delta) => setPassengers((count) => Math.min(24, Math.max(1, count + delta))),
    onSwap: () => {
      setFrom(to);
      setTo(from);
    },
    onUseNow: () => {
      setLive(true);
      setTime(nowHHMM());
    },
    plan: planReady,
    planError: visiblePlanError,
    loading: planLoading || boot === 'loading',
    selected,
    setSelectedId,
    showRoute,
    highlight,
    toggleHighlight: () => setHighlight((value) => !value),
    apiDown,
    retry,
    chooseDestination,
    toggleTheme,
    badge: contextReady ? String(contextReady.sparse_count) : '—',
  };
}
