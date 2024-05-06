import express from 'express';
import fetch from 'node-fetch';

const app = express();
const PORT = 3000;

// Ruta para obtener los resultados de la Premier League de esta temporada
app.get('/this-season', async (req, res) => {
    try {
        const apiKey = '6dc6dddf0b7c41258a578ab4e7be4f93';
        const apiUrl = `https://api.football-data.org/v2/competitions/PL/matches?status=FINISHED`;

        const response = await fetch(apiUrl, {
            headers: {
                'X-Auth-Token': apiKey
            }
        });

        if (!response.ok) {
            throw new Error('Error al obtener los resultados de esta temporada.');
        }

        const data = await response.json();
        res.json(data.matches);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Hubo un error al obtener los resultados de esta temporada.' });
    }
});

// Ruta para obtener una lista con el ID del partido y el resultado detallado de cada partido de esta temporada
app.get('/results', async (req, res) => {
    try {
        const apiKey = '6dc6dddf0b7c41258a578ab4e7be4f93';
        const apiUrl = `https://api.football-data.org/v2/competitions/PL/matches?status=FINISHED`;

        // Verificar si se proporcionaron parámetros de fecha en la consulta
        const { startDate, endDate } = req.query;

        if (!startDate || !endDate) {
            return res.status(400).json({ error: 'Se requieren los parámetros startDate y endDate.' });
        }

        const response = await fetch(apiUrl, {
            headers: {
                'X-Auth-Token': apiKey
            }
        });

        if (!response.ok) {
            throw new Error('Error al obtener los resultados.');
        }

        const data = await response.json();

        // Filtrar los resultados por fecha
        const filteredResults = data.matches.filter(match => {
            const matchDate = new Date(match.utcDate);
            return matchDate >= new Date(startDate) && matchDate <= new Date(endDate);
        });

        const results = filteredResults.map(match => {
            const homeTeamGoals = match.score.fullTime.homeTeam;
            const awayTeamGoals = match.score.fullTime.awayTeam;
            const homeTeamName = match.homeTeam.name;
            const awayTeamName = match.awayTeam.name;
            const resultString = `${homeTeamName} ${homeTeamGoals} - ${awayTeamGoals} ${awayTeamName}`;
            let result = '';

            if (match.score.winner === 'HOME_TEAM') {
                result = `Resultado: Ganador ${homeTeamName}`;
            } else if (match.score.winner === 'AWAY_TEAM') {
                result = `Resultado: Ganador ${awayTeamName}`;
            } else {
                result = 'Resultado: Empate';
            }

            return {
                id: match.id,
                result: `${resultString}. ${result}`
            };
        });

        res.json(results);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Hubo un error al obtener los resultados.' });
    }
});

// Ruta para obtener información de un partido por su ID
app.get('/match/:matchId', async (req, res) => {
    const { matchId } = req.params;
    const apiKey = '6dc6dddf0b7c41258a578ab4e7be4f93';
    const apiUrl = `https://api.football-data.org/v2/matches/${matchId}`;

    try {
        const response = await fetch(apiUrl, {
            headers: {
                'X-Auth-Token': apiKey
            }
        });

        if (!response.ok) {
            throw new Error('Error al obtener el partido.');
        }

        const matchData = await response.json();
        res.json(matchData);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Hubo un error al obtener el partido.' });
    }
});
app.get('/team-results', async (req, res) => {
    try {
        const apiKey = '6dc6dddf0b7c41258a578ab4e7be4f93';
        const apiUrl = `https://api.football-data.org/v2/competitions/PL/matches?status=FINISHED`;

        // Obtener el nombre del equipo desde la consulta
        const { teamName } = req.query;

        if (!teamName) {
            return res.status(400).json({ error: 'Se requiere el parámetro teamName.' });
        }

        const response = await fetch(apiUrl, {
            headers: {
                'X-Auth-Token': apiKey
            }
        });

        if (!response.ok) {
            throw new Error('Error al obtener los resultados.');
        }

        const data = await response.json();

        // Filtrar los resultados por nombre de equipo
        const filteredResults = data.matches.filter(match => {
            return match.homeTeam.name.toLowerCase() === teamName.toLowerCase() ||
                   match.awayTeam.name.toLowerCase() === teamName.toLowerCase();
        });

        // Devolver los resultados filtrados
        res.json(filteredResults);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Hubo un error al obtener los resultados filtrados por equipo.' });
    }
});

app.get('/equipos', async (req, res) => {
    try {
        const apiKey = '6dc6dddf0b7c41258a578ab4e7be4f93';
        const apiUrl = 'https://api.football-data.org/v2/competitions/PL/matches?status=FINISHED';

        // Realizar la solicitud a la API para obtener todos los partidos de la temporada actual
        const response = await fetch(apiUrl, {
            headers: {
                'X-Auth-Token': apiKey
            }
        });

        if (!response.ok) {
            throw new Error('Error al obtener los resultados de esta temporada.');
        }

        const data = await response.json();

        // Crear un conjunto para almacenar los nombres de los equipos únicos
        const equiposUnicos = new Set();

        // Recorrer todos los partidos y agregar los nombres de los equipos al conjunto
        data.matches.forEach(match => {
            equiposUnicos.add(match.homeTeam.name);
            equiposUnicos.add(match.awayTeam.name);
        });

        // Convertir el conjunto a una lista para devolver como respuesta
        const equiposLista = Array.from(equiposUnicos);

        res.json({ equipos: equiposLista });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Hubo un error al obtener los equipos.' });
    }
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`API corriendo en http://localhost:${PORT}`);
});
