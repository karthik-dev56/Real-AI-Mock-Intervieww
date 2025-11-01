import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

type ResultData = {
    conclusion?: string;
    finalScore?: number;
    overallEvaluation?: string;
    reasonForDeduction?: string;
    strengths?: string;
    weakness?: string;
    _id: string;
}

interface ResultsPDFProps {
    resultData: ResultData;
    userName: string;
    interviewDate: Date;
}

const styles = StyleSheet.create({
    page: {
        padding: 40,
        backgroundColor: '#ffffff',
        fontFamily: 'Helvetica',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 10,
        color: '#1a1a1a',
    },
    headerInfo: {
        textAlign: 'center',
        marginBottom: 30,
        padding: 15,
        backgroundColor: '#f9fafb',
        borderRadius: 8,
    },
    userInfo: {
        fontSize: 12,
        color: '#4b5563',
        marginBottom: 5,
    },
    dateInfo: {
        fontSize: 11,
        color: '#6b7280',
    },
    scoreContainer: {
        textAlign: 'center',
        marginBottom: 30,
        padding: 20,
        backgroundColor: '#f3f4f6',
        borderRadius: 8,
    },
    scoreLabel: {
        fontSize: 14,
        color: '#4b5563',
        marginBottom: 10,
    },
    scoreValue: {
        fontSize: 36,
        fontWeight: 'bold',
        color: '#2563eb',
    },
    section: {
        marginBottom: 20,
        paddingBottom: 20,
        borderBottom: '1px solid #e5e7eb',
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#1f2937',
    },
    sectionContent: {
        fontSize: 11,
        lineHeight: 1.6,
        color: '#4b5563',
    },
    strengthsTitle: {
        color: '#15803d',
    },
    weaknessTitle: {
        color: '#c2410c',
    },
    deductionTitle: {
        color: '#b91c1c',
    },
    footer: {
        position: 'absolute',
        bottom: 30,
        left: 40,
        right: 40,
        textAlign: 'center',
        fontSize: 10,
        color: '#9ca3af',
    },
});

export const ResultsPDF = ({ resultData, userName, interviewDate }: ResultsPDFProps) => {
    const formatDate = (date: Date) => {
        const options: Intl.DateTimeFormatOptions = { 
            weekday: 'long',
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        return date.toLocaleDateString('en-US', options);
    };

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <Text style={styles.title}>Interview Results</Text>
                
                <View style={styles.headerInfo}>
                    <Text style={styles.userInfo}>Candidate: {userName}</Text>
                    <Text style={styles.dateInfo}>Interview Date: {formatDate(interviewDate)}</Text>
                </View>
                
                <View style={styles.scoreContainer}>
                <Text style={styles.scoreLabel}>Final Score</Text>
                <Text style={styles.scoreValue}>
                    {resultData.finalScore || 0}/10
                </Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Overall Evaluation</Text>
                <Text style={styles.sectionContent}>
                    {resultData.overallEvaluation || "No evaluation available"}
                </Text>
            </View>

            <View style={styles.section}>
                <Text style={[styles.sectionTitle, styles.strengthsTitle]}>Strengths</Text>
                <Text style={styles.sectionContent}>
                    {resultData.strengths || "Not available"}
                </Text>
            </View>

            <View style={styles.section}>
                <Text style={[styles.sectionTitle, styles.weaknessTitle]}>Areas for Improvement</Text>
                <Text style={styles.sectionContent}>
                    {resultData.weakness || "Not available"}
                </Text>
            </View>

            {resultData.reasonForDeduction && (
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, styles.deductionTitle]}>Reason for Deduction</Text>
                    <Text style={styles.sectionContent}>
                        {resultData.reasonForDeduction}
                    </Text>
                </View>
            )}

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Conclusion</Text>
                <Text style={styles.sectionContent}>
                    {resultData.conclusion || "Not available"}
                </Text>
            </View>

        </Page>
    </Document>
    );
};
