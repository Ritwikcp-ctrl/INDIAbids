export function formatInr(amountInRupees: number | string): string {
  const num = typeof amountInRupees === "string" ? parseFloat(amountInRupees) : amountInRupees;
  if (isNaN(num)) return "₹0";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(num);
}

export function paiseToInr(paise: string | bigint | number): string {
  const num = Number(paise) / 100;
  return formatInr(num);
}
