import { Module } from "@nestjs/common";
import { SecurityService } from "./security.service";
import { RbacGuard } from "./rbac.guard";

@Module({
  providers: [SecurityService, RbacGuard],
  exports: [SecurityService, RbacGuard],
})
export class SecurityModule {}
