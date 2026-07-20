ALTER TABLE contratos ADD COLUMN fecha_limite_pago DATE;

ALTER TYPE momento_notificacion_enum ADD VALUE '30_dias_antes';
ALTER TYPE momento_notificacion_enum ADD VALUE '15_dias_antes';
ALTER TYPE momento_notificacion_enum ADD VALUE '10_dias_antes';
ALTER TYPE momento_notificacion_enum ADD VALUE '5_dias_antes';
ALTER TYPE momento_notificacion_enum ADD VALUE '1_dia_antes';
