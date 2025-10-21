import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/auth-context";
import { Loading } from "@/components/ui/loading";

interface ProtectedRouteProps {
    children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
    const { user, isLoading } = useAuth();
    const location = useLocation();

    // Show loading while checking authentication
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loading text="Loading..." />
            </div>
        );
    }

    // If user is not authenticated, redirect to login with return URL
    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // If user is authenticated, render the protected content
    return <>{children}</>;
};
