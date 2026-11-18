<script>
	import '../app.css';
	import { page } from '$app/state';
	import { texte } from '#lib/darstellung.js';
	import futuresociety from '#lib/assets/logos/futuresociety.svg';

	let { children } = $props();

	const TABS = [
		{ href: '/', text: texte.navigation.home },
		{ href: '/rechner', text: texte.navigation.rechner },
		{ href: '/dashboard', text: texte.navigation.dashboard },
		{ href: '/ueberblick', text: texte.navigation.ueberblick },
		{ href: '/gesetzgebung', text: texte.navigation.gesetzgebung }
	];
</script>

<svelte:head>
	<title>Kinderbetreuung: Beitrag berechnen</title>
</svelte:head>

<!-- Auf jeder Seite: studentisches Projekt, Testversion, nicht offiziell -->
<p class="hinweis" role="note">
	<span class="inhalt">{texte.projekt.hinweis}</span>
</p>

<header>
	<div class="inhalt">
		<p class="label">{texte.projekt.label}</p>
		<h1>Kinderbetreuung: Beitrag berechnen</h1>
		<nav aria-label="Hauptnavigation">
			{#each TABS as tab (tab.href)}
				<a
					href={tab.href}
					aria-current={page.url.pathname === tab.href ? 'page' : undefined}
				>
					{tab.text}
				</a>
			{/each}
		</nav>
	</div>
</header>

<main class="inhalt">
	{@render children()}
</main>

<footer>
	<div class="inhalt">
		<p>{texte.projekt.herkunft} {texte.projekt.hinweis}</p>
		<ul class="logos" aria-label={texte.projekt.logos}>
			<li>
				<!-- Logo wie auf legalhackathons.org: §-Quadrat und Schriftzug -->
				<a class="legal-hackathon" href="https://legalhackathons.org/">
					<svg width="28" height="28" viewBox="0 0 32 32" aria-hidden="true">
						<rect width="32" height="32" rx="6" fill="#07070a" />
						<text
							x="50%"
							y="22"
							font-family="monospace"
							font-size="18"
							font-weight="bold"
							fill="#00ff88"
							text-anchor="middle">§</text
						>
					</svg>
					<span>legal_hackathon<span>@unisg</span></span>
				</a>
			</li>
			<li>
				<a href="https://futuresociety.ch/">
					<img src={futuresociety} alt="Future Society Hub (FuSo), Universität St. Gallen" />
				</a>
			</li>
		</ul>
	</div>
</footer>

<style>
	header {
		background: var(--card);
		border-top: 4px solid var(--gruen-wappen);
		border-bottom: 1px solid var(--border);
		padding-top: 1.5rem;
	}

	/* Hinweisband ganz oben: nicht offiziell, Testversion */
	.hinweis {
		margin: 0;
		padding: 0.5rem 0;
		background: var(--secondary);
		border-bottom: 1px solid var(--border);
		color: var(--foreground);
		font-size: var(--text-xs);
		line-height: 1.125rem;
	}

	.hinweis .inhalt {
		display: block;
	}

	header h1 {
		margin: 0.25rem 0 0;
		font-size: var(--text-2xl);
		line-height: 2.125rem;
		font-weight: 700;
	}

	.label {
		margin: 0;
	}

	/* Tabs: aktiver Tab mit grüner Linie unten, wie die Navigation im Style-Kit */
	nav {
		display: flex;
		gap: 0.25rem;
		margin-top: 1rem;
		/* Auf schmalen Bildschirmen scrollen die Tabs, nicht die ganze Seite */
		overflow-x: auto;
		scrollbar-width: none;
	}

	nav a {
		flex-shrink: 0;
		white-space: nowrap;
		padding: 0.5rem 0.75rem;
		border-bottom: 2px solid transparent;
		color: var(--muted-foreground);
		font-size: var(--text-sm);
		font-weight: 500;
		text-decoration: none;
		transition:
			color 100ms ease-out,
			border-color 100ms ease-out;
	}

	nav a:hover {
		color: var(--foreground);
	}

	nav a[aria-current='page'] {
		color: var(--foreground);
		border-bottom-color: var(--primary);
	}

	nav a:focus-visible {
		outline: 3px solid var(--ring);
		border-radius: var(--radius-md);
	}

	.inhalt {
		width: 100%;
		max-width: 46rem;
		margin: 0 auto;
		padding: 0 1rem;
	}

	footer {
		background: var(--card);
		border-top: 1px solid var(--border);
		padding: 1.5rem 0 2rem;
		color: var(--muted-foreground);
		font-size: var(--text-sm);
	}

	footer p {
		margin: 0 0 1rem;
	}

	.logos {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 1.5rem;
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.logos a {
		display: flex;
		align-items: center;
		border-radius: var(--radius-md);
		text-decoration: none;
	}

	.logos a:focus-visible {
		outline: 3px solid var(--ring);
		outline-offset: 2px;
	}

	.logos img {
		height: 2.5rem;
		width: auto;
	}

	.legal-hackathon {
		gap: 0.5rem;
		color: var(--foreground);
		font-family: var(--font-mono);
		font-size: var(--text-sm);
		font-weight: 600;
	}

	.legal-hackathon span span {
		color: var(--primary);
	}

	/* main.inhalt, damit .inhalt (Innenabstand nur seitlich) den Abstand oben
	   und unten nicht überschreibt */
	main.inhalt {
		flex: 1 0 auto;
		padding-top: 2rem;
		padding-bottom: 4rem;
	}
</style>
