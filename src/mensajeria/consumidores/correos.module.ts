import { Module } from '@nestjs/common';
import { MensajeriaModule } from '../mensajeria.module.js';
import { CorreosConsumidor } from './correos.consumidor.js';
import { PersistenciaModule } from '../../persistencia/persistencia.module.js';
@Module({
  imports: [MensajeriaModule, PersistenciaModule],
  providers: [CorreosConsumidor],
})
export class CorreosModule {}