ALTER TABLE contratos ADD COLUMN dias_gracia_pago INTEGER;

UPDATE contratos
SET dias_gracia_pago = GREATEST((fecha_limite_pago - fecha_proximo_vencimiento)::int, 0)
WHERE fecha_limite_pago IS NOT NULL;

ALTER TABLE contratos DROP COLUMN fecha_limite_pago;
