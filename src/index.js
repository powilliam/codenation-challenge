require('dotenv').config();

const axios = require('axios').default;
const path = require('path');
const fs = require('fs');
const sha1 = require('sha1');
const FormData = require('form-data');

const Caesar = require('caesar-salad').Caesar;

const api = axios.create({
    baseURL: process.env.URL
});

const answerPath = path.resolve(__dirname, '..', 'private', 'answer.json');

async function Start() {
    process.stdout.write('Starting Challenge!\n');
    const responseJSON = await getChallenge();

    const { numero_casas, token, cifrado, decifrado, resumo_criptografico } = responseJSON;

    const convertedResponse = convertToString(responseJSON);
    await writeChallenge(answerPath, convertedResponse);

    const decrypted = decryptChallenge(cifrado, 6);
    const hash = generateSHA1(decrypted);

    const convertedRequest = convertToString({
        numero_casas,
        token,
        cifrado,
        decifrado: decrypted,
        resumo_criptografico: hash,
    });

    await updateChallenge(answerPath, convertedRequest);
    await sendChallenge(answerPath);
}

const convertToString = (string) => {
    return JSON.stringify(string);
}

const getChallenge = async () => {
    try {
        const response = await api.get(`/generate-data?token=${process.env.TOKEN}`)
        const { status, data } = response;

        console.log(`Request STATUS: ${status}`);

        if (status == 200) {
            process.stdout.write('Success!\n');
        }

        return data;
    } catch (error) {
        console.err(error);
    }
}

const writeChallenge = async (path, content) => {
    process.stdout.write('Creating answer.json...\n')
    try {
        fs.writeFileSync(path, content);
        process.stdout.write('answer.json created!\n\n');
    } catch (error) {
        console.err('Error when trying to create answer.json \n')
    }
}

const decryptChallenge = (content, houses) => {
    let deciphred = Caesar.Decipher(houses).crypt(content);
    
    process.stdout.write('Trying to discover what is that...\n')
    console.log(`The message is: "${deciphred}" \n`);

    return deciphred;
}

const generateSHA1 = (content) => {
    process.stdout.write('Generating a SHA1 HASH...\n')
    try {
        const hash = sha1(content);
        console.log(`The hash is: ${hash}\n`);
        return hash
    } catch (error) {
        console.err('Cannot create a hash\n');
    }
}

const updateChallenge = async (path, content) => {
    process.stdout.write('Updating answer.json...\n');
    try {
        fs.writeFileSync(path, content);
        console.log('Update successfull \n');
    } catch (error) {
        console.err('Error when trying to overwrite answer.json \n')
    }
}

const sendChallenge = async (path) => {
    process.stdout.write('Uploading challenge...\n')

    const data = new FormData();
    data.append('answer', fs.createReadStream(path))

    try {
        const response = await api.post(
            `/submit-solution?token=${process.env.TOKEN}`, data, {
                headers: { 'content-type': `multipart/form-data; boundary=${data._boundary}` },    
            }
        );
        const { score } = response.data;

        console.log(`Your score is: ${score}\n`);
        process.stout.write('Done!');
    } catch (error) {
        console.log(error)
    }
}

Start();