import Big from "big.js";
import type { Invoice } from "@prisma/client";
import { z } from "zod";

export function calculateGSTAmounts(amt: number, isIntra: boolean) {
    const cgstOrSgst = Big(amt).mul(0.09).round(2).toNumber();
    const igst = Big(amt).mul(0.18).round(2).toNumber();
    const total = Big(amt).add(isIntra ? Big(cgstOrSgst).add(cgstOrSgst) : igst).round(2).toNumber();
    const netTotal = Big(amt).mul(0.95).round(2).add(isIntra ? Big(cgstOrSgst).add(cgstOrSgst) : igst).round(2).toNumber();
    const netTotalWithoutGST = Big(amt).mul(0.95).round(2).toNumber();

    const totalGSTIntra = Big(cgstOrSgst).add(cgstOrSgst).round(2).toNumber()
    const totalGSTInter = igst;

    return { cgstOrSgst, igst, total, totalGST: isIntra ? totalGSTIntra : totalGSTInter, netTotal, netTotalWithoutGST };
}

export function calculateReverseChargeAmounts(amt: number, isIntra: boolean) {
    const cgstOrSgst = Big(amt).mul(0.05).mul(0.5).round(2).toNumber();
    const igst = Big(amt).mul(0.05).round(2).toNumber();
    const total = Big(amt).add(isIntra ? Big(cgstOrSgst).add(cgstOrSgst) : igst).round(2).toNumber();
    const netTotal = Big(amt).mul(0.95).round(2).toNumber();
    const netTotalWithoutGST = netTotal;

    const totalGSTIntra = Big(cgstOrSgst).add(cgstOrSgst).round(2).toNumber()
    const totalGSTInter = igst;

    return { cgstOrSgst, igst, total, totalGST: isIntra ? totalGSTIntra : totalGSTInter, netTotal, netTotalWithoutGST };
}

export function dateOlderThanDays(date: Date, days: number): boolean {
    return (
        new Date().getTime() - date.getTime() > days * 24 * 60 * 60 * 1000
    );
}

export function shouldAllowStatusChange(invoice: Invoice) {
    switch (invoice.status) {
        case "CancelledIRN":
            if (dateOlderThanDays(invoice.lastStatusUpdate, 1)) return false;
        case "Paid":
            if (dateOlderThanDays(invoice.lastStatusUpdate, 2)) return false;
        default:
            return true;
    }
}

export function zodFileSchema() {
    return z.custom<File>((val) => {
        return val instanceof File && val.size > 0
    }, "Invalid File Data");
}