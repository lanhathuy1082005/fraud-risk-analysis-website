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
