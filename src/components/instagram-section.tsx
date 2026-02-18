'use client'

import { AnimateIn } from '@/components/ui/animate-in'
import { Button } from '@/components/ui/button'
import { Camera, Cpu, Wrench, ArrowRight, ExternalLink, Instagram } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

export function InstagramSection() {
    const instagramHandle = '@wfixtech' // Placeholder
    const instagramUrl = 'https://instagram.com/wfixtech' // Placeholder

    const posts = [
        {
            id: 1,
            type: 'image',
            color: 'from-purple-500/20 to-blue-500/20',
            icon: Wrench,
            caption: 'Recuperação de placa mãe de MacBook Pro. Mais um salvo! 💻 #reparo #apple #macbook'
        },
        {
            id: 2,
            type: 'video',
            color: 'from-pink-500/20 to-rose-500/20',
            icon: Cpu,
            caption: 'Bastidores: Limpeza técnica avançada e troca de pasta térmica. Olha a diferença de temperatura! 🔥➡️❄️'
        },
        {
            id: 3,
            type: 'image',
            color: 'from-amber-500/20 to-orange-500/20',
            icon: Camera,
            caption: 'Setup Gamer montado hoje. Cable management impecável. O cliente adorou! 🎮✨'
        }
    ]

    return (
        <section className="py-24 bg-slate-950 relative overflow-hidden border-t border-white/5">
            {/* Background Gradients */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-pink-500/5 rounded-full blur-[120px] pointer-events-none" />

            <div className="container mx-auto px-4 relative z-10">
                <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">

                    {/* Texto / CTA */}
                    <div className="flex-1 text-center lg:text-left">
                        <AnimateIn>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-slate-300 mb-6 backdrop-blur-sm">
                                <Instagram className="w-4 h-4 text-pink-500" />
                                <span>Bastidores do Laboratório</span>
                            </div>

                            <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white leading-tight">
                                Transparência Total <br />
                                <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">
                                    Na Vida Real
                                </span>
                            </h2>

                            <p className="text-lg text-slate-400 mb-8 leading-relaxed max-w-xl mx-auto lg:mx-0">
                                Acompanhe nosso dia a dia no Instagram. Mostramos o "antes e depois" dos reparos, dicas de hardware e a organização do nosso laboratório.
                            </p>

                            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                                <Button
                                    size="lg"
                                    className="group relative overflow-hidden rounded-full bg-transparent hover:bg-transparent border border-white/10 hover:border-white/20 text-white font-bold px-8 h-14 transition-all duration-300 hover:scale-105"
                                    asChild
                                >
                                    <Link href={instagramUrl} target="_blank">
                                        <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 opacity-20 group-hover:opacity-100 transition-opacity duration-500" />
                                        <span className="relative z-10 flex items-center gap-2">
                                            <Instagram className="w-5 h-5" />
                                            Seguir {instagramHandle}
                                            <ExternalLink className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity" />
                                        </span>
                                    </Link>
                                </Button>
                            </div>
                        </AnimateIn>
                    </div>

                    {/* Grid Visual (Mockup) */}
                    <div className="flex-1 w-full max-w-md lg:max-w-full">
                        <div className="grid grid-cols-2 gap-4 auto-rows-[200px]">
                            {posts.map((post, i) => (
                                <AnimateIn key={post.id} delay={i * 0.1} className={`${i === 0 ? 'row-span-2 h-full' : ''}`}>
                                    <div className={`group relative w-full h-full rounded-2xl overflow-hidden border border-white/10 bg-slate-900 transition-transform hover:-translate-y-1 duration-300`}>

                                        {/* Gradient Placeholder (Simulating Image) */}
                                        <div className={`absolute inset-0 bg-gradient-to-br ${post.color} opacity-20 group-hover:opacity-30 transition-opacity`} />

                                        {/* Content */}
                                        <div className="absolute inset-0 p-6 flex flex-col justify-end">
                                            <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center mb-auto border border-white/10 text-white">
                                                <post.icon className="w-5 h-5" />
                                            </div>

                                            <div className="space-y-2 translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                                                <p className="text-xs font-bold text-white/70 uppercase tracking-widest">
                                                    {post.type === 'video' ? 'Reels' : 'Post'}
                                                </p>
                                                <p className="text-sm text-slate-200 line-clamp-3 leading-snug">
                                                    {post.caption}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Hover Overlay */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

                                        {/* Instagram Icon Hover */}
                                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 scale-50 group-hover:scale-100">
                                            <Instagram className="w-12 h-12 text-white drop-shadow-lg" />
                                        </div>
                                    </div>
                                </AnimateIn>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </section>
    )
}
