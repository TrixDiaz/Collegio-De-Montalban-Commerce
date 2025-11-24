import { useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { GalleryVerticalEnd } from "lucide-react"
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

    // Get the intended destination from location state, default to home
    const from = location.state?.from?.pathname || "/"

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
            if (error.response?.status === 409) {
                setUserEmail(data.email)
                setIsCheckingEmail(false)
                setIsOtpForm(true)
                toast.info(error.response?.data.message)
            } else {
                toast.error(error.response?.data.message || "An unexpected error occurred")
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
                    picture: string;
                    isVerified: boolean;
                };
                accessToken: string;
                refreshToken: string;
            }
            if (response.success) {
                // Login the user with tokens
                login({
                    id: response.user.id,
                    email: response.user.email,
                    name: response.user.name,
                    picture: response.user.picture,
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
            toast.error(error.response?.data.message || "OTP verification failed")
        }
    }

    const handleGoogleLogin = () => {
        // Redirect to backend OAuth initiation endpoint (not callback)
        const backendUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
        const oauthUrl = `${backendUrl}/api/v1/oauth/google`;
        window.location.href = oauthUrl;
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
                                            <GalleryVerticalEnd className="size-8 text-primary" />
                                        </div>
                                        <h1 className="text-2xl font-bold text-center">Welcome to Tile Depot</h1>
                                    </div>

                                    <div className="flex flex-col gap-6">
                                        <FormField
                                            control={form.control}
                                            name="email"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel htmlFor="email" className="text-sm font-medium">Email</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            id="email"
                                                            type="email"
                                                            {...field}
                                                            placeholder="Enter your email"
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

                                    <div className="relative">
                                        <div className="absolute inset-0 flex items-center">
                                            <span className="w-full border-t" />
                                        </div>
                                        <div className="relative flex justify-center text-xs uppercase">
                                            <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                                        </div>
                                    </div>

                                    <div className="grid gap-3">
                                        <Button
                                            variant="outline"
                                            type="button"
                                            className="w-full"
                                            onClick={handleGoogleLogin}
                                        >
                                            <svg className="w-5 h-5 mr-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                                                <path
                                                    d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                                                    fill="currentColor"
                                                />
                                            </svg>
                                            Continue with Google
                                        </Button>
                                    </div>
                                </div>
                            </form>
                        </Form>

                        <div className="text-center text-xs text-muted-foreground">
                            By clicking continue, you agree to our{" "}
                            <a href="#" className="underline underline-offset-4 hover:text-primary">Terms of Service</a>{" "}
                            and{" "}
                            <a href="#" className="underline underline-offset-4 hover:text-primary">Privacy Policy</a>.
                        </div>
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