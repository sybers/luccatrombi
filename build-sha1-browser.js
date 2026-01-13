/**
 * Script to run in the browser console on the directory page
 * $BASE_URL/directory/users/cards
 *
 * IMPORTANT: Before running this script, scroll to the bottom of the page
 * to load all employees (infinite scroll).
 *
 * Usage:
 * 1. Go to $BASE_URL/directory/users/cards
 * 2. Scroll to the bottom to load all employees
 * 3. Open the console (F12 > Console)
 * 4. Copy-paste this script and press Enter
 * 5. Wait for the script to finish (a few minutes)
 * 6. Copy the JSON into the sha1-map.json file
 */

(async function buildSha1Map() {
    console.log('🚀 Starting SHA1 build...');

    const tiles = document.querySelectorAll('li[trombi-user-tile]');
    console.log(`📋 ${tiles.length} employees found on page`);

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

    console.log(`📸 ${employees.length} employees with photo`);

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
        console.log(`⏳ Progress: ${completed}/${employees.length} (${percent}%) - ${errors} errors`);
    }

    console.log('');
    console.log('✅ Done!');
    console.log('📦 Backup JSON (copy it into the sha1-map.json file):');
    console.log(JSON.stringify(sha1Map));
    console.log('');
    console.log('You can now use the cheat.js script!');

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
        console.warn(`Error for ${url}:`, e.message);
        return null;
    }
}