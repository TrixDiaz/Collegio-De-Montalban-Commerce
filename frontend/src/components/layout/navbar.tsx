import { LogIn, Menu, ShoppingBag, LogOut, Search, UserCircle } from "lucide-react";
import { useState } from "react";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { ModeToggle } from "@/components/mode-toggle";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { SearchDialog } from "@/components/search-dialog";
import { useAuth } from "@/contexts/auth-context";
import { useCart } from "@/contexts/cart-context";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

interface GuestRouteProps {
    href: string;
    label: string;
}

interface FeatureProps {
    title: string;
    description: string;
}

const guestRouteList: GuestRouteProps[] = [
    {
        href: "/",
        label: "Home",
    },
    {
        href: "/catalog",
        label: "Products",
    },
    {
        href: "/gallery",
        label: "Gallery",
    },
    {
        href: "/contact",
        label: "Contact",
    }
];

const featureList: FeatureProps[] = [
    {
        title: "Flexibility & Fun with everyone",
        description: "We keep our vision and mission in mind while we flex with the ever-changing demands of our customers.",
    },
    {
        title: "Mission",
        description:
            "In support of our Corporate Vision, Fastlink is committed to providing a continuously growing wide array of Best of Breed ICT products and solutions to be supported by a Team of Principal Certified-Competent Workforce.",
    },
    {
        title: "Vision",
        description:
            "Fastlink envisions itself to be the Philippines' most Comprehensive and Innovative provider of ICT Solutions by having and offering the widest array of facilities and Customer-Centric Services to address the market's dynamic and unique requirements.",
    },
];

