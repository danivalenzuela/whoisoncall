const apiKey = 'Your_api_key_opsgenie'; // Reemplaza con tu propia clave API
const baseUrl = 'https://api.opsgenie.com';
const tagIncidente = 'Your_filter_tagsIncident_opsgenie';

let entradasAnteriores = []; 

async function obtenerIncidentesAbiertosConTag(tag) {
    try {
        const query = encodeURIComponent(`status: open AND tag: "NOC-Incidents"`);
        const response = await fetch(`${baseUrl}/v1/incidents?query=${query}`, {
            headers: {
                Authorization: `GenieKey ${apiKey}`
            }
        });

        const data = await response.json();
        return data.data; // Retorna los datos de los incidentes
    } catch (error) {
        console.error('Error al obtener los incidentes abiertos:', error);
        return []; // Retorna un array vacío en caso de error
    }
}

async function listarEntradasTimelineIncidente(incidentId) {
    try {
        const response = await fetch(`${baseUrl}/v2/incident-timelines/${incidentId}/entries`, {
            headers: {
                Authorization: `GenieKey ${apiKey}`
            },
            
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
            const noResultsP = document.createElement('p');
            noResultsP.textContent = '0 ECAS Abiertos! '; 
            resultadosDiv.appendChild(noResultsP);
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
                            // Verificar si la entrada es nueva
                            if (!entradasAnteriores.includes(entry.id)) {
                                const eventoLi = document.createElement('li');
                                eventoLi.textContent = `Se contacto a: ${entry.actor.name}, Status alerta: ${entry.title.content}`;
                                eventosUl.appendChild(eventoLi);
                                entradasAnteriores.push(entry.id); 
                            }
                        }
                    });
                    incidenteDiv.appendChild(eventosUl);
                }
                resultadosDiv.appendChild(incidenteDiv);
            });
        }
    } catch (error) {
        console.error(`Error al obtener resultados`, error);
    }
}

window.onload = function() {
    obtenerYMostrarIncidentesAbiertosConTag(tagIncidente);
};
