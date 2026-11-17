// Rechnet im Browser statt über /api/berechnen und /api/vergleich. Gleiche
// Ein- und Ausgaben wie die beiden Routen; OpenFisca läuft im Web Worker
// (motor.worker.js).
import { situation, ergebnisse, fehlerliste } from './situation.js';
import * as vergleich from './vergleich.js';

let worker = null;
let naechsteId = 1;
const offen = new Map();

function motor() {
	if (!worker) {
		worker = new Worker(new URL('./motor.worker.js', import.meta.url), { type: 'module' });
		worker.onmessage = ({ data }) => {
			const anfrage = offen.get(data.id);
			offen.delete(data.id);
			if (data.absturz) anfrage.reject(new Error(data.absturz));
			else anfrage.resolve(data);
		};
	}
	return worker;
}

/** Wie POST /calculate der OpenFisca-Web-API. */
function calculate(eingabe) {
	return new Promise((resolve, reject) => {
		const id = naechsteId++;
		offen.set(id, { resolve, reject });
		motor().postMessage({ id, situation: JSON.stringify(eingabe) });
	});
}

/** Startet Pyodide schon beim Laden der Seite (dauert einige Sekunden). */
export function vorladen() {
	motor().postMessage({ vorladen: true });
}

/** Wie POST /api/berechnen. */
export async function berechnen(angaben) {
	const antwort = await calculate(situation(angaben));
	return antwort.ok ? ergebnisse(antwort.inhalt, angaben) : { fehler: fehlerliste(antwort.inhalt) };
}

/** Wie POST /api/vergleich. */
export async function vergleichen(angaben) {
	const liste = vergleich.faelle(angaben);
	const antwort = await calculate(vergleich.situation(angaben, liste));
	return antwort.ok
		? vergleich.auswerten(antwort.inhalt, angaben, liste)
		: { fehler: fehlerliste(antwort.inhalt) };
}
