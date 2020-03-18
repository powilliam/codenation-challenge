import sha1 from 'sha1';

export default function generateSHA1(content: string) {
    return sha1(content);
}