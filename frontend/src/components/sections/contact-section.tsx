import {
    Card,
    CardContent,
    CardHeader,
} from "@/components/ui/card";
import { Building2, Clock, Mail, Phone } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const formSchema = z.object({
    firstName: z.string().min(2).max(255),
    lastName: z.string().min(2).max(255),
    email: z.string().email(),
    subject: z.string().min(2).max(255),
    message: z.string(),
});

interface ContactInfo {
    address: string;
    phoneNumbers: string[];
    emails: {
        sales: string;
        support: string;
    };
    hours: string;
}

interface ContactSectionProps {
    title?: string;
    subtitle?: string;
    description?: string;
    contactInfo?: ContactInfo;
    formTitle?: string;
    submitButtonText?: string;
    onSubmit?: (values: z.infer<typeof formSchema>) => void;
    className?: string;
}

const defaultContactInfo: ContactInfo = {
    address: "block 5 lot 28 E RODRIGUEZ HIGHWAY litex village san jose Rodriguez rizal",
    phoneNumbers: [
        "09171387768",
    ],
    emails: {
        sales: "crossinghomedepot@gmail.com",
        support: "crossinghomedepotsupport@gmail.com"
    },
    hours: "Monday – Friday: 8:00 AM – 5:30 PM"
};

export const ContactSection = ({
    title = "Connect With Us",
    subtitle = "Contact",
    description = "We're here to help you—whether it's sales, support, or any general inquiry, reach us through any of the options below.",
    contactInfo = defaultContactInfo,
    formTitle = "Send Us a Message",
    submitButtonText = "Send Message",
    onSubmit,
    className = ""
}: ContactSectionProps) => {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            firstName: "",
            lastName: "",
            email: "",
            subject: "",
            message: "",
        },
    });

    function handleSubmit(values: z.infer<typeof formSchema>) {
        if (onSubmit) {
            onSubmit(values);
        } else {
            // Default behavior - open email client
            const mailToLink = `mailto:crossinghomedepot@gmail.com?subject=${encodeURIComponent(
                values.subject
            )}&body=${encodeURIComponent(
                `Hello, I am ${values.firstName} ${values.lastName}. My email is ${values.email}.\n\n${values.message}`
            )}`;

            window.location.href = mailToLink;
        }
    }

    return (
        <section id="contact" className={`max-w-7xl mx-auto py-8 sm:py-16 ${className}`}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Info Panel */}
                <div>
                    <div className="mb-4">
                        <h2 className="text-lg text-primary mb-2 tracking-wider">{subtitle}</h2>
                        <h2 className="text-3xl md:text-4xl font-bold">{title}</h2>
                    </div>
                    <p className="mb-8 text-muted-foreground lg:w-5/6">
                        {description}
                    </p>


                    <div className="flex flex-col gap-6">
                        <div>
                            <div className="flex gap-2 mb-1 items-center"><Building2 /> <span className="font-bold">Address</span></div>
                            <div>{contactInfo.address}</div>
                        </div>
                        <div>
                            <div className="flex gap-2 mb-1 items-center"><Phone /> <span className="font-bold">Call Us</span></div>
                            <ul className="list-none">
                                {contactInfo.phoneNumbers.map((phone, index) => (
                                    <li key={index}>{phone}</li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <div className="flex gap-2 mb-1 items-center"><Mail /> <span className="font-bold">Email</span></div>
                            <div>Sales: {contactInfo.emails.sales}</div>
                            <div>Support: {contactInfo.emails.support}</div>
                        </div>
                        <div>
                            <div className="flex gap-2 mb-1 items-center"><Clock /> <span className="font-bold">Hours</span></div>
                            <div>{contactInfo.hours}</div>
                        </div>
                    </div>
                </div>

                {/* Contact Form Panel */}
                <Card className="bg-muted/60 dark:bg-card">
                    <CardHeader className="text-primary text-2xl">{formTitle}</CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(handleSubmit)} className="grid w-full gap-4">
                                <div className="flex flex-col md:flex-row gap-8">
                                    <FormField
                                        control={form.control}
                                        name="firstName"
                                        render={({ field }) => (
                                            <FormItem className="w-full">
                                                <FormLabel>First Name</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="First Name" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="lastName"
                                        render={({ field }) => (
                                            <FormItem className="w-full">
                                                <FormLabel>Last Name</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Last Name" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Email</FormLabel>
                                            <FormControl>
                                                <Input type="email" placeholder="you@example.com" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="subject"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Subject</FormLabel>
                                            <FormControl>
                                                <Input placeholder="How can we assist you?" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="message"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Message</FormLabel>
                                            <FormControl>
                                                <Textarea rows={5} placeholder="Your message..." className="resize-none" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <Button className="mt-4 w-full">{submitButtonText}</Button>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
            </div>
        </section>
    );
};