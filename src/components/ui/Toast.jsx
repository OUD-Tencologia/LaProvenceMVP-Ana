export default function Toast({ toasts }) {
  if (!toasts.length) return null;
  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <div key={t.id} className={`toast${t.type === 'error' ? ' error' : ''}`}>
          {t.msg}
        </div>
      ))}
    </div>
  );
}
