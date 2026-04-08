import { fetchHelper } from "../../../shared/utils/apiHelpers";


export const apigetVisualizationStats = async (): Promise<{ avg_risk_score_24h: number, avg_conf_score_24h: number }> => {
    return await fetchHelper<{ avg_risk_score_24h: number, avg_conf_score_24h: number }>('/stats/visualization/');
}
export const apiRiskOverTime = async (): Promise<{x: any, y: any}[]> => {
    return await fetchHelper<{ x: any, y: any }[]>('/graphs/risk-over-time');
}

export const apiConfidenceOverTime = async (): Promise<{ x: any, y: any }[]> => {
    return await fetchHelper<{ x: any, y: any }[]>('/graphs/conf-over-time');
}

export const apiConfidenceOverRisk = async (): Promise<{ x: any, y: any }[]> => {
    return await fetchHelper<{ x: any, y: any }[]>('/graphs/conf-over-risk');
}


// This is a temporary endpoint to get the top 100 transactions for the last 24 hours, sorted by risk score. We will need to implement pagination and filtering in the future.
import type { TransactionPublic } from "../../dashboard/services/api";

export const apiGetAllTransactionsForFilter = async (): Promise<TransactionPublic[]> => {
    return await fetchHelper<TransactionPublic[]>('/transactions/?page=1&limit=100');
};