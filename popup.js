const apiKey = 'Your_apikey';
const baseUrl = 'https://api.opsgenie.com';

async function obtenerIncidentesAbiertosConTag(tag) {
    try {
        const query = encodeURIComponent(`status: open AND tag: "${tag}"`);
        const response = await fetch(`${baseUrl}/v1/incidents?query=${query}`, {
            headers: {
                Authorization: `GenieKey ${apiKey}`
            }
        });
        const data = await response.json();
        return data.data;
    } catch (error) {
        console.error('Error al obtener los incidentes abiertos:', error);
        return [];
    }
}

async function listarEntradasTimelineIncidente(incidentId) {
    try {
        const response = await fetch(`${baseUrl}/v2/incident-timelines/${incidentId}/entries`, {
            headers: {
                Authorization: `GenieKey ${apiKey}`
            }
        });
        return response.json();
    } catch (error) {
        console.error('Error al listar resultados:', error);
        return null;
    }
}

async function obtenerYMostrarIncidentesAbiertosConTag(tag) {
    try {
        const incidentes = await obtenerIncidentesAbiertosConTag(tag);
        const resultadosDiv = document.getElementById('resultados');

        if (incidentes.length === 0) {
            resultadosDiv.textContent = '0 ECAS Abiertos! ';
        } else {
            incidentes.forEach(async incidente => {
                const incidenteDiv = document.createElement('div');
                incidenteDiv.classList.add('incidente');
                const mensajeP = document.createElement('p');
                mensajeP.textContent = `Incidente: ${incidente.message}`;
                incidenteDiv.appendChild(mensajeP);
                const timeline = await listarEntradasTimelineIncidente(incidente.id);
                if (timeline) {
                    const eventosUl = document.createElement('ul');
                    timeline.data.entries.forEach(entry => {
                        if (entry.title.content === 'Responder alert acked') {
                            const eventoLi = document.createElement('li');
                            eventoLi.textContent = `Se contacto a: ${entry.actor.name}, Status alerta: ${entry.title.content}`;
                            eventosUl.appendChild(eventoLi);
                        }
                    });
                    incidenteDiv.appendChild(eventosUl);
                }
                resultadosDiv.appendChild(incidenteDiv);
            });
        }
    } catch (error) {
        console.error(`Error al obtener y mostrar los incidentes abiertos con la etiqueta "${tag}":`, error);
    }
}

window.onload = function() {
    obtenerYMostrarIncidentesAbiertosConTag('NOC-Incidents-Test');
};
