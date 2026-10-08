import { Module } from '@nestjs/common';
import { MensajeriaModule } from '../mensajeria.module.js';
import { AuditoriaConsumidor } from './auditoria.consumidor.js';
import { PersistenciaModule } from '../../persistencia/persistencia.module.js';
@Module({
  imports: [MensajeriaModule, PersistenciaModule],
  providers: [AuditoriaConsumidor],
})
export class AuditoriaModule {}