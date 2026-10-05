export function paiseToInr(paise:bigint,

):string {
    const rupees = paise/100n;

    const remainder = (paise%100n).toString().padStart(2,"0");

    return `${rupees}.${remainder}`;
}