import 'dotenv/config.js';
import jwt from 'jsonwebtoken';

export const verifyToken = async (req, res) => {
    try {
        const authHeader = req.headers['authorization'];
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).send({
                error: {
                    code: 'missingAccessToken',
                    message: 'Access token required',
                }
            });
        }

        const token = authHeader.split(' ')[1];
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        req.user = decodedToken;
        return true;
    } catch (error) {
        return res.status(403).send({message: 'Invalid or expired token'});
    }
}
