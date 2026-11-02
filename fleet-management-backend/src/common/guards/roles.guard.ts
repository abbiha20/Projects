import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

type Role = 'admin' | 'owner' | 'manager' | 'member';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) {
      return true;
    }
    const { user } = context.switchToHttp().getRequest();

    if (!user || !user.role) {
      return false;
    }

    // Define role hierarchy
    const roleHierarchy: { [key in Role]: number } = {
      admin: 4,
      owner: 3,
      manager: 2,
      member: 1,
    };

    // Check if the user's role is sufficient
    const userRoleLevel = roleHierarchy[user.role as Role] || 0;
    return requiredRoles.some((role) => userRoleLevel >= roleHierarchy[role]);
  }
}
