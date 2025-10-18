import express from "express";
import bodyParser from "body-parser";
import { connectDB } from "./config/db.js";
import router from "./router.js";

const app = express();
app.use(bodyParser.json());

connectDB();

app.use("/", router);

const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
