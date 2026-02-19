'use client'

import React, { useState } from 'react'
import { Star, CheckCircle, Store, ExternalLink, Instagram } from 'lucide-react'
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

                        {/* Conditional Actions based on Score */}
                        {finalScore >= 4 ? (
                            <>
                                {/* High Score: Google Review Priority */}
                                <div className="pt-4 border-t border-gray-800">
                                    <Button
                                        variant="default"
                                        className="w-full gap-2 bg-[#4285F4] hover:bg-[#3b78e7] text-white font-bold h-12 text-lg shadow-lg hover:shadow-blue-900/20 active:scale-[0.98] transition-all"
                                        onClick={async () => {
                                            await trackGoogleReviewClick(id)
                                            window.open('https://g.page/r/CSEBt1JqKDjlEAE/review', '_blank')
                                        }}
                                    >
                                        <div className="bg-white p-1 rounded-full w-6 h-6 flex items-center justify-center mr-1">
                                            <svg className="w-4 h-4" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                <title>Google</title>
                                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                            </svg>
                                        </div>
                                        Avaliar no Google
                                        <ExternalLink className="w-4 h-4 ml-1 opacity-70" />
                                    </Button>
                                    <p className="text-xs text-blue-400/70 text-center mt-2">
                                        Isso nos ajuda muito! ⭐
                                    </p>
                                </div>

                                {/* Secondary Action: Instagram */}
                                <div className="pt-4">
                                    <Button
                                        variant="ghost"
                                        className="w-full gap-2 text-gray-400 hover:text-white hover:bg-gray-800"
                                        onClick={() => window.open('https://instagram.com/wfixtech', '_blank')}
                                    >
                                        <Instagram className="w-4 h-4" />
                                        Ou siga nosso Instagram @wfixtech
                                    </Button>
                                </div>
                            </>
                        ) : (
                            /* Lower Score: Instagram Priority (Retention) */
                            <div className="pt-4 border-t border-gray-800">
                                <Button
                                    variant="default"
                                    className="w-full gap-2 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 hover:opacity-90 text-white font-bold border-0 h-12"
                                    onClick={() => window.open('https://instagram.com/wfixtech', '_blank')}
                                >
                                    <Instagram className="w-5 h-5" />
                                    Seguir @wfixtech
                                    <ExternalLink className="w-3 h-3 ml-1 opacity-70" />
                                </Button>
                                <p className="text-xs text-gray-500 text-center mt-2">
                                    Veja bastidores e dicas exclusivas!
                                </p>
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

