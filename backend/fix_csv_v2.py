"""
Script pour nettoyer le CSV v2 et supprimer les triple-guillemets
"""

import re

# Lire le fichier
with open('data_clustered_v2.csv', 'r', encoding='utf-8') as f:
    content = f.read()

# Remplacer les triple-guillemets par rien
# """USA""" devient USA
content = re.sub(r'"""([^"]*)"""', r'\1', content)

# Sauvegarder
with open('data_clustered_v2.csv', 'w', encoding='utf-8') as f:
    f.write(content)

print("[OK] CSV nettoyé - Triple-guillemets supprimés")
