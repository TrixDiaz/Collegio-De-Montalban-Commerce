import { ArrowUpRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface HeroProps {
    badge?: string;
    heading?: string;
    description?: string;
    buttons?: {
        primary?: {
            text: string;
            url: string;
        };
        secondary?: {
            text: string;
            url: string;
        };
    };
    image?: {
        src: string;
        alt: string;
    };
}

const HeroSection = ({
    badge = "✨ Tile Depot",
    heading = "Tile Depot",
    description = "Finely crafted tiles built with React, Tailwind and Shadcn UI. Developers can copy and paste these tiles directly into their project.",
    buttons = {
        primary: {
            text: "Discover all Tiles",
            url: "/catalog",
        },
    },
    image = {
        src: "/images/interior-tile.jpg",
        alt: "Hero section demo image showing interface tiles",
    },
}: HeroProps) => {
    return (
        <section className="py-12">
            <div className="container">
                <div className="grid items-center gap-8 lg:grid-cols-2">
                    <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
                        {badge && (
                            <Badge variant="outline">
                                {badge}
                                <ArrowUpRight className="ml-2 size-4" />
                            </Badge>
                        )}
                        <h1 className="my-6 text-pretty text-4xl font-bold lg:text-6xl">
                            {heading}
                        </h1>
                        <p className="text-muted-foreground mb-8 max-w-xl lg:text-xl">
                            {description}
                        </p>
                        <div className="flex w-full flex-col justify-center gap-2 sm:flex-row lg:justify-start">
                            {buttons.primary && (
                                <Button asChild className="w-full sm:w-auto">
                                    <a href={buttons.primary.url}>{buttons.primary.text}</a>
                                </Button>
                            )}
                        </div>
                    </div>
                    <img
                        src={image.src}
                        alt={image.alt}
                        className="max-h-96 w-full rounded-md object-cover"
                    />
                </div>
            </div>
        </section>
    );
};

export { HeroSection };
