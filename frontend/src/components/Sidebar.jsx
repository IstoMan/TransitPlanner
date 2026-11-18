export default function Sidebar({ activeHash, badge, menuOpen, onTheme }) {
  return (
    <aside className={`side${menuOpen ? ' open' : ''}`} id="side">
      <div className="logo">PUNE<span> / </span>TRANSIT</div>
      <nav className="nav" id="nav">
        <a href="#plan" className={activeHash === '#plan' ? 'on' : undefined}>Plan a trip</a>
        <a href="#sampleCoverage" className={activeHash === '#sampleCoverage' ? 'on' : undefined}>
          Sample coverage <span className="badge">{badge}</span>
        </a>
        <a href="#weather" className={activeHash === '#weather' ? 'on' : undefined}>Weather</a>
        <a href="#reports" className={activeHash === '#reports' ? 'on' : undefined}>Reports</a>
        <span className="spacer" />
        <button type="button" onClick={onTheme}>Switch theme</button>
      </nav>
    </aside>
  );
}
