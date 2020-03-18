export interface IChallenge {
    numero_casas: string;
    token: string;
    cifrado: string;
    decifrado: string;
    resumo_criptografico: string;
}

export interface ChallengeMethods {
    getChallenge: () => Promise<IChallenge>;
    writeChallenge: (path: string, content: string) => void;
    decryptChallenge: (text: string, houses: number) => string;
    sendChallenge: (path: string) => Promise<number>;
}