import { minutes, money, optionColor, optionIcon } from '../format.js';

function optionOpen(option) {
  return Boolean(option?.available) && option.minutes != null;
}

export default function TravelOptions({ plan, selected, onSelect }) {
  return (
    <div className="opts">
      {(plan?.options || []).map((option) => (
        <button
          key={option.id}
          className={`opt${selected?.id === option.id ? ' sel' : ''}`}
          style={{ '--c': optionColor(option) }}
          type="button"
          aria-pressed={selected?.id === option.id}
          onClick={() => onSelect(option.id)}
        >
          <span className="ic">{optionIcon(option)}</span>
          <span>
            <strong>
              {option.name}
              {option.fastest ? <span className="tag">Fastest</span> : null}
            </strong>
            <small>{option.note}</small>
            <small>{option.sub}</small>
          </span>
          <span className="mins">
            {optionOpen(option) ? minutes(option.minutes) : '—'}
            <span>{optionOpen(option) ? `min · ${money(option.fare_inr)}` : 'n/a'}</span>
          </span>
        </button>
      ))}
    </div>
  );
}
