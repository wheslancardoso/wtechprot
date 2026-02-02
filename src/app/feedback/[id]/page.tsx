'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Star, Copy, CheckCircle, Store, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { submitFeedback } from '@/app/actions/nps-actions'

export default function FeedbackPage({ params }: { params: Promise<{ id: string }> }) {
    const [score, setScore] = useState<number | null>(null)
    const [comment, setComment] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitted, setSubmitted] = useState(false)
    const [couponCode, setCouponCode] = useState<string | null>(null)
    const [copied, setCopied] = useState(false)

    // Unpack params
    const { id } = React.use(params)

    async function handleSubmit() {
        if (score === null) return

        setIsSubmitting(true)
        try {
            const result = await submitFeedback(id, score, comment)
            if (result.success) {
                setSubmitted(true)
                if (result.discountCode) {
                    setCouponCode(result.discountCode)
                }
            } else {
                alert(result.error || 'Erro ao enviar avaliação.')
            }
        } catch (error) {
            console.error(error)
            alert('Erro inesperado.')
        } finally {
            setIsSubmitting(false)
        }
    }

    function handleCopy() {
        if (couponCode) {
            navigator.clipboard.writeText(couponCode)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        }
    }

    if (submitted) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4">

                <Card className="max-w-md w-full shadow-xl border-t-4 border-t-green-500">
                    <CardHeader className="text-center pb-2">
                        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                            <CheckCircle className="w-8 h-8 text-green-600" />
                        </div>
                        <CardTitle className="text-2xl font-bold text-green-700">Obrigado!</CardTitle>
                        <CardDescription>Sua avaliação é muito importante para nós.</CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-6 pt-4">
                        {couponCode ? (
                            <div className="bg-white border-2 border-dashed border-primary/20 rounded-xl p-6 text-center space-y-3 relative overflow-hidden">
                                <h3 className="text-lg font-semibold text-foreground">Parabéns! Você ganhou!</h3>
                                <p className="text-sm text-muted-foreground">
                                    Use este cupom na sua próxima visita e ganhe <span className="font-bold text-foreground">20% de desconto</span> na mão de obra.
                                </p>

                                <div className="flex items-center gap-2 mt-4 bg-muted/50 border border-border rounded-lg p-3">
                                    <code className="text-xl font-mono font-bold text-primary flex-1 tracking-wider">
                                        {couponCode}
                                    </code>
                                    <Button size="icon" variant="ghost" onClick={handleCopy} className="hover:bg-background">
                                        {copied ? <CheckCircle className="h-5 w-5 text-green-600" /> : <Copy className="h-5 w-5 text-muted-foreground" />}
                                    </Button>
                                </div>
                                {copied && <p className="text-xs text-green-600 font-medium">Copiado!</p>}
                            </div>
                        ) : (
                            <div className="text-center text-muted-foreground p-4">
                                Agradecemos seu feedback. Trabalhamos todos os dias para melhorar nosso atendimento!
                            </div>
                        )}

                        <div className="pt-4 border-t">
                            <Button variant="outline" className="w-full gap-2" asChild>
                                <a href="https://g.page/r/YOUR_GOOGLE_LINK_HERE/review" target="_blank" rel="noopener noreferrer">
                                    <Store className="w-4 h-4" />
                                    Avaliar também no Google
                                    <ExternalLink className="w-3 h-3 ml-1" />
                                </a>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
            <Card className="max-w-lg w-full shadow-lg">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl">Como foi sua experiência?</CardTitle>
                    <CardDescription>
                        Em uma escala de 1 a 5 estrelas, como você avalia nossos serviços?
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                    {/* Score Selection */}
                    <div className="flex justify-center gap-2">
                        {Array.from({ length: 5 }).map((_, i) => {
                            const starValue = i + 1
                            return (
                                <button
                                    key={i}
                                    type="button"
                                    onClick={() => setScore(starValue)}
                                    className="transition-transform hover:scale-110 focus:outline-none"
                                >
                                    <Star
                                        className={`w-10 h-10 ${(score || 0) >= starValue
                                            ? 'fill-yellow-400 text-yellow-500'
                                            : 'text-gray-300'
                                            }`}
                                    />
                                </button>
                            )
                        })}
                    </div>

                    <div className="text-center font-medium text-lg text-primary min-h-[1.5rem]">
                        {score === 1 && 'Péssimo'}
                        {score === 2 && 'Ruim'}
                        {score === 3 && 'Razoável'}
                        {score === 4 && 'Muito Bom'}
                        {score === 5 && 'Excelente!'}
                    </div>

                    {/* Comment Area */}
                    <div className="space-y-2 fade-in">
                        <label className="text-sm font-medium">Deixe um comentário (opcional):</label>
                        <Textarea
                            placeholder="O que você mais gostou? O que podemos melhorar?"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            rows={3}
                        />
                    </div>
                </CardContent>

                <CardFooter>
                    <Button
                        className="w-full text-lg h-12"
                        disabled={score === null || isSubmitting}
                        onClick={handleSubmit}
                    >
                        {isSubmitting ? 'Enviando...' : 'Enviar Avaliação'}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
}

