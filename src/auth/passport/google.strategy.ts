import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";

import { Strategy } from "passport-google-oauth20";
import { VerifiedCallback } from "passport-jwt";

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy) {
    constructor() {
        super({
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: 'http://localhost:3030/auth/google/callback',
            scope: ['email', 'profile'],
            // passReqToCallback: true,
        });
    }
    async validate(accessToken: string, refreshToken: string, profile: any, done: VerifiedCallback): Promise<any> {
        done(null, profile);
    }
}