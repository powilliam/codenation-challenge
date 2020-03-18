import path from 'path';
import Challenge from './services/challenge';
import generateSHA1 from './utils/generateSHA1';

const answerPath = path.resolve(__dirname, 'private', 'answer.json');

async function StartChallenge() {
    process.stdout.write('Starting the Challenge!\n');
    const responseJSON = await Challenge.getChallenge();

    const { numero_casas, token, cifrado } = responseJSON;

    const decrypted = Challenge.decryptChallenge(cifrado, 6);
    const hash = generateSHA1(decrypted);

    const convertedRequest = JSON.stringify({
        numero_casas,
        token,
        cifrado,
        decifrado: decrypted,
        resumo_criptografico: hash,
    });

    Challenge.writeChallenge(answerPath, convertedRequest);
    
    const score = await Challenge.sendChallenge(answerPath);

    console.log(`Your score is: ${score}`);
}

StartChallenge();