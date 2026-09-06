/**
 * Alt text for every photograph in the library.
 *
 * Written by hand from the frames themselves, because a screen reader deserves
 * a description of the picture rather than a filename. Keyed by the photograph
 * id, which is the original filename slugified — see src/lib/photos.ts.
 *
 * Replacing photographs? Add the new id here. `describe()` falls back to a
 * neutral, honest description rather than throwing, so a missing entry degrades
 * to plain instead of breaking the page.
 */

type Caption = {
  /** Describes the photograph for screen readers. */
  alt: string;
  /** Optional short line printed beside the frame in a project story. */
  note?: string;
};

export const CAPTIONS: Record<string, Caption> = {
  // ── Ring ceremony ────────────────────────────────────────────────────────
  '0f5a4569': {
    alt: 'Two gold rings resting in shallow dishes of red kumkum on a brass tray, foliage behind.',
    note: 'Before anyone is called in.',
  },
  '0f5a4579': {
    alt: 'A couple hold a ring between them, hands together at the centre of the frame.',
  },
  '0f5a4584': {
    alt: 'A couple laugh together in front of a wall of pink and cream flowers.',
  },
  '0f5a4587': {
    alt: 'He slides a ring onto her finger; both are looking down at her hand.',
    note: 'The only part of the evening nobody rehearses.',
  },
  '0f5a4594': {
    alt: 'A plume of white smoke crosses the frame beside the couple as petals fall.',
  },
  '0f5a4601': {
    alt: 'He dips her back and her embroidered lehenga sweeps across the floor.',
  },
  '0f5a4616': {
    alt: 'The couple hold a small bouquet between them, guests just out of frame.',
  },
  '0f5a4684': {
    alt: 'A woman in a pale pink gown mid-turn on the dance floor, hair flying.',
  },
  '0f5a5046': {
    alt: 'The couple stand forehead to forehead in a marble lobby lit warm gold.',
  },
  '0f5a5048': {
    alt: 'Her embroidered train fans out behind her across polished marble.',
  },
  '0f5a5061': {
    alt: 'The couple stand together in a hotel lobby of gold and grey marble.',
  },
  '0f5a5062': {
    alt: 'Two hands covered in fresh henna, glass bangles stacked at the wrist.',
    note: 'Henna, still drying.',
  },
  '0f5a5067': {
    alt: 'Two open palms held side by side, henna patterns filling both.',
  },

  // ── Varmala and reception ────────────────────────────────────────────────
  '0f5a6488': {
    alt: 'Bride and groom face each other holding hands as spark fountains burn on both sides.',
    note: 'Cold sparks, and the room goes quiet.',
  },
  '0f5a6489': {
    alt: 'The couple hold hands amid falling sparks, guests watching from behind.',
  },
  '0f5a6491': {
    alt: 'A wider view of the couple between two banks of spark fountains and low fog.',
  },
  '0f5a6494': {
    alt: 'Seen from behind, the couple raise joined hands above their heads through the smoke.',
  },
  '0f5a6503': {
    alt: 'The groom greets the room with folded hands, the bride beside him, gold drape behind.',
  },
  '0f5a6506': {
    alt: 'Wide view of the stage: the couple stand in fog lit by spark fountains and gold fabric.',
  },
  '0f5a6528': {
    alt: 'Two guests stand together for a portrait against a panelled wall.',
  },
  '0f5a6531': {
    alt: 'A woman in a teal sari looks over her shoulder at the camera.',
  },
  '0f5a6536': {
    alt: 'A woman in a teal sari stands full length, phone in hand, looking into the lens.',
  },
  '0f5a6545': {
    alt: 'A woman in a purple sari, bangles stacked to the elbow, smiling at the camera.',
  },
  '0f5a6604': {
    alt: 'A couple dance on a lit floor in front of a red graphic backdrop.',
  },
  '0f5a6631': {
    alt: 'Full-length portrait of the couple, he in cream, she in deep maroon.',
  },
  '0f5a6744': {
    alt: 'A man in a black tuxedo and bow tie, hand raised to his lapel.',
  },
  // ── Ceremony: the fire and the vows ──────────────────────────────────────
  '0f5a9678': {
    alt: 'The groom in cream, ceremonial sword at his side, the bride in red beside him.',
  },
  '0f5a9697': {
    alt: 'The couple seated on a gilded settee in front of a wall of peach and orange flowers.',
  },
  '0f5a9856': {
    alt: 'Bride and groom sit at a long table of food, garlands still around their necks.',
    note: 'Nobody photographs this part. They should.',
  },
  '0f5a9946': {
    alt: 'An elder in a pink turban sits cross-legged beside the groom at the sacred fire.',
  },
  '0f5a9959': {
    alt: 'The bride in red sits at the mandap surrounded by family and ritual trays.',
  },
  '0f5a9962': {
    alt: 'The bride in red and gold with her eyes closed, maang tikka against her hair.',
    note: 'A held breath.',
  },
  '0f5a9983': {
    alt: 'Elders’ hands pass an offering to the couple across the ritual fire.',
  },
  '0f5a9991': {
    alt: 'Hands joined over the fire as a relative ties the couple together.',
  },
  'teaser-1': {
    alt: 'Official cinematic teaser film for Chawla Studio, served as a cover frame on the video reel.',
  },
  'trailer-1': {
    alt: 'Official cinematic trailer film for Chawla Studio, served as a cover frame on the video reel.',
  },

  // ── Bridal portraits ─────────────────────────────────────────────────────
  '0f5a6305': {
    alt: 'The bride’s face fills the frame in deep red light, eyes lowered.',
  },
  '0f5a6324': {
    alt: 'The bride in maroon leans back against a wash of pink light, henna on her arms.',
  },
  '0f5a6329': {
    alt: 'The bride in maroon and silver against a plain red wall, looking into the lens.',
    note: 'One wall, one light, no set.',
  },
  '0f5a6360': {
    alt: 'The bride in maroon with an emerald necklace, lit low against near-darkness.',
  },
  '0f5a6366': {
    alt: 'The bride is helped with her jewellery in warm low light, another face half in shadow.',
  },

  // ── First birthday ───────────────────────────────────────────────────────
  '0f5a6222': {
    alt: 'A framed photograph of the birthday girl on an easel among marquee letters and lights.',
  },
  '0f5a6225': {
    alt: 'A portrait of the baby inside an ornate coral frame, balloons soft in the foreground.',
  },
  '0f5a6360-2': {
    alt: 'The baby sits in a white tulle dress among pink balloons at the party set.',
  },
  '0f5a6392': {
    alt: 'An older man in a suit carries a little girl in a navy party dress on his shoulder.',
  },
  '0f5a6393': {
    alt: 'A woman in a grey sari laughs as she holds a toddler in a yellow t-shirt.',
  },
  '0f5a6404': {
    alt: 'A woman in peach holds the baby in white tulle in front of the lit party backdrop.',
  },

  // ── Official films ────────────────────────────────────────────────────────
  'highlight-1': {
    alt: 'A still from the highlights reel, the couple mid-dance under warm stage light.',
  },
  'highlight-2': {
    alt: 'A still from the wedding highlights film, the couple walking together amid celebration.',
  },
};

/**
 * Alt text for a photograph. Falls back to a plain, truthful description so a
 * newly-added file is never announced as "image" or, worse, as a filename.
 */
export const describe = (id: string): string =>
  CAPTIONS[id]?.alt ?? 'A photograph by Chawla Studio.';

/** Optional marginal note printed beside a frame in a project story. */
export const noteFor = (id: string): string | null => CAPTIONS[id]?.note ?? null;

