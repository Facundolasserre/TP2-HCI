import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';

// Import routes
import apiEndpoints from "./utils/endpoints";
import listRoutes from "./routes/list.routes";
import userRoutes from './routes/user.routes';
import categoriesRoutes from './routes/category.routes';
import productsRoutes from './routes/product.routes';
import listItemsRoutes from './routes/listItem.routes';
import pantriesRoutes from './routes/pantry.routes';
import pantryItemsRoutes from "./routes/pantryItem.routes";
import purchasesRoutes from "./routes/purchase.routes";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(morgan('dev'));

// Routes
app.use(apiEndpoints.USER, userRoutes);
app.use(apiEndpoints.CATEGORIES, categoriesRoutes);
app.use(apiEndpoints.PRODUCTS, productsRoutes);
app.use(apiEndpoints.LISTS, listRoutes);
app.use(apiEndpoints.LISTS, listItemsRoutes);
app.use(apiEndpoints.PANTRIES, pantriesRoutes);
app.use(apiEndpoints.PANTRIES, pantryItemsRoutes);
app.use(apiEndpoints.PURCHASES, purchasesRoutes);

export { app };
