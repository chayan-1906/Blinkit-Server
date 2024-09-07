import 'dotenv/config';
import Fastify from "fastify";
import {connectDB} from "./src/config/connect.js";

const start = async () => {
    await connectDB(process.env.MONGO_URI);
    const app = Fastify();
    const port = process.env.PORT || 4000;
    app.listen({port, host: '0.0.0.0'},
        (err, address) => {
            if (err) {
                console.log(err);
            } else {
                console.log(`Blinkit started on http://localhost:${port}`);
            }
        });
}

start();
