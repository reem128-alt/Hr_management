import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any) {
    if (err || !user) {
      if (info?.name === "TokenExpiredError") {
        throw new UnauthorizedException(
          "Token has expired. Please login again."
        );
      }
      if (info?.name === "JsonWebTokenError") {
        throw new UnauthorizedException(
          "Invalid token. Please check your token."
        );
      }
      if (info?.name === "Error" && info?.message) {
        throw new UnauthorizedException(info.message);
      }
      throw (
        err ||
        new UnauthorizedException(
          "Authentication failed. Please provide a valid token."
        )
      );
    }
    return user;
  }
}
