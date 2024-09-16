import { Controller, Patch } from "@nestjs/common";
import { AppService } from "./app.service";

@Controller("users")
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Patch()
  async getUserWithProblemsAndFix(): Promise<number> {
    return this.appService.getUserWithProblemsAndFix();
  }
}
