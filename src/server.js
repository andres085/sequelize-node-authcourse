import './config';

import Database from './database';
import environment from './config/environment';
import dbConfig from './config/database';

(async () => { 
    try {
        const db = new Database(environment.nodeEnv, dbConfig);
        await db.connect();
    } catch (error) {
        console.error('Something went wrong when initializing the app:\n', error.stack)
    }
 })();