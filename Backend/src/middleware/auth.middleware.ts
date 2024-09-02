import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import axios from 'axios';
import jwkToPem from 'jwk-to-pem';  // Converts JWK to PEM format
import { ApiError } from '../utils/ApiError'; // Custom error handler (optional)

// Custom Request type to include user property
export interface AuthRequest extends Request {
    user?: JwtPayload | string; // Adjust the type according to your needs
}

// Middleware to verify JWT
export const verifyJWT = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        // Get the token from the Authorization header
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            throw new ApiError(401, 'Unauthorized request: No token provided');
        }

        // Fetch the Keycloak public key
        const keycloakUrl = process.env.KEYCLOAK_URL
        const realm = process.env.KEYCLOAK_REALM
        const certsUrl = `${keycloakUrl}/realms/${realm}/protocol/openid-connect/certs`

        const response = await axios.get(certsUrl);
        const jwks = response.data.keys;

        // Find the key that matches the JWT header's "kid" (key ID)
        const decodedHeader = jwt.decode(token, { complete: true });
        if (!decodedHeader || typeof decodedHeader === 'string' || !decodedHeader.header.kid) {
            throw new ApiError(401, 'Invalid token: No kid found');
        }

        const signingKey = jwks.find((key: any) => key.kid === decodedHeader.header.kid);

        if (!signingKey) {
            throw new ApiError(401, 'Invalid token: No matching key found');
        }

        // Convert the JWK to PEM format
        const publicKey = jwkToPem(signingKey);

        // Verify the token using the public key
        const decodedToken = jwt.verify(token, publicKey, { algorithms: ['RS256'] }) as JwtPayload;

        // Attach user info to the request object
        req.user = decodedToken;

        next(); // Pass control to the next middleware or route handler
    } catch (error: any) {
        next(new ApiError(401, error?.message || 'Unauthorized request'));
    }
};
