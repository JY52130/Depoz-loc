export function slugify(texte: string): string {
  return texte
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // retire les accents (diacritiques combinants)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export function genererSlugAnnonce(titre: string): string {
  const suffixe = Math.random().toString(36).slice(2, 8);
  return `${slugify(titre)}-${suffixe}`;
}
