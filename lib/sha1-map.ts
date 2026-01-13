export type Sha1Map = Record<string, string>;

export function loadSha1Map(): Sha1Map {
  const mapPath = new URL("../sha1-map.json", import.meta.url);

  let data: string;
  try {
    data = Deno.readTextFileSync(mapPath);
  } catch {
    console.error("sha1-map.json non trouve !");
    console.error(
      "   Lance d'abord build-sha1-browser.js dans la console du navigateur"
    );
    console.error("   puis copie le JSON dans sha1-map.json");
    Deno.exit(1);
  }

  const map: Sha1Map = JSON.parse(data);

  if (Object.keys(map).length === 0) {
    console.error("sha1-map.json est vide !");
    Deno.exit(1);
  }

  return map;
}
