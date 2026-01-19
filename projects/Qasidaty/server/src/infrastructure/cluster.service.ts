import * as cluster from 'cluster';
import * as os from 'os';
import { Injectable, OnApplicationBootstrap } from '@nestjs/common';

@Injectable()
export class ClusterService implements OnApplicationBootstrap {
  async onApplicationBootstrap() {
    if (process.env.NODE_ENV === 'production') {
      if (cluster.isPrimary) {
        const numCPUs = os.cpus().length;
        console.log(`Primary ${process.pid} is running`);
        console.log(`Forking ${numCPUs} workers...`);

        for (let i = 0; i < numCPUs; i++) {
          cluster.fork();
        }

        cluster.on('exit', (worker, code, signal) => {
          console.log(`Worker ${worker.process.pid} died. Restarting...`);
          cluster.fork();
        });
      }
    }
  }
}
