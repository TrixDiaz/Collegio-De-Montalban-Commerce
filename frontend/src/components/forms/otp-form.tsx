import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { ArrowLeft } from "lucide-react"
import { useState, useEffect } from "react"
import axios from "axios"
import { toast } from "sonner"

const formSchema = z.object({
    otp: z.string()
        .min(6, {
            message: "OTP must be 6 digits",
        })
        .max(6, {
            message: "OTP must be 6 digits",
        })
        .regex(/^\d{6}$/, {
            message: "OTP must contain only numbers",
        }),
})

const OtpForm = ({
    onOtpSubmit,
    userEmail,
    onBack,
}: {
    onOtpSubmit: (data: z.infer<typeof formSchema>) => void
    userEmail?: string
    onBack?: () => void
}) => {
    const [ isVerifying, setIsVerifying ] = useState(false)
    const [ countdown, setCountdown ] = useState(0)

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            otp: "",
        },
    })

    useEffect(() => {
        let timer: NodeJS.Timeout
        if (countdown > 0) {
            timer = setTimeout(() => setCountdown(countdown - 1), 1000) // 1 second interval
        }
        return () => clearTimeout(timer)
    }, [ countdown ])

    const handleSubmit = async (data: z.infer<typeof formSchema>) => {
        setIsVerifying(true)
        try {
            onOtpSubmit(data)
        } catch (error) {
            console.error("OTP submission error:", error)
        } finally {
            setIsVerifying(false)
        }
    }

    const handleResentOTP = async () => {
        setIsVerifying(true)
        setCountdown(60)
        try {
            const url = "http://localhost:5000/api/v1/auth/resend-otp"
            const response = await axios.post(url, { email: userEmail })
            toast.success(response.data.message)
            console.log(response.data)
        } catch (error) {
            console.error(error)
            toast.error(error instanceof Error ? error.message : "An unexpected error occurred")
        } finally {
            setIsVerifying(false)
        }
    }

    return (
        <div className="mt-20">
            <Card className="w-full max-w-md mx-auto p-8">
                <div className="flex flex-col gap-8">
                    {/* Back Button */}
                    {onBack && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onBack}
                            className="self-start -ml-2 -mt-2 text-muted-foreground hover:text-foreground"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to login
                        </Button>
                    )}

                    <div className="text-center">
                        <h1 className="text-2xl font-bold">Enter OTP</h1>
                        {userEmail && (
                            <p className="text-sm text-muted-foreground mt-3">
                                We sent a code to <strong>{userEmail}</strong>
                            </p>
                        )}
                    </div>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                            <FormField
                                control={form.control}
                                name="otp"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-sm font-medium text-muted-foreground">One Time Password</FormLabel>
                                        <FormControl>
                                            <div className="flex items-center justify-center">
                                                <InputOTP
                                                    maxLength={6}
                                                    pattern="[0-9]*"
                                                    inputMode="numeric"
                                                    className="gap-2"
                                                    {...field}
                                                >
                                                    <InputOTPGroup className="gap-2">
                                                        <InputOTPSlot index={0} className="w-12 h-12 text-lg" />
                                                        <InputOTPSlot index={1} className="w-12 h-12 text-lg" />
                                                        <InputOTPSlot index={2} className="w-12 h-12 text-lg" />
                                                        <InputOTPSlot index={3} className="w-12 h-12 text-lg" />
                                                        <InputOTPSlot index={4} className="w-12 h-12 text-lg" />
                                                        <InputOTPSlot index={5} className="w-12 h-12 text-lg" />
                                                    </InputOTPGroup>
                                                </InputOTP>
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button type="submit" className="w-full text-base font-medium" disabled={isVerifying}>
                                {isVerifying ? "Verifying..." : "Verify OTP"}
                            </Button>
                        </form>
                        <Button variant="ghost" className="w-full text-base font-medium flex justify-center h-0 m-0 p-0" disabled={isVerifying || countdown > 0} onClick={handleResentOTP}>
                            {isVerifying ? "Resending..." : countdown > 0 ? `Resend OTP in ${countdown}s` : "Resend OTP"}
                        </Button>
                    </Form>
                </div>
            </Card >
        </div >
    )
}

export { OtpForm }
