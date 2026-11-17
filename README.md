# Law as Code St. Gallen

**Rules as Code for the law of the Canton of St. Gallen, running entirely in your browser.**

Website: https://law-as-code-sg.github.io/

The legal rules are written a second time as program code ([OpenFisca](https://openfisca.org)), tested against cases worked out by hand from the legal text, and presented on a website that explains each result with the articles behind it. The website is static: OpenFisca runs in the browser through [Pyodide](https://pyodide.org) (Python compiled to WebAssembly). There is no server, and the data entered never leaves the browser.

> This is an independent prototype, not an official service of the Canton of St. Gallen. Results are estimates without legal effect.

## Applications

| Application | Legal basis | Status |
|---|---|---|
| Childcare contributions (calculator, comparison tool, overview, legal text) | KiBG (adopted 14 June 2026), KiBV (draft, consultation until 15 November 2026) | Prototype; the system starts on 1 August 2028 (placeholder date) |

Further legal applications of the canton are planned. Each law gets its own parameters, variables and tests in the same model (`openfisca_ch_sg`, currently `parameters/kibg/` and variables prefixed `kibg_`).

## How it works

```
Browser
├── SvelteKit website (static, GitHub Pages)
│     form → OpenFisca "situation" (src/lib/openfisca/situation.js)
└── Web Worker
      Pyodide + OpenFisca Core + openfisca_ch_sg
      openfisca_web_api.handlers.calculate  ← the same function as POST /calculate
```

The model is identical to the one served by the OpenFisca Web API, so the website, the tests and any other application (e.g. a municipality's case software calling the Web API) get the same answer.

## Repository structure

```
openfisca-CH-SG/      OpenFisca model: entities, parameters (each with its article),
                      variables, hand-calculated tests
frontend/             SvelteKit website; src/lib/openfisca/ runs the model in the browser
tools/                build_pyodide.sh (model and Python packages for the browser),
                      rulebook checker, setup script, decision-log generator
challenge/            rule inventory and scenario catalogue for the KiBG
docs/                 decision log, legal design, output concept, full report
RULEBOOK.md           how rules are written in code and what is checked
```

## Local development

You need Node.js 22 and Python with pip; [uv](https://docs.astral.sh/uv/) for the model's checks and tests.

```bash
bash tools/setup.sh                      # once: model, checks, git hooks (needs uv)
cd frontend && npm install
bash ../tools/build_pyodide.sh           # Pyodide + model → frontend/static/pyodide/
npm run dev                              # http://localhost:5173
```

Run `tools/build_pyodide.sh` again after every change to the model; otherwise the website keeps computing with the previous version.

Tests:

```bash
cd openfisca-CH-SG && make test          # OpenFisca tests (hand-calculated cases)
cd openfisca-CH-SG && make serve-local   # optional: Web API on port 5000 ...
cd frontend && npm test                  # ... for the website tests that use it
```

## Deployment

`.github/workflows/pages.yaml` runs the rulebook checks, the OpenFisca tests and the website tests on every push. On `main` it then builds the static site and publishes it on GitHub Pages. One-time setting in the repository: Settings → Pages → Source: **GitHub Actions**.

## Origin and credits

The childcare application was created at the Legal Hackathon 2026 (Law & Tech Entrepreneurs, University of St. Gallen) by team Ctrl+Alt+Elite: Karla Ruggaber, Benjamin Pfister, Rea Graf and Julian Böhi. Original repository with the full history, the report and the record of AI use: https://github.com/Benjam1nP/Legal_Tech_Hackathon

This repository continues that work as an in-browser version. The conversion (Pyodide engine, static build, deployment workflow) was done with Claude Code (Anthropic).

## Licence

[GNU Affero General Public License v3.0](LICENSE), as the OpenFisca country package it is based on.
