/**
 * Carte façon polaroid : cadre papier à marges fines sur les côtés et en haut,
 * plus large en bas, ombre portée légère, et deux petits tags dans les coins
 * bas — « [ 001 ] » à gauche, un mot à droite.
 *
 * Purement présentationnel : la rotation est passée en degrés par le parent,
 * la carte ne tire rien d'aléatoire elle-même (sinon l'hydratation casse).
 * Réutilisable partout où une réalisation doit se présenter comme une carte.
 */
export default function PolaroidCard({
  src,
  alt = '',
  tagLeft,
  tagRight,
  rotation = 0,
  className = '',
  style,
}) {
  return (
    <figure
      className={`polaroid ${className}`.trim()}
      style={{ '--polaroid-rot': `${rotation}deg`, ...style }}
    >
      {/* Cartes décoratives ou vignettes : le parent décide de l'alt. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="polaroid__img" src={src} alt={alt} draggable={false} />
      {tagLeft || tagRight ? (
        <figcaption className="polaroid__tags" aria-hidden="true">
          <span>{tagLeft}</span>
          <span>{tagRight}</span>
        </figcaption>
      ) : null}
    </figure>
  );
}
