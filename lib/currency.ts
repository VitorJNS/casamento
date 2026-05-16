export function parsePriceLabelToCents(priceLabel: string) {
  const digits = priceLabel.replace(/[^\d,]/g, "").replace(/\./g, "");
  const normalized = digits.includes(",")
    ? digits.replace(",", ".")
    : `${digits}.00`;
  const value = Number(normalized);

  if (Number.isNaN(value)) {
    throw new Error(`Nao foi possivel converter o preco "${priceLabel}".`);
  }

  return Math.round(value * 100);
}

export function formatPriceCents(priceCents: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(priceCents / 100);
}
