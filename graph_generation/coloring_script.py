import xml.etree.ElementTree as ET
import hashlib

# ==========================================
# Fichiers
# ==========================================

INPUT_GEXF = "athletes_organized.gexf"
OUTPUT_GEXF = "athletes_clustered_colored.gexf"

# ==========================================
# Namespaces (IMPORTANT)
# ==========================================

GEXF_NS = "http://gexf.net/1.3"
VIZ_NS = "http://gexf.net/1.3/viz"

ET.register_namespace("", GEXF_NS)       # namespace par défaut
ET.register_namespace("viz", VIZ_NS)      # namespace viz

NS = {
    "gexf": GEXF_NS,
    "viz": VIZ_NS,
}

# ==========================================
# Hash cluster → couleur
# ==========================================

def cluster_to_color(cluster_id: str):
    h = hashlib.md5(cluster_id.encode()).hexdigest()

    r = max(int(h[0:2], 16), 60)
    g = max(int(h[2:4], 16), 60)
    b = max(int(h[4:6], 16), 60)

    return r, g, b

# ==========================================
# Chargement
# ==========================================

tree = ET.parse(INPUT_GEXF)
root = tree.getroot()

# ==========================================
# Parcours des nœuds
# ==========================================

for node in root.findall(".//gexf:node", NS):
    cluster_value = None

    for att in node.findall(".//gexf:attvalue", NS):
        if att.get("for") == "cluster":
            cluster_value = att.get("value")
            break

    if cluster_value is None:
        continue

    r, g, b = cluster_to_color(cluster_value)

    color = node.find("viz:color", NS)
    if color is None:
        color = ET.SubElement(
            node,
            f"{{{VIZ_NS}}}color"
        )

    color.set("r", str(r))
    color.set("g", str(g))
    color.set("b", str(b))

# ==========================================
# Sauvegarde
# ==========================================

tree.write(
    OUTPUT_GEXF,
    encoding="UTF-8",
    xml_declaration=True
)

print(f"✅ GEXF propre exporté : {OUTPUT_GEXF}")
