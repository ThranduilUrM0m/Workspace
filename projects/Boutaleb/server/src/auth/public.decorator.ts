import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC = 'isPublic';

// Every route needs a signed-in Clerk session unless marked with this.
export const Public = () => SetMetadata(IS_PUBLIC, true);
