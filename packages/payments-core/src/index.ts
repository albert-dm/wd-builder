import { z } from "zod";

export const PaymentGatewaySchema = z.enum(["abacatepay", "manual", "sandbox"]);
export const PixPaymentStatusSchema = z.enum([
  "pending",
  "paid",
  "expired",
  "cancelled",
  "refunded",
]);

export const PixPaymentSchema = z.object({
  id: z.string().uuid().or(z.string().min(1)),
  gateway: PaymentGatewaySchema,
  externalPaymentId: z.string().min(1),
  amountCents: z.number().int().positive(),
  itemQuantity: z.number().int().positive(),
  status: PixPaymentStatusSchema,
  pixCode: z.string().min(1),
  qrCodeBase64: z.string().min(1),
  expiresAt: z.string().datetime(),
  paidAt: z.string().datetime().optional(),
  creditedAt: z.string().datetime().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type PixPayment = z.infer<typeof PixPaymentSchema>;
