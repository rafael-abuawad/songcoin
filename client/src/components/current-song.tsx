import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, ExternalLink } from "lucide-react"

export function CurrentSong() {
    const [timeLeft, setTimeLeft] = useState({
        hours: 0,
        minutes: 0,
        seconds: 0,
    })

    // Mock data - in a real app, this would come from the blockchain
    const currentSong = {
        title: "Never Gonna Give You Up",
        artist: "Rick Astley",
        bidAmount: 0.025,
        bidder: "0x7Fc...A3b2",
        embedUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        endTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
        txHash: "0x3a4e5f2c1d8b7a9c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2",
    }

    useEffect(() => {
        const timer = setInterval(() => {
            const now = new Date()
            const difference = currentSong.endTime.getTime() - now.getTime()

            if (difference <= 0) {
                clearInterval(timer)
                // In a real app, this would trigger the smart contract to select the winner
                return
            }

            const hours = Math.floor(difference / (1000 * 60 * 60))
            const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
            const seconds = Math.floor((difference % (1000 * 60)) / 1000)

            setTimeLeft({ hours, minutes, seconds })
        }, 1000)

        return () => clearInterval(timer)
    }, [])

    return (
        <Card className="overflow-hidden p-0 pb-6 gap-4">
            <div className="aspect-video w-full">
                <iframe
                    src={currentSong.embedUrl}
                    className="h-full w-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                ></iframe>
            </div>

            <CardContent className="pt-2">
                <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                        Bid by <span className="font-mono text-xs font-semibold">{currentSong.bidder}</span>
                    </div>
                    <div className="text-lg font-bold">{currentSong.bidAmount.toFixed(3)} ETH</div>
                </div>

                <div className="flex items-center justify-between pt-2">
                    <div className="text-xs text-muted-foreground">
                        <a
                            href={`https://etherscan.io/tx/${currentSong.txHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 hover:text-foreground"
                        >
                            View on Etherscan <ExternalLink className="h-3 w-3" />
                        </a>
                    </div>
                    <Badge variant="outline" className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {String(timeLeft.hours).padStart(2, "0")}:{String(timeLeft.minutes).padStart(2, "0")}:
                        {String(timeLeft.seconds).padStart(2, "0")}
                    </Badge>
                </div>
            </CardContent>
        </Card>
    )
}
