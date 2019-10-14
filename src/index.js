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

async function Start() {
    console.log('Starting Challenge!');

    const answerPath = path.resolve(__dirname, '..', 'private', 'answer.json');
    const responseJSON = await getChallenge();

    const { numero_casas, token, cifrado, decifrado, resumo_criptografico } = responseJSON;
    const convertedResponse = JSON.stringify(responseJSON)

    await writeChallenge(answerPath, convertedResponse);

    const decrypted = decryptChallenge(cifrado, 6);
    const hash = generateSHA1(decrypted);

    const content = {
        numero_casas,
        token,
        cifrado,
        decifrado: decrypted,
        resumo_criptografico: hash,
    }

    await updateChallenge(answerPath, JSON.stringify(content));
    await sendChallenge(answerPath);
}

const getChallenge = async () => {
    try {
        const response = await api.get(`/generate-data?token=${process.env.TOKEN}`)
        const { data } = response;

        console.log('API GET STATUS CODE: 200 \n');
        return data;
    } catch (error) {
        console.log(error)
    }
}

const writeChallenge = async (path, content) => {
    console.log('Creating answer.json...')
    try {
        fs.writeFileSync(path, content);
        console.log('answer.json created! \n');
    } catch (error) {
        console.log('Error when trying to create answer.json')
    }
}

const decryptChallenge = (content, houses) => {
    let buildString = Caesar.Decipher(houses).crypt(content);
    
    console.log('Trying to discover what is that...')
    console.log(`The message is: ${buildString} \n`);

    return buildString;
}

const generateSHA1 = (content) => {
    console.log('Generating a SHA1 HASH...')
    try {
        const hash = sha1(content);
        console.log(`The hash is: ${hash}\n`);
        return hash
    } catch (error) {
        console.log('Cannot create a hash');
    }
}

const updateChallenge = async (path, content) => {
    console.log('Updating answer.json...');
    try {
        fs.writeFileSync(path, content);
        console.log('Update successfull \n');
    } catch (error) {
        console.log('Error when trying to overwrite answer.json \n\n')
    }
}

const sendChallenge = async (path) => {
    console.log('Uploading challenge...')
    const data = new FormData();
    data.append('answer', fs.createReadStream(path))

    try {
        const response = await api.post(
            `/submit-solution?token=${process.env.TOKEN}`, data, {
                headers: { 'content-type': `multipart/form-data; boundary=${data._boundary}` },    
            }
        );
        const { score } = response.data;

        console.log(`Your score is: ${score}`);
        console.log('Done!');
    } catch (error) {
        console.log(error)
    }
}

Start();