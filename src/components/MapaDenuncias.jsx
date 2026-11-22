import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { STATUS } from "../config/status";

// mesmo centro e mesmo mapa (OpenStreetMap) do site de denúncia
const CENTRO_IBITITA = [-11.5444, -41.9717];

// o popup é montado com textContent: bairro e endereço são digitados pelo cidadão
function montarPopup(p) {
  const raiz = document.createElement("div");
  const linhas = [
    [p.protocolo, true],
    [p.categoria, false],
    [[p.endereco, p.bairro].filter(Boolean).join(" - "), false],
    [p.status, false],
  ];
  linhas.forEach(([texto, negrito]) => {
    const el = document.createElement(negrito ? "strong" : "div");
    el.textContent = texto;
    raiz.appendChild(el);
  });
  return raiz;
}

export default function MapaDenuncias({ pontos }) {
  const canvasRef = useRef(null);
  const mapRef = useRef(null);
  const camadaRef = useRef(null);

  useEffect(() => {
    const map = L.map(canvasRef.current).setView(CENTRO_IBITITA, 14);
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "© OpenStreetMap",
    }).addTo(map);
    camadaRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      camadaRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const camada = camadaRef.current;
    if (!map || !camada) return;

    camada.clearLayers();
    const coordenadas = [];
    pontos.forEach((p) => {
      const posicao = [Number(p.latitude), Number(p.longitude)];
      L.circleMarker(posicao, {
        radius: 8,
        color: "#fff",
        weight: 2,
        fillColor: STATUS[p.statusCodigo]?.cor ?? "#6b7770",
        fillOpacity: 1,
      })
        .bindPopup(montarPopup(p))
        .addTo(camada);
      coordenadas.push(posicao);
    });

    if (coordenadas.length) {
      map.fitBounds(coordenadas, { padding: [30, 30], maxZoom: 16 });
    } else {
      map.setView(CENTRO_IBITITA, 14);
    }
  }, [pontos]);

  return <div className="pn-mapa" ref={canvasRef} />;
}