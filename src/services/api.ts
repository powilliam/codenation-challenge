import axios from 'axios';
import { resolve } from 'path';
import { config } from 'dotenv';

config({
    path: resolve(__dirname, '..', '..', '.env')
});

export default axios.create({
    baseURL: process.env.URL
});