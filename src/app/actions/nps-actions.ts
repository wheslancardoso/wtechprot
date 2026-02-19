'use server'

import { createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// Submit NPS Feedback (for internal quality filtering only, no auto-coupon)
export async function submitFeedback(
    orderId: string,
    score: number,
    comment: string
): Promise<{ success: boolean; error?: string }> {
    try {
        const supabase = await createAdminClient()

        // 1. Resolve Order ID (support both UUID and DisplayID)
        let resolvedOrderId = orderId
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(orderId)

        let query = supabase.from('orders').select('id, customer_id, display_id')

        if (isUuid) {
            query = query.eq('id', orderId)
        } else {
            // Assume input is display_id
            query = query.eq('display_id', orderId)
        }

        const { data: order, error: orderError } = await query.single()

        if (orderError || !order) {
            return { success: false, error: 'Ordem de serviço não encontrada.' }
        }

        resolvedOrderId = order.id

        // 2. Save Feedback (no coupon - just internal quality tracking)
        const { error: insertError } = await supabase.from('nps_feedbacks').insert({
            order_id: resolvedOrderId,
            customer_id: order.customer_id!,
            score,
            comment,
        })

        if (insertError) {
            // Check for duplicate feedback constraint
            if (insertError.code === '23505') {
                return { success: false, error: 'Feedback já enviado para esta ordem.' }
            }
            throw insertError
        }

        // 3. Revalidate Client Pages to update UI immediately
        revalidatePath(`/os/${resolvedOrderId}`)
        revalidatePath(`/os/${resolvedOrderId}/track`)

        // Also revalidate display_id path if available (it usually is)
        if (order.display_id) {
            revalidatePath(`/os/${order.display_id}`)
            revalidatePath(`/os/${order.display_id}/track`) // Just in case
        }

        return { success: true }
    } catch (error) {
        console.error('Error submitting feedback:', error)
        return { success: false, error: 'Erro ao salvar feedback.' }
    }
}

// Validate Coupon
export async function validateCoupon(
    code: string,
    currentLaborCost: number
): Promise<{ success: boolean; discountAmount: number; error?: string }> {
    try {
        const supabase = await createAdminClient()

        // 1. Find coupon
        const { data: feedback, error } = await supabase
            .from('nps_feedbacks')
            .select('id, is_redeemed')
            .eq('discount_code', code)
            .single()

        if (error || !feedback) {
            return { success: false, discountAmount: 0, error: 'Cupom inválido.' }
        }

        if (feedback.is_redeemed) {
            return { success: false, discountAmount: 0, error: 'Este cupom já foi utilizado.' }
        }

        // 2. Calculate discount (20% of labor cost only)
        const discountAmount = currentLaborCost * 0.20

        return { success: true, discountAmount }
    } catch (error) {
        console.error('Error validating coupon:', error)
        return { success: false, discountAmount: 0, error: 'Erro ao validar cupom.' }
    }
}

// Mark Coupon as Redeemed (Internal helper, likely called when Order is finished or saved with coupon)
export async function redeemCoupon(code: string, orderId: string): Promise<boolean> {
    const supabase = await createAdminClient()

    const { error } = await supabase
        .from('nps_feedbacks')
        .update({ is_redeemed: true })
        .eq('discount_code', code)

    if (error) {
        console.error('Failed to redeem coupon:', error)
        return false
    }

    return true
}

export async function getAvailableCouponForOrder(orderId: string): Promise<string | null> {
    try {
        const supabase = await createAdminClient()

        // 1. Get Customer ID
        const { data: order } = await supabase
            .from('orders')
            .select('customer_id')
            .eq('id', orderId)
            .single()

        if (!order?.customer_id) return null

        // 2. Find oldest unredeemed VIP coupon
        const { data: coupons } = await supabase
            .from('nps_feedbacks')
            .select('discount_code')
            .eq('customer_id', order.customer_id)
            .eq('is_redeemed', false)
            // .gte('score', 9) -- Removed to support both old (9-10) and new (5) systems
            .not('discount_code', 'is', null)
            .order('created_at', { ascending: true })
            .limit(1)

        if (coupons && coupons.length > 0) {
            return coupons[0].discount_code
        }
    } catch (error) {
        console.error('Error fetching available coupon:', error)
    }
    return null
}

// Track when customer clicks Google Review link
export async function trackGoogleReviewClick(orderId: string): Promise<void> {
    try {
        const supabase = await createAdminClient()

        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(orderId)

        let targetOrderId = orderId

        if (!isUuid) {
            const { data } = await supabase
                .from('orders')
                .select('id')
                .eq('display_id', orderId)
                .single()

            if (data) targetOrderId = data.id
            else return // Not found
        }

        await supabase
            .from('nps_feedbacks')
            .update({ clicked_google_review: true, clicked_google_review_at: new Date().toISOString() })
            .eq('order_id', targetOrderId)
    } catch (error) {
        console.error('Error tracking Google review click:', error)
    }
}
