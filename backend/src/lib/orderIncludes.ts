/** Include compartido para listados y detalle de pedidos (admin y super admin). */
export const orderIncludes = {
  items: { include: { product: { include: { images: { take: 1 } } }, variant: true } },
  user: { select: { id: true, name: true, email: true } },
} as const;
