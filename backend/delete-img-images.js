import fetch from 'node-fetch';

const RAILWAY_URL = 'https://merlins-internetbackend-production.up.railway.app';
const ADMIN_PASSWORD = 'R8p6CnAAEER#0E';

// IMG image IDs to delete
const imgIds = [
    'cmfbocbk5000lp3q6lytimw5n', // IMG_0412
    'cmfbocekf000mp3q6knwmcfyq', // IMG_0438
    'cmfbocglt000np3q6tsfbf9qm', // IMG_0440
    'cmfbocj2p000op3q652qc35it', // IMG_0441
    'cmfboclit000pp3q63gclm5mw', // IMG_0443
    'cmfbocpbc000qp3q6g1nhf7s1', // IMG_0444
];

async function deleteImgImages() {
    console.log(`Deleting ${imgIds.length} IMG images...`);

    for (const id of imgIds) {
        try {
            const response = await fetch(`${RAILWAY_URL}/api/gallery/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${ADMIN_PASSWORD}`,
                },
            });

            if (response.ok) {
                console.log(`✅ Deleted image: ${id}`);
            } else {
                console.error(`❌ Error deleting ${id}:`, await response.text());
            }
        } catch (error) {
            console.error(`❌ Error deleting ${id}:`, error.message);
        }
    }

    console.log('🎉 All IMG images deleted!');
}

deleteImgImages();
