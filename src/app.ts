import express, { Application } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';

const app: Application = express();

//Database
import { connectDB } from './database';
connectDB();

//Setting
dotenv.config();
app.set('port', process.env.PORT || 3000);

//Middlewares
app.use(cors());
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

//Routes
import UserRouter from './Routes/UserRouter';
app.use(UserRouter);

//Export this module
export default app;
