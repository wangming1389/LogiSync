import { Injectable, PipeTransform, BadRequestException } from "@nestjs/common";
import { ZodSchema, ZodError } from "zod";

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodSchema) {}

  transform(value: unknown): unknown {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const parsed = this.schema.parse(value);
      return parsed;
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors = error.errors.map((err) => ({
          path: err.path.join("."),
          message: err.message,
          code: err.code,
        }));

        throw new BadRequestException({
          statusCode: 400,
          message: "Validation failed",
          errors: formattedErrors,
        });
      }
      throw error;
    }
  }
}
