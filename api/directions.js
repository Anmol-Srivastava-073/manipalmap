export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { coordinates } = req.body;

    try {
        const response = await fetch('https://api.openrouteservice.org/v2/directions/foot-walking/geojson', {
            method: 'POST',
            headers: {
                'Authorization': process.env.ORS_API_KEY, 
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ coordinates })
        });

        if (!response.ok) {
            throw new Error(`ORS API responded with ${response.status}`);
        }

        const data = await response.json();
        return res.status(200).json(data);

    } catch (error) {
        console.error("Routing Error:", error);
        return res.status(500).json({ error: 'Failed to fetch route' });
    }
}
