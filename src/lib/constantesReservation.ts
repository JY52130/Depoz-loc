// Constantes partagées client/serveur pour les réservations — ne doit avoir
// AUCUNE dépendance serveur (Prisma, etc.) car importé depuis des composants
// client (ex: ReserverForm) et depuis les server actions.

// Frais point relais (section 17, point 5 — montant à confirmer). Placeholder
// V1 : forfait fixe à la charge du locataire (décision retenue : le locataire paie).
export const FRAIS_POINT_RELAIS = 5;
