# Rechnet im Browser (Pyodide) mit dem OpenFisca-Modell, genau wie die
# OpenFisca-Web-API: dieselbe Funktion openfisca_web_api.handlers.calculate.
import json
import sys
import types

# numexpr und psutil gibt es nicht als WebAssembly. Platzhalter:
# - psutil wird nur gelesen, wenn OpenFisca Werte auf die Festplatte
#   auslagert (standardmässig aus).
# - numexpr wertet nur Text-Eingaben wie "1 + 2" aus; mit KeyError behält
#   OpenFisca den Text, wie bei jeder Eingabe, die kein Ausdruck ist.
class _Speicher:
    percent = 0


def _kein_numexpr(ausdruck, *args, **kwargs):
    raise KeyError(ausdruck)


sys.modules["psutil"] = types.SimpleNamespace(virtual_memory=lambda: _Speicher())
sys.modules["numexpr"] = types.SimpleNamespace(evaluate=_kein_numexpr)
sys.path.insert(0, "/home/pyodide/modell")

from openfisca_core.errors import PeriodMismatchError, SituationParsingError  # noqa: E402
from openfisca_web_api.handlers import calculate as _calculate  # noqa: E402
from openfisca_ch_sg import CountryTaxBenefitSystem  # noqa: E402

SYSTEM = CountryTaxBenefitSystem()


def calculate(situation_json):
    """Wie POST /calculate: {"ok": true, "inhalt": ...} oder Fehler 400."""
    try:
        inhalt = _calculate(SYSTEM, json.loads(situation_json))
        return json.dumps({"ok": True, "inhalt": inhalt}, default=str)
    except (SituationParsingError, PeriodMismatchError) as fehler:
        return json.dumps({"ok": False, "inhalt": fehler.error}, default=str)
