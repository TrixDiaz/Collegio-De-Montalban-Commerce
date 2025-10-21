import { BrowserRouter, Route, Routes } from "react-router-dom"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/contexts/auth-context"
import { CartProvider } from "@/contexts/cart-context"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { Catalog } from "@/pages/catalog"
import { Home } from "@/pages/home"
import { Login } from "@/pages/login"
import { Cart } from "@/pages/cart"
import { ProductDescription } from "@/pages/product-description"
import { AccountPage } from "@/pages/account"
import { PaymentSuccess } from "@/pages/payment-success"
import { PaymentFail } from "@/pages/payment-fail"
import { GallerySection } from "./components/sections/gallery-section"
import { ContactSection } from "./components/sections/contact-section"
import { ProtectedRoute } from "@/components/ProtectedRoute"

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <AuthProvider>
          <CartProvider>
            <Navbar />
            <main>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/catalog" element={<Catalog />} />
                <Route path="/product/:id" element={<ProductDescription />} />
                <Route path="/gallery" element={<GallerySection />} />
                <Route path="/contact" element={<ContactSection />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/login" element={<Login />} />
                <Route path="/payment/success" element={<PaymentSuccess />} />
                <Route path="/payment/fail" element={<PaymentFail />} />
                <Route path="/account" element={
                  <ProtectedRoute>
                    <AccountPage />
                  </ProtectedRoute>
                } />
              </Routes>
            </main>
            <Footer />
          </CartProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}

export default App
