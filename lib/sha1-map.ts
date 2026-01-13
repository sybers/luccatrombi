export type Sha1Map = Record<string, string>;

export function loadSha1Map(): Sha1Map {
  const mapPath = new URL("../sha1-map.json", import.meta.url);

  let data: string;
  try {
    data = Deno.readTextFileSync(mapPath);
  } catch {
    console.error("sha1-map.json not found!");
    console.error(
      "   First run build-sha1-browser.js in the browser console"
    );
    console.error("   then copy the JSON into sha1-map.json");
    Deno.exit(1);
  }

  const map: Sha1Map = JSON.parse(data);

  if (Object.keys(map).length === 0) {
    console.error("sha1-map.json is empty!");
    Deno.exit(1);
  }

  return map;
}
