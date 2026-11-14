import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CLIENT, ClientSchema } from '../clients/client.schema.js';
import { ClientsModule } from '../clients/clients.module.js';
import { ENQUIRY, EnquirySchema } from '../enquiries/enquiry.schema.js';
import { DEAL, DealSchema } from './deal.schema.js';
import { DealsController } from './deals.controller.js';
import { DealsService } from './deals.service.js';

// Deals (T8.2). Exports the service so Enquiries can turn a new public
// enquiry into a lead without knowing how a deal is stored.
@Module({
    imports: [
        ClientsModule,
        MongooseModule.forFeature([
            { name: DEAL, schema: DealSchema },
            { name: CLIENT, schema: ClientSchema },
            { name: ENQUIRY, schema: EnquirySchema },
        ]),
    ],
    controllers: [DealsController],
    providers: [DealsService],
    exports: [DealsService],
})
export class DealsModule {}
