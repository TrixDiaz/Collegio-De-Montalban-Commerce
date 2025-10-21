import { useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Shield } from "lucide-react"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Form, FormControl, FormField, FormLabel, FormItem, FormMessage } from "@/components/ui/form"
import { Loading } from "@/components/ui/loading"
import { toast } from "sonner"
import { OtpForm } from "@/components/forms/otp-form"
import { useAuth } from "@/contexts/auth-context"
import { apiService } from "@/services/api"

const LoginForm = ({
    className,
    ...props
}: React.ComponentProps<"div">) => {
    const [ isCheckingEmail, setIsCheckingEmail ] = useState(false)
    const [ isOtpForm, setIsOtpForm ] = useState(false)
    const [ userEmail, setUserEmail ] = useState("")
    const { login } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()

    // Get the intended destination from location state, default to dashboard
    const from = location.state?.from?.pathname || "/dashboard"

    const onSubmit = async (data: z.infer<typeof formSchema>) => {
        setIsCheckingEmail(true)
        try {
            const response = await apiService.resendOtp(data.email)
            if (response.data.success) {
                setUserEmail(data.email)
                setIsOtpForm(true)
                toast.success(response.data.message)
            } else {
                toast.error(response.data.message)
                setIsCheckingEmail(false)
            }
        } catch (error: any) {
            console.error(error)
            if (error.response?.status === 409) {
                setUserEmail(data.email)
                setIsOtpForm(true)
                toast.info(error.response?.data.message)
            } else {
                toast.error(error.response?.data.message || "An unexpected error occurred")
            }
            setIsCheckingEmail(false)
        }
    }

    const handleBackToLogin = () => {
        setIsOtpForm(false)
        setUserEmail("")
    }

    const handleCheckOTP = async (data: { otp: string }) => {
        try {
            const response = await apiService.verifyOtp(userEmail, data.otp)
            if (response.data.success) {
                // Login the user with tokens
                login({
                    id: response.data.user.id,
                    email: response.data.user.email,
                    name: response.data.user.name,
                    picture: response.data.user.picture,
                    isVerified: response.data.user.isVerified,
                    role: 'admin'
                }, {
                    accessToken: response.data.accessToken,
                    refreshToken: response.data.refreshToken
                })
                toast.success("Login successful!")
                navigate(from, { replace: true })
            } else {
                toast.error(response.data.message)
            }
        } catch (error: any) {
            console.error("OTP verification error:", error)
            toast.error(error.response?.data.message || "OTP verification failed")
        }
    }

    const formSchema = z.object({
        email: z.string().min(2, {
            message: "Email is required",
        }),
    })

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
        },
    })

    return (
        <div className="relative min-h-[80vh] flex items-center justify-center">
            {/* Login Form */}
            <div
                className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ease-in-out ${isOtpForm
                    ? 'opacity-0 translate-y-4 pointer-events-none'
                    : 'opacity-100 translate-y-0'
                    }`}
            >
                <Card className="w-full max-w-md mx-auto p-8">
                    <div className={cn("flex flex-col gap-8", className)} {...props}>
                        <Form {...form}>
                            <form className="w-full" onSubmit={form.handleSubmit(onSubmit)}>
                                <div className="flex flex-col gap-8">
                                    <div className="flex flex-col items-center gap-4">
                                        <div className="flex size-12 items-center justify-center rounded-lg bg-primary/10">
                                            <Shield className="size-8 text-primary" />
                                        </div>
                                        <h1 className="text-2xl font-bold text-center">Admin Login</h1>
                                        <p className="text-sm text-muted-foreground text-center">
                                            Enter your email to access the admin dashboard
                                        </p>
                                    </div>

                                    <div className="flex flex-col gap-4">
                                        <FormField
                                            control={form.control}
                                            name="email"
                                            render={({ field }) => (
                                                <FormItem className="flex flex-col gap-1">
                                                    <FormLabel htmlFor="email" className="text-sm font-medium">Email</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            id="email"
                                                            type="email"
                                                            {...field}
                                                            placeholder="Enter your admin email"
                                                            required
                                                            autoFocus
                                                            disabled={isCheckingEmail}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

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
                className={`absolute inset-0 transition-all duration-300 ease-in-out ${isOtpForm
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
        </div>
    )
}

export { LoginForm };
