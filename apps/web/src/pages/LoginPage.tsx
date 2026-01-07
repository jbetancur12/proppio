import { useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useMutation } from "@tanstack/react-query"
import { api } from "../api/client"
import { useAuth } from "../contexts/AuthContext"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { Building2 } from "lucide-react"

const formSchema = z.object({
    email: z.string().email("Correo inválido"),
    password: z.string().min(6, "Mínimo 6 caracteres"),
})

export function LoginPage() {
    const { login } = useAuth()
    const navigate = useNavigate()

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema as any),
        defaultValues: {
            email: "admin@demo.com",
            password: "",
        },
    })

    const mutation = useMutation({
        mutationFn: async (values: z.infer<typeof formSchema>) => {
            const res = await api.post("/auth/login", values)
            return res.data
        },
        onSuccess: (data) => {
            login(data.token, data.user)
            toast.success("¡Bienvenido!")
            navigate("/dashboard")
        },
        onError: () => {
            toast.error("Credenciales inválidas")
        },
    })

    function onSubmit(values: z.infer<typeof formSchema>) {
        mutation.mutate(values)
    }

    return (
        <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
            {/* Left: Form */}
            <div className="flex flex-col justify-center items-center p-8 bg-white">
                <div className="w-full max-w-md space-y-8">
                    <div className="text-center lg:text-left">
                        <div className="inline-flex items-center justify-center lg:justify-start gap-2 text-indigo-600 mb-6">
                            <div className="p-2 bg-indigo-100 rounded-lg"><Building2 size={32} /></div>
                            <span className="text-2xl font-bold tracking-tight">Rent Manager</span>
                        </div>
                        <h2 className="text-3xl font-bold tracking-tight text-gray-900">Bienvenido de nuevo</h2>
                        <p className="mt-2 text-sm text-gray-500">
                            Inicia sesión para gestionar tus propiedades.
                        </p>
                    </div>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Correo Electrónico</FormLabel>
                                        <FormControl>
                                            <Input placeholder="usuario@ejemplo.com" {...field} className="h-11 bg-gray-50 border-gray-200 focus:bg-white transition-all" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Contraseña</FormLabel>
                                        <FormControl>
                                            <Input type="password" placeholder="••••••••" {...field} className="h-11 bg-gray-50 border-gray-200 focus:bg-white transition-all" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="flex items-center justify-between text-sm">
                                <label className="flex items-center gap-2 text-gray-600 cursor-pointer select-none">
                                    <input type="checkbox" className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                                    Recordarme
                                </label>
                                <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500">¿Olvidaste tu contraseña?</a>
                            </div>

                            <Button type="submit" className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 text-base shadow-lg shadow-indigo-200 transition-all" disabled={mutation.isPending}>
                                {mutation.isPending ? "Entrando..." : "Iniciar Sesión"}
                            </Button>
                        </form>
                    </Form>

                    <p className="text-center text-sm text-gray-500">
                        ¿No tienes cuenta? <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500">Contactar Ventas</a>
                    </p>
                </div>
            </div>

            {/* Right: Feature/Image */}
            <div className="hidden lg:flex flex-col justify-center p-12 bg-indigo-900 text-white relative overflow-hidden">
                {/* Abstract background elements */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -mr-20 -mt-20"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -ml-20 -mb-20"></div>

                <div className="relative z-10 max-w-lg mx-auto text-center space-y-6">
                    <div className="mx-auto w-24 h-24 bg-white/10 backdrop-blur-lg rounded-2xl flex items-center justify-center mb-8 border border-white/20 shadow-2xl">
                        <Building2 size={48} className="text-indigo-200" />
                    </div>
                    <h2 className="text-4xl font-bold">Gestiona tus propiedades con facilidad</h2>
                    <p className="text-lg text-indigo-200 leading-relaxed">
                        Optimiza tu negocio de rentas con nuestra plataforma todo en uno.
                        Controla pagos, inquilinos y mantenimiento en un solo lugar.
                    </p>

                    <div className="pt-8 flex gap-4 justify-center">
                        <div className="p-4 rounded-xl bg-white/5 backdrop-blur border border-white/10">
                            <div className="text-2xl font-bold">150+</div>
                            <div className="text-xs text-indigo-300 uppercase tracking-wider">Propiedades</div>
                        </div>
                        <div className="p-4 rounded-xl bg-white/5 backdrop-blur border border-white/10">
                            <div className="text-2xl font-bold">$2M+</div>
                            <div className="text-xs text-indigo-300 uppercase tracking-wider">Ingresos</div>
                        </div>
                        <div className="p-4 rounded-xl bg-white/5 backdrop-blur border border-white/10">
                            <div className="text-2xl font-bold">98%</div>
                            <div className="text-xs text-indigo-300 uppercase tracking-wider">Ocupación</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
