// ======================================================
// RUNWAYS & CORRIDORS
// ======================================================

/**
 * Définitions des pistes EBLG.
 * heading = QFU réel
 */
export const RUNWAYS = {
    "22": {
        heading: 220,
        start: [50.64695, 5.44340],
        end:   [50.63740, 5.46010],
        width_m: 45
    },
    "04": {
        heading: 40,
        start: [50.63740, 5.46010],
        end:   [50.64695, 5.44340],
        width_m: 45
    }
};

/**
 * Corridors d’approche/départ simplifiés.
 */
export const CORRIDORS = {
    "04": [
        [50.700000, 5.300000],
        [50.670000, 5.380000],
        [50.645900, 5.443300]
    ],
    "22": [
        [50.600000, 5.600000],
        [50.620000, 5.520000],
        [50.637300, 5.463500]
    ]
};

/**
 * Dessine la piste active sur la carte.
 * @param {string} runway - "22", "04" ou "UNKNOWN"
 * @param {L.LayerGroup} layer - layer Leaflet
 */
export function drawRunway(runway, layer) {
    layer.clearLayers();
    if (runway === "UNKNOWN") return;

    const r = RUNWAYS[runway];
    const [lat1, lng1] = r.start;
    const [lat2, lng2] = r.end;

    const dx = lng2 - lng1;
    const dy = lat2 - lat1;
    const len = Math.sqrt(dx*dx + dy*dy);
    const px = -(dy / len);
    const py = dx / len;

    const meterToDeg = 1 / 111320;
    const halfW = (r.width_m * meterToDeg) / 2;

    const p1L = [lat1 + py * halfW, lng1 + px * halfW];
    const p1R = [lat1 - py * halfW, lng1 - px * halfW];
    const p2L = [lat2 + py * halfW, lng2 + px * halfW];
    const p2R = [lat2 - py * halfW, lng2 - px * halfW];

    L.polygon([p1L, p1R, p2R, p2L], {
        color: "#222",
        weight: 1,
        fillColor: "#333",
        fillOpacity: 0.9
    }).addTo(layer);

    L.polyline([r.start, r.end], {
        color: "#fff",
        weight: 2,
        dashArray: "8,8"
    }).addTo(layer);

    const num1 = (r.heading / 10).toFixed(0).padStart(2, "0");
    const num2 = (((r.heading + 180) % 360) / 10).toFixed(0).padStart(2, "0");

    L.marker(r.start, {
        icon: L.divIcon({ className: "runway-number", html: num1 })
    }).addTo(layer);

    L.marker(r.end, {
        icon: L.divIcon({ className: "runway-number", html: num2 })
    }).addTo(layer);
}

/**
 * Dessine le corridor d’approche/départ.
 * @param {string} runway
 * @param {L.LayerGroup} layer
 */
export function drawCorridor(runway, layer) {
    layer.clearLayers();
    if (runway === "UNKNOWN") return;

    const line = L.polyline(CORRIDORS[runway], {
        color: "orange",
        weight: 2,
        dashArray: "6,6"
    }).addTo(layer);

    if (L.polylineDecorator) {
        L.polylineDecorator(line, {
            patterns: [{
                offset: "25%",
                repeat: "50%",
                symbol: L.Symbol.arrowHead({
                    pixelSize: 12,
                    polygon: false,
                    pathOptions: { stroke: true, color: "orange" }
                })
            }]
        }).addTo(layer);
    }
}

/**
 * Détermine la piste active en fonction du vent.
 * @param {number} windDir
 * @returns {string}
 */
export function getRunwayFromWind(windDir) {
    if (!windDir) return "UNKNOWN";
    const diff22 = Math.abs(windDir - 220);
    const diff04 = Math.abs(windDir - 40);
    return diff22 < diff04 ? "22" : "04";
}

/**
 * Calcule le crosswind.
 * @returns {{crosswind:number, angleDiff:number}}
 */
export function computeCrosswind(windDir, windSpeed, runwayHeading) {
    if (!windDir || !windSpeed || !runwayHeading)
        return { crosswind: 0, angleDiff: 0 };

    const angleDiff = Math.abs(windDir - runwayHeading);
    const rad = angleDiff * Math.PI / 180;
    const crosswind = Math.round(Math.abs(windSpeed * Math.sin(rad)));

    return { crosswind, angleDiff };
}
