import React, { useMemo } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    useTheme,
} from '@mui/material';
import {
    Radar,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    ResponsiveContainer,
    Legend,
    Tooltip
} from 'recharts';
import type { ReportSummary } from '../type';

interface Props {
    summary: ReportSummary;
}

const SubCategoryRadarCharts: React.FC<Props> = ({ summary }) => {
    const theme = useTheme();

    const chartData = useMemo(() => {
        if (!summary?.categories.breakdown) return [];

        // Sort by code (4.1.1, 4.1.2...)
        const sorted = [...summary.categories.breakdown].sort((a, b) => a.code.localeCompare(b.code));

        return sorted.map(category => ({
            subject: category.code,
            self: category.percentSelf || 0,
            obs1: category.percent1 || 0,
            obs2: category.percent2 || 0,
            fullMark: 100
        }));
    }, [summary]);

    if (!chartData.length) return null;

    return (
        <Card raised sx={{ mt: 4 }}>
            <CardContent>
                <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
                    Analisis Prestasi Mengikut Subkategori (Radar)
                </Typography>

                <Box sx={{ width: '100%', height: 500 }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
                            <PolarGrid />
                            <PolarAngleAxis dataKey="subject" tick={{ fontSize: 14, fontWeight: 'bold' }} />
                            <PolarRadiusAxis
                                angle={30}
                                domain={[0, 100]}
                                tickFormatter={(value) => `${value}%`}
                            />

                            <Radar
                                name="Kendiri"
                                dataKey="self"
                                stroke={theme.palette.primary.main}
                                fill={theme.palette.primary.main}
                                fillOpacity={0.3}
                            />
                            <Radar
                                name="Cerapan 1"
                                dataKey="obs1"
                                stroke={theme.palette.warning.main}
                                fill={theme.palette.warning.main}
                                fillOpacity={0.3}
                            />
                            <Radar
                                name="Cerapan 2"
                                dataKey="obs2"
                                stroke={theme.palette.success.main}
                                fill={theme.palette.success.main}
                                fillOpacity={0.3}
                            />
                            <Legend />
                            <Tooltip
                                formatter={(value: number) => [`${value.toFixed(2)}%`]}
                                contentStyle={{ borderRadius: 8 }}
                            />
                        </RadarChart>
                    </ResponsiveContainer>
                </Box>
            </CardContent>
        </Card>
    );
};

export default SubCategoryRadarCharts;
