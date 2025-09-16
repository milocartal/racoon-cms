import { env } from "~/env";

/**
 * Extrait et renvoie l'URL de base d'une URL présignée en supprimant tous les paramètres de requête.
 *
 * @param {string} presigned - L'URL présignée à traiter.
 * @returns {string} L'URL de base sans aucun paramètre de requête.
 */
export function getUrlFromPresigned(presigned: string): string {
  const url = new URL(presigned);
  url.search = "";
  return url.toString();
}

/**
 * Construit une URL signée pour accéder à un fichier stocké dans MinIO.
 *
 * @param {string | null | undefined} fileURI - L'URI de fichier relative ou une URL HTTP complète.
 * @returns {string | undefined} L'URL signée si l'entrée est une URI relative, ou l'URL d'origine si c'est déjà une URL HTTP, ou undefined si l'entrée est null/undefined.
 */
export function getSignedUrl(fileURI: string | null | undefined) {
  if (!fileURI) return undefined;
  if (fileURI.startsWith("http")) return fileURI;
  const final =
    `https://${env.NEXT_PUBLIC_MINIO_ENDPOINT}/${env.NEXT_PUBLIC_MINIO_BUCKET}/` +
    fileURI;
  return final;
}

/**
 * Supprime le domaine et le chemin du bucket d'une URI de fichier donnée, renvoyant le chemin relatif.
 * Si l'URI est une miniature, le préfixe "thumbnail-" est également supprimé.
 *
 * @param {string | null | undefined} fileURI - L'URI de fichier complète à traiter.
 * @returns {string | undefined} Le chemin du fichier sans le domaine et le bucket, ou une chaîne vide si l'entrée est null/undefined.
 */
export function getUnsignedUrl(fileURI: string | null | undefined) {
  if (!fileURI) return undefined;
  const removed = `https://${env.NEXT_PUBLIC_MINIO_ENDPOINT}/${env.NEXT_PUBLIC_MINIO_BUCKET}/`;
  return fileURI.replace(removed, "").replace("thumbnail-", "");
}

/**
 * Donne une URI de fichier, renvoie la même URI avec "thumbnail-" ajouté au nom du fichier,
 * ou l'URI d'origine si c'est déjà une miniature ou ne pointe pas vers MinIO.
 *
 * @param {string | null | undefined} fileURI - L'URI de fichier à traiter.
 * @returns {string | undefined} L'URI de fichier modifiée avec le préfixe miniature, ou l'URI d'origine si c'est déjà une miniature ou ne pointe pas vers MinIO, ou undefined si l'entrée est null/undefined.
 */
export function getThumbnailUrl(fileURI: string | null | undefined) {
  if (!fileURI) return undefined;
  if (!fileURI.includes(env.NEXT_PUBLIC_MINIO_BUCKET)) return fileURI;
  if (fileURI.includes("thumbnail-")) return fileURI;
  else {
    const list = fileURI.split("/");
    list[list.length - 1] = "thumbnail-" + list[list.length - 1];
    const final = list.join("/");
    return final;
  }
}

/**
 * Enum représentant différents types d'images.
 *
 * @enum {string}
 */
export enum ImageType {
  /**
   * Représente une image d'utilisateur.
   */
  user = "user",
  /**
   * Représente une image de population.
   */
  population = "population",
  /**
   * Représente une image d'espece.
   */
  species = "species",
  /**
   * Représente une image de personnage.
   */
  character = "character",
  /**
   * Représente une image d'un animal.
   */
  animal = "animal",
  /**
   * Représente une image d'un objet.
   */
  item = "item",
  /**
   * Représente une image d'une tuile.
   */
  tile = "tile",
  /**
   * Représente une image d'un univers.
   */
  universe = "universe",
  /**
   * Représente une image d'une histoire.
   */
  story = "story",
}
