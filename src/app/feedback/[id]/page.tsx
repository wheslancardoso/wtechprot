'use client'

import React, { useState } from 'react'
import { Star, CheckCircle, Store, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { submitFeedback, trackGoogleReviewClick } from '@/app/actions/nps-actions'

export default function FeedbackPage({ params }: { params: Promise<{ id: string }> }) {
    const [score, setScore] = useState<number | null>(null)
    const [comment, setComment] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitted, setSubmitted] = useState(false)
    const [finalScore, setFinalScore] = useState<number>(0)

    // Unpack params
    const { id } = React.use(params)

    async function handleSubmit() {
        if (score === null) return

        setIsSubmitting(true)
        try {
            const result = await submitFeedback(id, score, comment)
            if (result.success) {
                setFinalScore(score)
                setSubmitted(true)
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

    if (submitted) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-950 flex items-center justify-center p-4">

                <Card className="max-w-md w-full shadow-xl border-t-4 border-t-green-500 bg-gray-900 border-gray-800">
                    <CardHeader className="text-center pb-2">
                        <div className="mx-auto w-16 h-16 bg-green-900/50 rounded-full flex items-center justify-center mb-4">
                            <CheckCircle className="w-8 h-8 text-green-500" />
                        </div>
                        <CardTitle className="text-2xl font-bold text-green-400">Obrigado!</CardTitle>
                        <CardDescription className="text-gray-400">Sua avaliação é muito importante para nós.</CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-6 pt-4">
                        <div className="text-center text-gray-400 p-4 bg-gray-800/50 rounded-lg">
                            Agradecemos seu feedback. Trabalhamos todos os dias para melhorar nosso atendimento!
                        </div>

                        {/* Only show Google review button for high ratings (4-5 stars) */}
                        {finalScore >= 4 && (
                            <div className="pt-4 border-t border-gray-800">
                                <Button
                                    variant="outline"
                                    className="w-full gap-2 bg-gray-800 hover:bg-gray-700 border-gray-700 text-gray-200"
                                    onClick={async () => {
                                        await trackGoogleReviewClick(id)
                                        window.open('https://search.google.com/local/writereview?placeid=YOUR_PLACE_ID', '_blank')
                                    }}
                                >
                                    <Store className="w-4 h-4" />
                                    Avaliar também no Google
                                    <ExternalLink className="w-3 h-3 ml-1" />
                                </Button>
                            </div>
                        )}
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

