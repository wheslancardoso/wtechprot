"use client"

import React, { useState } from "react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import Image from "next/image"
import { ZoomIn } from "lucide-react"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"

interface ImageModalProps {
    src: string
    alt: string
    label?: string
    children: React.ReactNode
    className?: string
}

export function ImageModal({ src, alt, label, children, className }: ImageModalProps) {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <>
            <div
                onClick={() => setIsOpen(true)}
                className={`cursor-pointer group block relative rounded-lg overflow-hidden ${className || ''}`}
            >
                {children}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center z-10">
                    <div className="bg-black/40 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 backdrop-blur-sm transform scale-90 group-hover:scale-100">
                        <ZoomIn className="text-white w-5 h-5" />
                    </div>
                </div>
            </div>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="max-w-4xl w-[95vw] h-[90vh] p-0 bg-black/95 border-none shadow-2xl overflow-hidden sm:rounded-xl flex flex-col items-center justify-center">
                    <VisuallyHidden>
                        <DialogTitle>{alt}</DialogTitle>
                    </VisuallyHidden>
                    <div className="relative w-full h-full flex items-center justify-center p-2">
                        <Image
                            src={src}
                            alt={alt}
                            fill
                            className="object-contain"
                            quality={100}
                        />
                    </div>
                    {label && (
                        <div className="absolute bottom-0 inset-x-0 p-6 bg-gradient-to-t from-black/90 via-black/60 to-transparent">
                            <p className="text-white text-center font-medium text-lg drop-shadow-md">{label}</p>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    )
}
