import adapter from '@sveltejs/adapter-static';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	// Der Web Worker mit OpenFisca (src/lib/openfisca/motor.worker.js) ist ein ES-Modul.
	worker: { format: 'es' },
	plugins: [
		sveltekit({
			// Statische Website für GitHub Pages: alle Seiten werden beim Bauen
			// erzeugt, gerechnet wird im Browser (Pyodide).
			adapter: adapter({ fallback: '404.html' })
		})
	]
});
