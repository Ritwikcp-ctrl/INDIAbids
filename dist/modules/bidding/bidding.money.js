export function paiseToInr(paise) {
    const rupees = paise / 100n;
    const remainder = (paise % 100n).toString().padStart(2, "0");
    return `${rupees}.${remainder}`;
}
