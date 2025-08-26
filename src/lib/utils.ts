import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Convertit une chaîne de caractères en un slug compatible avec les URLs.
 *
 * La fonction normalise la chaîne, supprime les diacritiques, la met en minuscules,
 * remplace les caractères non alphanumériques par des tirets et retire les tirets en début/fin.
 *
 * @param name - La chaîne à convertir en slug.
 * @returns La version slugifiée de la chaîne d'entrée.
 */
export function toSlug(name: string) {
  return name
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/**
 * Génère une valeur de repli ("fallback") à partir d'un nom donné.
 *
 * - Si le nom est nul, indéfini ou vide, retourne "RPG".
 * - Si le nom contient un seul mot, retourne ce mot avec la première lettre en majuscule.
 * - Si le nom contient plusieurs mots, conserve uniquement le premier et le dernier mot,
 *   puis retourne ces mots avec la première lettre en majuscule, séparés par un espace.
 *
 * @param name Le nom à transformer en valeur de repli.
 * @returns La valeur de repli formatée.
 */
export function toFallback(name: string | null | undefined) {
  console.warn("toFallback", name);
  if (!name || name.trim() === "") {
    return "RA";
  }

  const words = name.split(" ");
  if (words.length === 0) {
    return "RA";
  } else if (words.length === 1) {
    return name.charAt(0).toUpperCase() + name.slice(1);
  } else {
    if (words.length > 2) {
      words.splice(1, words.length - 2);
    }
    const fallbackWords = words.map(
      (word) => word.charAt(0).toUpperCase() + word.slice(1),
    );
    return fallbackWords.join(" ");
  }
}
