
import express from 'express';
import './db/connection.js'
import authRouter from './routes/auth.js';
import contentRouter from './routes/content.js';
import brainRouter from './routes/brain.js';

const app = express();

app.use(express.json());
app.use('/api/v1',authRouter);
app.use('/api/v1',contentRouter);
app.use('/api/v1',brainRouter);


app.use(express.urlencoded({ extended: true }));

function cb():void{
    console.log('Listening on 3000')
}
app.listen(3000,cb);
