import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
export declare class RolesGuard implements CanActivate {
    private reflactor;
    constructor(reflactor: Reflector);
    canActivate(context: ExecutionContext): boolean;
}
