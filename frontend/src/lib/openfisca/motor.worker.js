// Web Worker: lädt Pyodide, die Python-Pakete und das OpenFisca-Modell aus
// /pyodide/ (tools/build_pyodide.sh) und rechnet Situationen wie die
// OpenFisca-Web-API. Die Angaben verlassen den Browser nicht.
import motor from './motor.py?raw';

const BASIS = `${self.location.origin}/pyodide/`;

async function starten() {
	const { loadPyodide } = await import(/* @vite-ignore */ `${BASIS}pyodide.mjs`);
	const pyodide = await loadPyodide({ indexURL: BASIS });
	const manifest = await (await fetch(`${BASIS}manifest.json`)).json();
	await pyodide.loadPackage(
		[...manifest.pyodide, ...manifest.wheels.map((w) => `${BASIS}wheels/${w}`)],
		{ messageCallback: () => {} }
	);
	const modell = await (await fetch(`${BASIS}${manifest.modell}`)).arrayBuffer();
	pyodide.unpackArchive(modell, 'zip', { extractDir: '/home/pyodide/modell' });
	pyodide.runPython(motor);
	return pyodide.globals.get('calculate');
}

const bereit = starten();

self.onmessage = async ({ data }) => {
	try {
		const calculate = await bereit;
		if (data.vorladen) return;
		self.postMessage({ id: data.id, ...JSON.parse(calculate(data.situation)) });
	} catch (fehler) {
		if (!data.vorladen) self.postMessage({ id: data.id, absturz: String(fehler) });
	}
};
