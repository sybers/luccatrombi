/**
 * Script à exécuter dans la console du navigateur sur la page du trombinoscope
 * $BASE_URL/directory/users/cards
 *
 * IMPORTANT: Avant de lancer ce script, scrolle jusqu'en bas de la page
 * pour charger tous les employés (infinite scroll).
 *
 * Usage:
 * 1. Va sur $BASE_URL/directory/users/cards
 * 2. Scroll jusqu'en bas pour charger tous les employés
 * 3. Ouvre la console (F12 > Console)
 * 4. Copie-colle ce script et appuie sur Entrée
 * 5. Attends que le script finisse (quelques minutes)
 * 6. Copie le JSON dans le fichier sha1-map.json
 */

(async function buildSha1Map() {
    console.log('🚀 Démarrage du build SHA1...');

    const tiles = document.querySelectorAll('li[trombi-user-tile]');
    console.log(`📋 ${tiles.length} employés trouvés sur la page`);

    const employees = [];
    for (const tile of tiles) {
        const img = tile.querySelector('.employeeTile-picture img');
        const nameEl = tile.querySelector('h4[translate="no"]');

        if (img && nameEl) {
            employees.push({
                name: nameEl.textContent.trim(),
                url: img.src
            });
        }
    }

    console.log(`📸 ${employees.length} employés avec photo`);

    const sha1Map = {};
    let completed = 0;
    let errors = 0;

    const batchSize = 10;
    for (let i = 0; i < employees.length; i += batchSize) {
        const batch = employees.slice(i, i + batchSize);

        await Promise.all(batch.map(async ({ name, url }) => {
            const hash = await getImageSha1(url);
            if (hash) {
                sha1Map[hash] = name;
            } else {
                errors++;
            }
            completed++;
        }));

        const percent = Math.round((completed / employees.length) * 100);
        console.log(`⏳ Progression: ${completed}/${employees.length} (${percent}%) - ${errors} erreurs`);
    }

    console.log('');
    console.log('✅ Terminé !');
    console.log('📦 Backup JSON (copie-le dans le fichier sha1-map.json):');
    console.log(JSON.stringify(sha1Map));
    console.log('');
    console.log('Tu peux maintenant utiliser le script cheat.js !');

    return sha1Map;
})();

async function sha1(arrayBuffer) {
    const hashBuffer = await crypto.subtle.digest('SHA-1', arrayBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function getImageSha1(url) {
    try {
        const response = await fetch(url, { credentials: 'include' });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const arrayBuffer = await response.arrayBuffer();
        return await sha1(arrayBuffer);
    } catch (e) {
        console.warn(`Erreur pour ${url}:`, e.message);
        return null;
    }
}