export const Navbar = () => {
    const [ isOpen, setIsOpen ] = useState(false);
    const [ searchOpen, setSearchOpen ] = useState(false);
    const { user, logout } = useAuth();
    const { getTotalItems } = useCart();
    const cartItemCount = getTotalItems();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/");
    };

    return (
        <header className="shadow-inner bg-opacity-15 w-[90%] md:w-[70%] lg:w-[75%] lg:max-w-screen-xl top-5 mx-auto sticky border border-secondary z-50 rounded-2xl flex items-center p-2 bg-card mt-4">
            {/* Left Section - Logo */}
            <div className="flex-1 flex justify-start items-center">
                <Link to="/#hero" className="font-bold text-lg flex items-center">
                    <span>Tile Depot</span>
                </Link>
            </div>

            {/* Center Section - Navigation */}
            <div className="flex-1 flex justify-center items-center">
                {/* Mobile */}
                <div className="flex items-center lg:hidden">
                    <Sheet open={isOpen} onOpenChange={setIsOpen}>
                        <SheetTrigger asChild>
                            <Menu
                                onClick={() => setIsOpen(!isOpen)}
                                className="cursor-pointer lg:hidden"
                            />
                        </SheetTrigger>

                        <SheetContent
                            side="left"
                            className="flex flex-col justify-between rounded-tr-2xl rounded-br-2xl bg-card border-secondary"
                        >
                            <div>
                                <SheetHeader className="mb-4 ml-4">
                                    <SheetTitle className="flex items-center">
                                        <Link to="/" className="flex items-center">
                                            <img src="/images/interior-tile.jpg" alt="Tile Depot" width={100} height={100} />
                                        </Link>
                                    </SheetTitle>
                                    <SheetDescription>
                                        Navigate through our website sections
                                    </SheetDescription>
                                </SheetHeader>

                                <div className="flex flex-col gap-2">
                                    {guestRouteList.map(({ href, label }) => (
                                        <Button
                                            key={href}
                                            onClick={() => setIsOpen(false)}
                                            asChild
                                            variant="ghost"
                                            className="justify-start text-base"
                                        >
                                            <Link to={href}>{label}</Link>
                                        </Button>
                                    ))}
                                </div>
                            </div>

                            <SheetFooter className="flex-col sm:flex-col justify-start items-start">
                                <Separator className="mb-2" />
                                <div className="flex flex-row items-center gap-2">
                                    <ModeToggle />
                                    <Link to="/cart">
                                        <Button variant="ghost" className="relative">
                                            <ShoppingBag className="size-4" />
                                            {cartItemCount > 0 && (
                                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                                    {cartItemCount}
                                                </span>
                                            )}
                                        </Button>
                                    </Link>
                                    {user ? (
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="p-1">
                                                    <Avatar className="h-6 w-6">
                                                        <AvatarImage src={user.picture} />
                                                        <AvatarFallback>
                                                            {user.name.charAt(0).toUpperCase()}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-48">
                                                <DropdownMenuItem asChild>
                                                    <Link to="/account" className="flex items-center">
                                                        <UserCircle className="mr-2 h-4 w-4" />
                                                        <span>Account</span>
                                                    </Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    className="text-red-600 hover:text-red-700 cursor-pointer"
                                                    onClick={handleLogout}
                                                >
                                                    <LogOut className="mr-2 h-4 w-4" />
                                                    <span>Logout</span>
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    ) : (
                                        <Link to="/login">
                                            <Button variant="ghost">
                                                <LogIn className="size-4" />
                                            </Button>
                                        </Link>
                                    )}
                                </div>
                            </SheetFooter>
                        </SheetContent>
                    </Sheet>
                </div>

                {/* Desktop */}
                <NavigationMenu className="hidden lg:block mx-auto">
                    <NavigationMenuList className="flex items-center gap-2">
                        <NavigationMenuItem>
                            <NavigationMenuTrigger className="bg-card text-base">
                                Features
                            </NavigationMenuTrigger>
                            <NavigationMenuContent>
                                <div className="grid w-[600px] grid-cols-2 gap-5 p-4">
                                    <img
                                        src="/images/interior-tile.jpg"
                                        alt="Tile Depot"
                                        className="h-64 w-full rounded-md object-cover"
                                        width={600}
                                        height={600}
                                    />
                                    <ul className="flex flex-col gap-2">
                                        {featureList.map(({ title, description }) => (
                                            <li
                                                key={title}
                                                className="rounded-md p-3 text-sm hover:bg-muted"
                                            >
                                                <p className="mb-1 font-semibold leading-none text-foreground">
                                                    {title}
                                                </p>
                                                <p className="line-clamp-2 text-muted-foreground">
                                                    {description}
                                                </p>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </NavigationMenuContent>
                        </NavigationMenuItem>

                        {guestRouteList.map(({ href, label }) => (
                            <NavigationMenuItem key={href}>
                                <NavigationMenuLink asChild>
                                    <Link to={href} className="text-base px-2">
                                        {label}
                                    </Link>
                                </NavigationMenuLink>
                            </NavigationMenuItem>
                        ))}
                    </NavigationMenuList>
                </NavigationMenu>
            </div>

            {/* Right Section - Action Buttons */}
            <div className="flex-1 flex justify-end items-center">
                {/* Mobile Search Button */}
                <div className="flex lg:hidden mr-2">
                    <Button variant="ghost" onClick={() => setSearchOpen(true)}>
                        <Search className="size-4" />
                    </Button>
                </div>

                <div className="hidden lg:flex">
                    <div className="flex flex-row items-center gap-2">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="ghost" onClick={() => setSearchOpen(true)}>
                                    <Search className="size-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p className="text-xs">Search</p>
                            </TooltipContent>
                        </Tooltip>
                    </div>
                    <div className="flex flex-row items-center gap-2">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Link to="/cart">
                                    <Button variant="ghost" className="relative">
                                        <ShoppingBag className="size-4" />
                                        {cartItemCount > 0 && (
                                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                                {cartItemCount}
                                            </span>
                                        )}
                                    </Button>
                                </Link>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p className="text-xs">Cart ({cartItemCount})</p>
                            </TooltipContent>
                        </Tooltip>
                    </div>
                    <div className="flex flex-row items-center gap-2">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <ModeToggle />
                            </TooltipTrigger>
                            <TooltipContent>
                                <p className="text-xs">Toggle theme</p>
                            </TooltipContent>
                        </Tooltip>
                    </div>
                    <div className="flex flex-row items-center gap-2">
                        {user ? (
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="p-1">
                                                <Avatar className="h-6 w-6">
                                                    <AvatarImage src={user.picture} />
                                                    <AvatarFallback>
                                                        {user.name.charAt(0).toUpperCase()}
                                                    </AvatarFallback>
                                                </Avatar>
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-48">
                                            <DropdownMenuItem asChild>
                                                <Link to="/account" className="flex items-center">
                                                    <UserCircle className="mr-2 h-4 w-4" />
                                                    <span>Account</span>
                                                </Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem
                                                className="text-red-600 hover:text-red-700 cursor-pointer"
                                                onClick={handleLogout}
                                            >
                                                <LogOut className="mr-2 h-4 w-4" />
                                                <span>Logout</span>
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p className="text-xs">{user.name}</p>
                                </TooltipContent>
                            </Tooltip>
                        ) : (
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Link to="/login">
                                        <Button variant="ghost">
                                            <LogIn className="size-4" />
                                        </Button>
                                    </Link>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p className="text-xs">Sign in</p>
                                </TooltipContent>
                            </Tooltip>
                        )}
                    </div>
                </div>
            </div>

            {/* Search Dialog */}
            <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
        </header>
    );
};