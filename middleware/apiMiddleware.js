import jwt from "jsonwebtoken";

export const apiKeyAuth = (req, res, next) => {
  const apiKey = req.header('api-key');

  if (!apiKey || apiKey !== process.env.APP_KEY) {
    return res.status(401).send( 'Unauthorized. API key invalid.' );
  }

  next();
};