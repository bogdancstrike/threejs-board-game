import json
from pathlib import Path

CATALOGUE = json.loads((Path(__file__).parents[1] / "data" / "catalogue.json").read_text())
CHARACTERS = {character["id"]: character for character in CATALOGUE["characters"]}
MAPS = {world["id"]: world for world in CATALOGUE["maps"]}
