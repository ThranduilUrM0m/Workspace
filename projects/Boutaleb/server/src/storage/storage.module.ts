import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Env } from '../env.js';
import { LocalUploadController } from './local-upload.controller.js';
import { LocalStore } from './local.store.js';
import { OBJECT_STORE } from './object-store.js';
import { S3Store } from './s3.store.js';
import { Signer } from './signer.js';

// One storage for the whole app, chosen once from the environment
// (env.ts refuses half an S3 configuration, so "S3_BUCKET set" means all set).
@Global()
@Module({
    controllers: [LocalUploadController],
    providers: [
        Signer,
        {
            provide: OBJECT_STORE,
            inject: [ConfigService, Signer],
            useFactory: (config: ConfigService<Env, true>, signer: Signer) => {
                const get = <K extends keyof Env>(k: K) => config.get(k, { infer: true }) as Env[K];
                if (get('S3_BUCKET')) {
                    return new S3Store({
                        endpoint: get('S3_ENDPOINT')!,
                        region: get('S3_REGION')!,
                        bucket: get('S3_BUCKET')!,
                        accessKeyId: get('S3_ACCESS_KEY_ID')!,
                        secretAccessKey: get('S3_SECRET_ACCESS_KEY')!,
                    });
                }
                return new LocalStore(get('STORAGE_DIR'), get('PUBLIC_API_URL'), signer);
            },
        },
    ],
    exports: [OBJECT_STORE, Signer],
})
export class StorageModule {}
