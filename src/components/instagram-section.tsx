'use client'

import { AnimateIn } from '@/components/ui/animate-in'
import { Button } from '@/components/ui/button'
import { ExternalLink, Instagram } from 'lucide-react'
import Link from 'next/link'

export function InstagramSection() {
    const instagramHandle = '@wfixtech' // Placeholder
    const instagramUrl = 'https://instagram.com/wfixtech' // Placeholder

    return (
        <section className="py-24 bg-slate-950 relative overflow-hidden border-t border-white/5">
            {/* Background Gradients */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-[100px] pointer-events-none" />

            <div className="container mx-auto px-4 relative z-10 text-center">
                <AnimateIn>
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm font-medium text-slate-300 mb-8 backdrop-blur-sm">
                        <Instagram className="w-4 h-4 text-pink-500" />
                        <span>Bastidores & Novidades</span>
                    </div>

                    <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white leading-tight max-w-3xl mx-auto">
                        Conheça mais os <br className="hidden md:block" />
                        <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">
                            Nossos Serviços
                        </span>
                    </h2>

                    <p className="text-lg text-slate-400 mb-10 leading-relaxed max-w-2xl mx-auto">
                        Veja fotos reais dos nossos processos, a organização do laboratório e o padrão de qualidade que aplicamos em cada equipamento. Transparência total.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                        <Button
                            size="lg"
                            className="group relative overflow-hidden rounded-full font-bold px-8 h-14 w-full sm:w-auto transition-all duration-300 text-white border-0 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 sm:bg-none sm:bg-slate-900 sm:border sm:border-white/10 sm:hover:border-white/20 hover:bg-slate-900 hover:text-white"
                            asChild
                        >
                            <Link href={instagramUrl} target="_blank">
                                {/* Desktop Hover Gradient Overlay */}
                                <div className="hidden sm:block absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                <span className="relative z-10 flex items-center justify-center gap-3">
                                    <div className="p-1 rounded bg-white/20 sm:bg-gradient-to-tr sm:from-yellow-400 sm:via-pink-500 sm:to-purple-600 sm:group-hover:bg-white/20 transition-colors">
                                        <Instagram className="w-5 h-5 text-white" />
                                    </div>
                                    Seguir {instagramHandle}
                                    <ExternalLink className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity" />
                                </span>
                            </Link>
                        </Button>
                    </div>
                </AnimateIn>
            </div>
        </section>
    )
}
