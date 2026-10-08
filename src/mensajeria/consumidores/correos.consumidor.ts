import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { ConsumeMessage } from 'amqplib';
import { Repository } from 'typeorm';
import { MensajeriaService } from '../mensajeria.service.js';
import { COLAS } from '../topologia.js';
import { Notificacion } from '../../persistencia/notificacion.entity.js';
import {
  conReintentos,
  detalle,
  MensajeInvalido,
  REINTENTOS,
} from '../reintentos.js';

@Injectable()
export class CorreosConsumidor implements OnModuleInit {
  private readonly log = new Logger(CorreosConsumidor.name);

  constructor(
    private readonly mensajeria: MensajeriaService,
    @InjectRepository(Notificacion)
    private readonly notificaciones: Repository<Notificacion>,
  ) {}

  async onModuleInit(): Promise<void> {
    const canal = this.mensajeria.canal;

    await canal.consume(
      COLAS.correos,
      async (mensaje: ConsumeMessage | null) => {
        if (!mensaje) return;

        try {
          const comando = JSON.parse(
            mensaje.content.toString(),
          ) as Record<string, unknown>;

          const para = comando.para;
          const asunto = comando.asunto;
          const eventoId = comando.eventoId;
          const origen = comando.origen;

          if (typeof para !== 'string' || para === '') {
            throw new MensajeInvalido(
              'el comando correo.enviar no trae para como string',
            );
          }

          if (typeof asunto !== 'string' || asunto === '') {
            throw new MensajeInvalido(
              'el comando correo.enviar no trae asunto como string',
            );
          }

          if (typeof eventoId !== 'string' || eventoId === '') {
            throw new MensajeInvalido(
              'el comando correo.enviar no trae eventoId como string',
            );
          }

          await conReintentos(
            async () => {
              await this.notificaciones.insert({
                para,
                asunto,
                estado: 'enviada',
                eventoId,
              });

              this.log.log(
                `enviando correo a ${para}: "${asunto}" (origen ${String(origen)})`,
              );
            },
            (intento, error) => {
              this.log.warn(
                `intento ${intento} de ${REINTENTOS.maximo} fallido para ${eventoId}: ${detalle(error)}`,
              );
            },
          );

          canal.ack(mensaje);
        } catch (error) {
          canal.nack(mensaje, false, false);

          const detalleError = detalle(error);
          this.log.error(
            `rechazado hacia la DLQ: ${detalleError}`,
          );
        }
      },
      { noAck: false },
    );

    this.log.log(`escuchando la cola ${COLAS.correos}`);
  }
}