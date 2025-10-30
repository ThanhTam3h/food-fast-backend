import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY, PERMISSIONS_KEY } from '../decorators/roles.decorator';
import { Role, Permission, UserRole } from 'src/models';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Lấy roles & permissions yêu cầu từ decorator
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    // Nếu không yêu cầu role nào → cho phép qua
    if (!requiredRoles && !requiredPermissions) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user; // từ JwtStrategy.validate()

    if (!user?.id) throw new ForbiddenException('User not found in request');

    // 🔹 Lấy role + permission từ DB
    const userRoles = await UserRole.findAll({
      where: { userId: user.id },
      include: [
        {
          model: Role,
          include: [Permission],
        },
      ],
    });

    // 🔹 Tổng hợp tất cả role và permission của user
    const userRoleNames = userRoles.map((ur) => ur.role.name);
    const userPermissions = userRoles.flatMap((ur) =>
      ur.role.permissions.map((p) => p.name),
    );

    // 🔹 Kiểm tra role
    if (
      requiredRoles &&
      !requiredRoles.some((role) => userRoleNames.includes(role))
    ) {
      throw new ForbiddenException('You do not have the required role');
    }

    // 🔹 Kiểm tra permission
    if (
      requiredPermissions &&
      !requiredPermissions.some((perm) => userPermissions.includes(perm))
    ) {
      throw new ForbiddenException('You do not have the required permission');
    }

    return true;
  }
}
