import * as dotenv from 'dotenv'
import express from 'express';
import cors from 'cors'
import helmet from 'helmet'
import { credentials, MembresRouter, PredRouter, SermonRouter } from './routes';
import path from 'path';

//App Varaibles 
dotenv.config()

//intializing the express app 
const app = express();

//using the dependancies
app.use(helmet());
app.use(cors());
app.use(express.json())
app.use('/src/images', express.static(path.join(__dirname, 'images')));
// app.use(bodyParser.urlencoded({ extended: false }))
// // parse application/json
// app.use(bodyParser.json())

app.use('/api/membres', MembresRouter)
app.use('/api/sermons', SermonRouter)
app.use('/api/predicateurs', PredRouter)
app.use('/api/credentials', credentials)



//exporting app
module.exports = app