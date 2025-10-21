import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft, Keyboard } from "lucide-react"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"
import { Loading } from "@/components/ui/loading"
import { toast } from "sonner"
import { apiService } from "@/services/api"
import { OtpNumericKeyboard } from "@/components/otp-numeric-keyboard"

interface OtpFormProps {
    onOtpSubmit: (data: { otp: string }) => void;
    userEmail: string;
    onBack: () => void;
}

const OtpForm = ({ onOtpSubmit, userEmail, onBack }: OtpFormProps) => {
    const [ isVerifying, setIsVerifying ] = useState(false)
    const [ isResending, setIsResending ] = useState(false)
    const [ showKeyboard, setShowKeyboard ] = useState(false)

    const formSchema = z.object({
        otp: z.string().min(6, {
            message: "OTP must be 6 digits",
        }),
    })

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            otp: "",
        },
    })

    const handleSubmit = async (data: z.infer<typeof formSchema>) => {
        setIsVerifying(true)
        try {
            await onOtpSubmit(data)
        } catch (error) {
            console.error("OTP verification error:", error)
        } finally {
            setIsVerifying(false)
        }
    }

    const handleResend = async () => {
        setIsResending(true)
        try {
            const response = await apiService.resendOtp(userEmail) as { success: boolean; message: string }
            if (response.success) {
                toast.success("OTP resent successfully")
                form.reset()
            } else {
                toast.error(response.message)
            }
        } catch (error: any) {
            toast.error(error.message || "Failed to resend OTP")
        } finally {
            setIsResending(false)
        }
    }

    const handleNumericKeyPress = (key: string) => {
        const currentValue = form.getValues("otp")
        // Only add if less than 6 digits and it's a number
        if (currentValue.length < 6 && !isNaN(Number(key))) {
            form.setValue("otp", currentValue + key)
        }
    }

    const handleClear = () => {
        form.setValue("otp", "")
    }

    return (
        <>
            <Card className="w-full max-w-sm mx-4 p-6 h-fit">
                <div className="flex flex-col gap-4">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="w-fit -ml-2"
                        onClick={onBack}
                        type="button"
                    >
                        <ArrowLeft className="size-4 mr-2" />
                        Back
                    </Button>

                    <div className="flex flex-col items-center gap-2">
                        <h1 className="text-xl font-bold text-center">Enter OTP</h1>
                        <p className="text-xs text-muted-foreground text-center">
                            Verification code sent to<br />
                            <span className="font-medium text-foreground">{userEmail}</span>
                        </p>
                    </div>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleSubmit)} className="flex flex-col gap-4">
                            <FormField
                                control={form.control}
                                name="otp"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col items-center">
                                        <FormControl>
                                            <InputOTP maxLength={6} {...field}>
                                                <InputOTPGroup className="gap-1.5">
                                                    <InputOTPSlot index={0} className="w-10 h-10 text-base" />
                                                    <InputOTPSlot index={1} className="w-10 h-10 text-base" />
                                                    <InputOTPSlot index={2} className="w-10 h-10 text-base" />
                                                    <InputOTPSlot index={3} className="w-10 h-10 text-base" />
                                                    <InputOTPSlot index={4} className="w-10 h-10 text-base" />
                                                    <InputOTPSlot index={5} className="w-10 h-10 text-base" />
                                                </InputOTPGroup>
                                            </InputOTP>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <Button
                                type="button"
                                variant="outline"
                                className="w-full"
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setShowKeyboard(!showKeyboard);
                                }}
                            >
                                <Keyboard className="h-4 w-4 mr-2" />
                                {showKeyboard ? "Hide" : "Show"} On-Screen Keyboard
                            </Button>

                            <Button type="submit" className="w-full" disabled={isVerifying}>
                                {isVerifying ? <Loading text="Verifying..." /> : "Verify OTP"}
                            </Button>

                            <div className="text-center text-sm">
                                <span className="text-muted-foreground">Didn't receive the code? </span>
                                <Button
                                    variant="link"
                                    className="p-0 h-auto"
                                    onClick={handleResend}
                                    disabled={isResending}
                                    type="button"
                                >
                                    {isResending ? "Resending..." : "Resend"}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </div>
            </Card>

            {/* Numeric Keyboard for OTP Input */}
            {showKeyboard && (
                <OtpNumericKeyboard
                    onKeyPress={handleNumericKeyPress}
                    onClear={handleClear}
                    onClose={() => setShowKeyboard(false)}
                    currentValue={form.watch("otp")}
                />
            )}
        </>
    )
}

export { OtpForm };

