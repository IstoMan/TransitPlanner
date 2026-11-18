import Sidebar from './components/Sidebar.jsx';
import TopBar from './components/TopBar.jsx';
import { usePlanner } from './hooks/usePlanner.js';
import PlanPage from './pages/PlanPage.jsx';
import ReportsPage from './pages/ReportsPage.jsx';
import WeatherPage from './pages/WeatherPage.jsx';

export default function App() {
  const planner = usePlanner();

  return (
    <div className="app">
      <Sidebar
        activeHash={planner.activeHash}
        badge={planner.badge}
        menuOpen={planner.menuOpen}
        onTheme={planner.toggleTheme}
      />
      <div className="main">
        <TopBar
          menuOpen={planner.menuOpen}
          onToggleMenu={() => planner.setMenuOpen((open) => !open)}
          searchRef={planner.searchRef}
          places={planner.places}
          onSearch={planner.chooseDestination}
        />
        <div id="toast" className={`toast${planner.toast ? ' show' : ''}`} role="status" aria-live="polite">{planner.toast}</div>
        <main>
          <PlanPage
            active={planner.page === 'plan'}
            apiDown={planner.apiDown}
            onRetry={planner.retry}
            places={planner.places}
            from={planner.from}
            to={planner.to}
            time={planner.time}
            passengers={planner.passengers}
            onFrom={planner.setFrom}
            onTo={planner.setTo}
            onTime={planner.onTime}
            onPassengers={planner.onPassengers}
            onSwap={planner.onSwap}
            onUseNow={planner.onUseNow}
            context={planner.context}
            weather={planner.weather}
            plan={planner.plan}
            planError={planner.planError}
            loading={planner.loading}
            selected={planner.selected}
            onSelect={planner.setSelectedId}
            geometry={planner.geometry}
            showRoute={planner.showRoute}
            onPlace={planner.setTo}
          />
          <WeatherPage
            active={planner.page === 'weather'}
            apiDown={planner.apiDown}
            onRetry={planner.retry}
            weather={planner.weather}
          />
          <ReportsPage
            active={planner.page === 'reports'}
            apiDown={planner.apiDown}
            onRetry={planner.retry}
            context={planner.context}
            plan={planner.plan}
            evaluation={planner.evaluation}
            geometry={planner.geometry}
            from={planner.from}
            to={planner.to}
            selected={planner.selected}
            showRoute={planner.showRoute}
            highlight={planner.highlight}
            onToggleHighlight={planner.toggleHighlight}
            onPlace={planner.setTo}
          />
        </main>
      </div>
    </div>
  );
}
