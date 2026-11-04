import { BadRequestException, type PipeTransform } from '@nestjs/common';
import type { ZodType } from 'zod';

// Validates a body or query against a shared @repo/schemas contract and
// hands the parsed value on. Hand-rolled on purpose: one pipe, used per
// route; nestjs-zod would add DTO classes and its own conventions for
// what this does in a dozen lines.
//
// The 400 carries field codes, not sentences, so each screen words them in
// its own language: { error: 'invalid', fields: { name: 'required' } }.
export class ZodPipe<T> implements PipeTransform<unknown, T> {
    constructor(private readonly schema: ZodType<T>) {}

    transform(value: unknown): T {
        const r = this.schema.safeParse(value);
        if (r.success) return r.data;
        const fields: Record<string, string> = {};
        for (const issue of r.error.issues) {
            const key = issue.path.join('.') || '_';
            fields[key] ??= issue.message;
        }
        throw new BadRequestException({ error: 'invalid', fields });
    }
}
