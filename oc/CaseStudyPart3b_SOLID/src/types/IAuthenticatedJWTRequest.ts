import express from "express";
import { Role } from "../entity/Role";

export interface IAuthenticatedJWTRequest extends express.Request {
    signedInUser?: {
        email?: string;
        role?: Role;
    };
}