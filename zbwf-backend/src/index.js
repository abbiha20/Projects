import { initializeDatabase } from './db/database.js';
import { app } from './app.js';


initializeDatabase()
    .then(() => {
        app.listen(8000, () => {
            console.log('Running on port 8000');
        });
    })
    .catch((err) => {
        console.log(err);
    });
