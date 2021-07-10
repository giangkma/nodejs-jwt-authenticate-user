import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import swaggerUi from 'swagger-ui-express';
import authRoute from './routes/auth.routes';
import cors from 'cors';
import { isAuth } from './middlewares/auth';
import swaggerDocuments from './swagger';
import fileupload from 'express-fileupload';
import cloudinary from 'cloudinary';

dotenv.config();

cloudinary.v2.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET,
});

const app = express();
const port = process.env.PORT || 8888;

const version = 'v1';
mongoose.connect(process.env.DB_MONGOO);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(
    fileupload({
        useTempFiles: true,
    }),
);

app.use(express.static('public'));
app.set('view engine', 'ejs');

app.use(`/api/${version}/auth`, authRoute);

app.use(
    `/api/${version}/docs`,
    swaggerUi.serve,
    swaggerUi.setup(swaggerDocuments),
);

app.use(isAuth);
// app.use(`/api/${version}/report`, reportRoute);

const server = app.listen(port, () => {
    console.log(`Example app listening atss http://localhost:${port}`);
});
server.timeout = 3000;
