export default function TopBar({ menuOpen, onToggleMenu, searchRef, places, onSearch }) {
  return (
    <header className="top">
      <button
        className="menu-toggle"
        type="button"
        aria-label="Open navigation"
        aria-expanded={menuOpen}
        onClick={onToggleMenu}
      >
        Menu
      </button>
      <input
        id="search"
        ref={searchRef}
        list="pl"
        placeholder="Search a place in Pune…"
        aria-label="Search a place"
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            event.preventDefault();
            onSearch(event.currentTarget.value, true);
          }
        }}
      />
      <datalist id="pl">
        {places.map((place) => <option key={place.name} value={place.name} />)}
      </datalist>
      <span className="pill">Pune, India</span>
    </header>
  );
}
