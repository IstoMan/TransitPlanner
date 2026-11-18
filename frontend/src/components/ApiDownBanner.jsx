export default function ApiDownBanner({ onRetry }) {
  return (
    <div className="card c12">
      <div className="banner">
        <h4>The planner API is not running</h4>
        <p>Start the API at http://127.0.0.1:8000. Trip times, fares, and sample counts stay blank until it responds.</p>
      </div>
      <button className="link" type="button" onClick={onRetry}>Try again</button>
    </div>
  );
}
