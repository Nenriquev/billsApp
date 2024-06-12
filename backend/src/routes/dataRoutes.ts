import express from 'express';
import { getData } from '../controllers/dataController';


const dataRouter = express.Router();

dataRouter.get('/', getData )


export default dataRouter;