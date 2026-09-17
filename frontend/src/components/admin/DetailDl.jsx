/**
 * [buatan] Daftar definisi label–nilai untuk modal detail admin.
 *
 * `items` = array [label, value]. Dipakai bersama AdminDetailModal.
 */
/** Props: items = array pasangan [label, value] untuk modal detail. */
export default function DetailDl({ items }) {
  return (
    <dl className="admin-detail-dl">
      {items.map(([label, value]) => (
        <div key={label} className="admin-detail-row">
          <dt>{label}</dt>
          <dd>{value ?? '—'}</dd>
        </div>
      ))}
    </dl>
  );
}
