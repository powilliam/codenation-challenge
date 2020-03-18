import fs from 'fs';
import { resolve } from 'path';
import { config } from 'dotenv';
import { Caesar } from 'caesar-salad';
import FormData from 'form-data';

import { ChallengeMethods, IChallenge } from '../types/challenge';

import api from './api';

config({
    path: resolve(__dirname, '..', '..', '.env')
})

export default new class Challenge implements ChallengeMethods {
    async getChallenge() {
        const { data } = await api.get<IChallenge>(`/generate-data?token=${process.env.TOKEN}`)
        return data
    }

    writeChallenge(path: string, content: string) {
        fs.writeFileSync(path, content);
    }

    decryptChallenge(content: string, houses: number) {
        const deciphred: string = Caesar.Decipher(houses).crypt(content);

        return deciphred;
    }

    async sendChallenge(path: string) {
        const data = new FormData();
        data.append('answer', fs.createReadStream(path))

        const response = await api.post(
            `/submit-solution?token=${process.env.TOKEN}`, data, {
                headers: { 'content-type': `multipart/form-data; boundary=${data._boundary}` },    
            }
        );
        const { score } = response.data;

        return score
    }

}