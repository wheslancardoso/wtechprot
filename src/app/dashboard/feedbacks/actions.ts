'use server'

import { createAdminClient } from '@/lib/supabase/server'

export interface FeedbackWithOrder {
    id: string
    order_id: string
    score: number
    comment: string | null
    created_at: string
    clicked_google_review: boolean
    clicked_google_review_at: string | null
    order: {
        display_id: string
        customer: {
            name: string
        } | null
    } | null
}

export interface FeedbackStats {
    total: number
    averageScore: number
    distribution: { score: number; count: number }[]
    googleClickRate: number
}

export async function getFeedbacks(filter?: 'all' | 'low' | 'high'): Promise<FeedbackWithOrder[]> {
    const supabase = await createAdminClient()

    let query = supabase
        .from('nps_feedbacks')
        .select(`
            id,
            order_id,
            score,
            comment,
            created_at,
            clicked_google_review,
            clicked_google_review_at,
            order:orders!inner(
                display_id,
                customer:customers(name)
            )
        `)
        .order('created_at', { ascending: false })

    if (filter === 'low') {
        query = query.lte('score', 2)
    } else if (filter === 'high') {
        query = query.gte('score', 4)
    }

    const { data, error } = await query.limit(100)

    if (error) {
        console.error('Error fetching feedbacks:', error)
        return []
    }

    return (data as unknown as FeedbackWithOrder[]) || []
}

export async function getFeedbackStats(): Promise<FeedbackStats> {
    const supabase = await createAdminClient()

    const { data: feedbacks } = await supabase
        .from('nps_feedbacks')
        .select('score, clicked_google_review')

    if (!feedbacks || feedbacks.length === 0) {
        return {
            total: 0,
            averageScore: 0,
            distribution: [],
            googleClickRate: 0
        }
    }

    const total = feedbacks.length
    const averageScore = feedbacks.reduce((acc, f) => acc + f.score, 0) / total

    // Distribution
    const distribution = [1, 2, 3, 4, 5].map(score => ({
        score,
        count: feedbacks.filter(f => f.score === score).length
    }))

    // Google click rate (only for 4-5 stars)
    const highRatings = feedbacks.filter(f => f.score >= 4)
    const googleClicks = highRatings.filter(f => f.clicked_google_review).length
    const googleClickRate = highRatings.length > 0 ? (googleClicks / highRatings.length) * 100 : 0

    return {
        total,
        averageScore: Math.round(averageScore * 10) / 10,
        distribution,
        googleClickRate: Math.round(googleClickRate)
    }
}
