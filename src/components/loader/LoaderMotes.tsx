/**
 * A handful of specks of light, drifting upward.
 *
 * Eight of them on a desktop and four on a phone, at fixed positions — no
 * randomness, because a random layout differs between the server's markup and
 * the client's and React would have to throw the first one away. They are pure
 * decoration over a photograph that is already full of bokeh, so the count stays
 * small: this is a suggestion of the string lights behind the couple, not a
 * particle field.
 *
 * The layer is not rendered at all when motion is reduced — see CinematicLoader.
 */
const MOTES = [
  { left: '11%', top: '68%', size: 3, delay: 0, duration: 11 },
  { left: '23%', top: '82%', size: 2, delay: 2.4, duration: 13 },
  { left: '36%', top: '74%', size: 2, delay: 5.1, duration: 10 },
  { left: '49%', top: '88%', size: 3, delay: 1.3, duration: 14 },
  { left: '63%', top: '71%', size: 2, delay: 3.8, duration: 12 },
  { left: '74%', top: '85%', size: 3, delay: 6.2, duration: 11 },
  { left: '85%', top: '66%', size: 2, delay: 0.9, duration: 15 },
  { left: '92%', top: '79%', size: 2, delay: 4.6, duration: 12 },
] as const;

export function LoaderMotes() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {MOTES.map((mote, index) => (
        <span
          key={mote.left}
          className={
            index < 4
              ? 'loader-mote absolute rounded-full bg-gold-bright'
              : 'loader-mote absolute hidden rounded-full bg-gold-bright md:block'
          }
          style={{
            left: mote.left,
            top: mote.top,
            width: `${mote.size}px`,
            height: `${mote.size}px`,
            animationDelay: `${mote.delay}s`,
            animationDuration: `${mote.duration}s`,
          }}
        />
      ))}
    </div>
  );
}
