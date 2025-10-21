import { useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { GalleryVerticalEnd, Keyboard } from "lucide-react"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Form, FormControl, FormField, FormLabel, FormItem, FormMessage } from "@/components/ui/form"
import { Loading } from "@/components/ui/loading"
import { toast } from "sonner"
import { OtpForm } from "@/components/forms/otp-form"
import { useAuth } from "@/contexts/auth-context"
import { apiService } from "@/services/api"
import { OnScreenKeyboard } from "@/components/on-screen-keyboard"

const LoginForm = ({
    className,
    ...props
}: React.ComponentProps<"div">) => {
    const [ isCheckingEmail, setIsCheckingEmail ] = useState(false)
    const [ isOtpForm, setIsOtpForm ] = useState(false)
    const [ userEmail, setUserEmail ] = useState("")
    const [ showKeyboard, setShowKeyboard ] = useState(false)
    const { login } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()

    const from = location.state?.from?.pathname || "/dashboard"

    const onSubmit = async (data: z.infer<typeof formSchema>) => {
        setIsCheckingEmail(true)
        try {
            const response = await apiService.resendOtp(data.email) as { success: boolean; message: string }
            if (response.success) {
                setUserEmail(data.email)
                setIsOtpForm(true)
                toast.success(response.message)
            } else {
                toast.error(response.message)
                setIsCheckingEmail(false)
            }
        } catch (error: any) {
            console.error(error)
            if (error.message?.includes("409") || error.message?.includes("already exists")) {
                setUserEmail(data.email)
                setIsCheckingEmail(false)
                setIsOtpForm(true)
                toast.info(error.message || "OTP already sent")
            } else {
                toast.error(error.message || "An unexpected error occurred")
                setIsCheckingEmail(false)
            }
        }
    }

    const handleBackToLogin = () => {
        setIsOtpForm(false)
        setUserEmail("")
    }

    const handleCheckOTP = async (data: { otp: string }) => {
        try {
            const response = await apiService.verifyOtp(userEmail, data.otp) as {
                success: boolean;
                message: string;
                user: {
                    id: string;
                    email: string;
                    name: string;
                    isVerified: boolean;
                };
                accessToken: string;
                refreshToken: string;
            }
            if (response.success) {
                login({
                    id: response.user.id,
                    email: response.user.email,
                    name: response.user.name,
                    isVerified: response.user.isVerified,
                }, {
                    accessToken: response.accessToken,
                    refreshToken: response.refreshToken
                })
                toast.success("Login successful!")
                navigate(from, { replace: true })
            } else {
                toast.error(response.message)
            }
        } catch (error: any) {
            console.error("OTP verification error:", error)
            toast.error(error.message || "OTP verification failed")
        }
    }

    const formSchema = z.object({
        email: z.string().email({
            message: "Please enter a valid email address",
        }),
    })

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
        },
    })

    const handleKeyPress = (key: string) => {
        const currentValue = form.getValues("email")
        form.setValue("email", currentValue + key)
    }

    const handleBackspace = () => {
        const currentValue = form.getValues("email")
        form.setValue("email", currentValue.slice(0, -1))
    }

    const handleClear = () => {
        form.setValue("email", "")
    }

    return (
        <div className="relative min-h-screen">
            {/* Login Form */}
            <div
                className={`absolute inset-0 flex justify-center pt-20 transition-all duration-300 ease-in-out ${isOtpForm
                    ? 'opacity-0 translate-y-4 pointer-events-none'
                    : 'opacity-100 translate-y-0'
                    }`}
            >
                <Card className="w-full max-w-sm mx-4 p-6 h-fit">
                    <div className={cn("flex flex-col gap-4", className)} {...props}>
                        <Form {...form}>
                            <form className="w-full" onSubmit={form.handleSubmit(onSubmit)}>
                                <div className="flex flex-col gap-4">
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                                            <GalleryVerticalEnd className="size-6 text-primary" />
                                        </div>
                                        <h1 className="text-xl font-bold text-center">Tile Depot POS</h1>
                                    </div>

                                    <div className="flex flex-col gap-4">
                                        <FormField
                                            control={form.control}
                                            name="email"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel htmlFor="email" className="text-sm font-medium">Email</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            id="email"
                                                            type="text"
                                                            {...field}
                                                            placeholder="Enter your email"
                                                            required
                                                            disabled={isCheckingEmail}
                                                            autoComplete="off"
                                                        />
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

                                        <Button type="submit" className="w-full text-base font-medium">
                                            {isCheckingEmail ? <Loading text="Checking..." /> : "Continue"}
                                        </Button>
                                    </div>
                                </div>
                            </form>
                        </Form>
                    </div>
                </Card>
            </div>

            {/* OTP Form */}
            <div
                className={`absolute inset-0 flex justify-center pt-20 transition-all duration-300 ease-in-out ${isOtpForm
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 translate-y-4 pointer-events-none'
                    }`}
            >
                <OtpForm
                    onOtpSubmit={handleCheckOTP}
                    userEmail={userEmail}
                    onBack={handleBackToLogin}
                />
            </div>

            {/* On-Screen Keyboard for Email Input */}
            {showKeyboard && !isOtpForm && (
                <OnScreenKeyboard
                    onKeyPress={handleKeyPress}
                    onBackspace={handleBackspace}
                    onClear={handleClear}
                    onClose={() => setShowKeyboard(false)}
                />
            )}
        </div>
    )
}

export { LoginForm };

