import https from 'node:https';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequestListener } from '@react-router/node';

// Déterminer __dirname dans un module ES
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3000;
const BUILD_PATH = path.resolve(__dirname, 'build/server/index.js');

// IMPORTANT : Remplacez les noms de fichiers ci-dessous par les noms réels de vos fichiers de certificat
const keyPath = '/keys/privkey.pem';
const certPath = '/keys/fullchain.pem';
// Optionnel : si vous avez un fichier de chaîne CA (bundle)
// const caPath = '/keys/votre_chaine_ca.pem';

if (!fs.existsSync(keyPath) || !fs.existsSync(certPath)) {
  console.error('Erreur : Fichiers de certificat SSL manquants.');
  console.error(`Assurez-vous que '${keyPath}' et '${certPath}' existent.`);
  process.exit(1);
}

const options = {
  key: fs.readFileSync(keyPath),
  cert: fs.readFileSync(certPath),
  // ca: caPath ? fs.readFileSync(caPath) : undefined, // Décommentez si vous avez un fichier CA
};

const requestHandler = createRequestListener({ build: await import(BUILD_PATH) });

const server = https.createServer(options, requestHandler);

server.listen(PORT, () => {
  console.log(`Serveur HTTPS de l'application démarré sur https://localhost:${PORT}`);
});
